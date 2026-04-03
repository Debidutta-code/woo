import axios from 'axios';
import config from '../../configs/env.configs';
import {
    PreCheckRequest,
    PreCheckApiResponse,
    PreCheckResponseBody,
    PreCheckCancellationPolicy,
    CommitRequest,
    CommitApiResponse,
    CommitBookingResult,
    CancelRequest,
    CancelApiResponse,
    CancellationSummary,
    CancellationPolicyRow,
    PreCheckDto,
    CommitDto,
    CancelDto,
} from '../types';
import {
    createPendingReservation,
    confirmReservation,
    failReservation,
    cancelReservation as cancelReservationDao,
    findReservationByConfirmationNumber,
} from '../dao';

const getHeaders = () => ({
    ApiKey: config.rategainApiKey!,
    ApiSecret: config.rategainSecretKey!,
    'Content-Type': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
});

const BASE = config.rategainBaseUrl;
const newId = () => crypto.randomUUID();

export const parseCancellationPolicy = (
    policies: PreCheckCancellationPolicy[],
    totalNet: string,
): CancellationSummary => {
    const total = parseFloat(totalNet);

    const isNonRefundable = policies.some((p) => p.cancelRestricted === true);

    const rows: CancellationPolicyRow[] = policies.map((p) => ({
        amount: isNonRefundable ? total : parseFloat(p.amount),
        windowFrom: new Date(p.from),
        windowTo: p.toDate ? new Date(p.toDate) : null,
        amendCharge: p.amendCharge != null ? parseFloat(p.amendCharge) : null,
        amendRestricted: p.amendRestricted ?? null,
        cancelRestricted: p.cancelRestricted ?? null,
        noShowPolicy: p.noShowPolicy ?? null,
    }));

    return { isNonRefundable, policies: rows };
};

// Helper — computes live cancel status from stored/fresh policy rows
const computePenaltyInfo = (
    policies: { amount: { toString(): string }; windowFrom: Date; windowTo: Date | null }[],
    totalNet: string,
) => {
    const now = new Date();
    const total = parseFloat(totalNet);

    const sorted = [...policies].sort(
        (a, b) => a.windowFrom.getTime() - b.windowFrom.getTime(),
    );

    const activePolicy = sorted.find(
        (p) => now >= p.windowFrom && (p.windowTo === null || now <= p.windowTo),
    );

    const isFreeNow = !!activePolicy && parseFloat(activePolicy.amount.toString()) === 0;
    const penaltyAmt = activePolicy ? parseFloat(activePolicy.amount.toString()) : total;

    const freePolicies = sorted.filter((p) => parseFloat(p.amount.toString()) === 0);
    const lastFreeWindow = freePolicies[freePolicies.length - 1];
    const freeCancelDeadline =
        lastFreeWindow?.windowTo && lastFreeWindow.windowTo > now
            ? lastFreeWindow.windowTo
            : null;

    return {
        willBeCharged: !isFreeNow,
        penaltyAmt: isFreeNow ? 0 : penaltyAmt,
        freeCancelDeadline,
    };
};

export const preCheckReservation = async (
    dto: PreCheckDto,
): Promise<{ preCheck: PreCheckResponseBody; cancelSummary: CancellationSummary }> => {
    const payload: PreCheckRequest = {
        BookReservation: {
            ResStatus: 1,
            CurrencyCode: dto.CurrencyCode ?? 'USD',
            GuaranteeMethod: 'CreditCard',
            GuaranteeType: 'Guarantee',
            propertyID: dto.propertyID,
            PropertyCode: dto.PropertyCode,
            BrandCode: dto.BrandCode,
            checkin: dto.checkin,
            checkout: dto.checkout,
            EchoToken: dto.EchoToken ?? `BOOKING-${Date.now()}`,
            Session: dto.Session ?? `SESSION-${Date.now()}`,
            CountryCode: dto.CountryCode ?? 'US',
            Currency: dto.CurrencyCode ?? 'USD',
            RoomSelection: dto.RoomSelection,
        },
    };

    const response = await axios.post<PreCheckApiResponse>(
        `${BASE}/api/SmartDistribution/PreCheckReservation`,
        payload,
        { headers: getHeaders() },
    );
    const data = response.data;

    if (!data.status || !data.body?.preCheckResponse) {
        throw new Error(
            `PreCheck failed: ${data.description ?? 'Unknown error'} (statusCode: ${data.statusCode})`,
        );
    }

    const preCheck = data.body.preCheckResponse;

    const allPolicies = preCheck.rooms
        .flatMap((r) => r.rates)
        .flatMap((rate) => rate.cancellationPolicies);

    const cancelSummary = parseCancellationPolicy(allPolicies, preCheck.totalNet);

    return { preCheck, cancelSummary };
};

export const commitReservation = async (dto: CommitDto): Promise<CommitBookingResult> => {
  const sessionId  = dto.Session   ?? `SESSION-${Date.now()}`;
  const preCheckEcho = `PRECHECK-${Date.now()}-${crypto.randomUUID()}`;
  const commitEcho   = `COMMIT-${Date.now()}-${crypto.randomUUID()}`;

  const { preCheck, cancelSummary } = await preCheckReservation({
    propertyID:    dto.propertyID,
    PropertyCode:  dto.PropertyCode,
    BrandCode:     dto.BrandCode,
    checkin:       dto.checkin,
    checkout:      dto.checkout,
    CurrencyCode:  dto.CurrencyCode,
    CountryCode:   dto.CountryCode,
    Session:       sessionId,
    EchoToken:     preCheckEcho,   
    RoomSelection: dto.RoomSelection,
  });

  if (preCheck.paymentDataRequired && !dto.CreditCard) {
    throw new Error(
      'This rate requires credit card payment (paymentDataRequired is true). Please provide CreditCard details.',
    );
  }

  // DemandBookingId comes from the DTO — caller owns it, not the service
  await createPendingReservation(dto.DemandBookingId, dto, preCheck, cancelSummary);

  const preCheckRateMap = new Map<string, string>();
  for (const room of preCheck.rooms) {
    for (const rate of room.rates) {
      if (rate.allocationDetails) preCheckRateMap.set(rate.rateKey, rate.allocationDetails);
    }
  }

  const mergedRoomSelection = dto.RoomSelection.map((room) => {
    const allocation = preCheckRateMap.get(room.RoomSelectionKey);
    return {
      ...room,
      ...(allocation ? { allocationDetails: allocation } : {}),
      RoomRate: parseFloat(preCheck.totalNet),
    };
  });

  const now = new Date().toISOString();

  const payload: CommitRequest = {
    BookReservation: {
      ResStatus:       1,
      DemandBookingId: dto.DemandBookingId,  
      CurrencyCode:    dto.CurrencyCode ?? 'USD',
      GuaranteeMethod: 'CreditCard',
      GuaranteeType:   'Guarantee',
      TimeStamp:       now,
      checkin:         dto.checkin,
      checkout:        dto.checkout,
      ReservationDate: now,
      propertyID:      dto.propertyID,
      PropertyCode:    dto.PropertyCode,
      BrandCode:       dto.BrandCode,
      EchoToken:       commitEcho,           // different echo from preCheck
      BookingRate:     parseFloat(preCheck.totalNet),
      Session:         sessionId,
      CountryCode:     dto.CountryCode ?? 'US',
      Currency:        dto.CurrencyCode ?? 'USD',
      ...(dto.CreditCard ? { CreditCard: dto.CreditCard } : {}),
      RoomSelection:   mergedRoomSelection,
    },
  };

  try {
    const response = await axios.post<CommitApiResponse>(
      `${BASE}/api/SmartDistribution/CommitReservation`,
      payload,
      { headers: getHeaders() },
    );

    const data = response.data;

    if (!data.status || !data.body?.booking) {
      const reason = data.description ?? 'Commit returned no booking object';
      await failReservation(dto.DemandBookingId, reason);
      throw new Error(`CommitReservation failed: ${reason} (statusCode: ${data.statusCode})`);
    }

    await confirmReservation(dto.DemandBookingId, data.body.booking);
    return data.body.booking;

  } catch (err: any) {
    if (!err.message?.startsWith('CommitReservation failed')) {
      await failReservation(
        dto.DemandBookingId,
        err?.response?.data?.description ?? err.message,
      ).catch(() => {});
    }
    throw err;
  }
};

export const cancelReservation = async (dto: CancelDto) => {
    const existing = await findReservationByConfirmationNumber(dto.confirmationNumber);

    if (!existing)
        throw new Error(`No reservation found with confirmationNumber: ${dto.confirmationNumber}`);
    if (existing.status === 'CANCELLED')
        throw new Error(`Reservation ${dto.confirmationNumber} is already cancelled.`);
    if (existing.isNonRefundable)
        throw new Error(`Reservation ${dto.confirmationNumber} is non-refundable and cannot be cancelled.`);
    if (existing.canCancel === false)
        throw new Error(`Reservation ${dto.confirmationNumber} cannot be cancelled per the booking modification policy.`);

    const penaltyInfo = computePenaltyInfo(
        existing.cancellationPolicies,
        existing.totalNet.toString(),
    );

    const payload: CancelRequest = {
        ConfirmationNumber: dto.confirmationNumber,
        DemandCancelId: dto.DemandCancelId,
        ReservationId: dto.reservationId,
        EchoToken: dto.EchoToken ?? `CANCEL-${newId()}`,
        PropertyId: dto.PropertyId || existing.propertyID,
        TimeStamp: new Date().toISOString(),
        PropertyCode: dto.PropertyCode || existing.propertyCode,
        BrandCode: dto.BrandCode || existing.brandCode,
    };

    const response = await axios.post<CancelApiResponse>(
        `${BASE}/api/SmartDistribution/CancelReservation`,
        payload,
        { headers: getHeaders() },
    );

    const data = response.data;

    if (!data.status || !data.body) {
        throw new Error(
            `CancelReservation failed: ${data.description ?? 'Unknown error'} (statusCode: ${data.statusCode})`,
        );
    }

    await cancelReservationDao(dto.confirmationNumber, data.body);

    return { ...data.body, penaltyInfo };
};