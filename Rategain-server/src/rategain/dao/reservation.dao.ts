import { Prisma } from '../../../prisma/generated/prisma/client';
import { prisma } from '../../configs/db.config';
import {
  PreCheckResponseBody,
  CommitBookingResult,
  CancelResponseBody,
  CommitDto,
  CancellationSummary,
} from '../types';

const toDecimal = (val?: string | number | null): Prisma.Decimal | null => {
  if (val === null || val === undefined || val === '') return null;
  const n = parseFloat(String(val));
  return isNaN(n) ? null : new Prisma.Decimal(n);
};

export const createPendingReservation = async (
  demandBookingId: string,
  dto: CommitDto,
  preCheck: PreCheckResponseBody,
  cancelSummary: CancellationSummary,
): Promise<string> => {
  const primaryGuest =
    dto.RoomSelection[0]?.Guest?.find((g) => g.Primary) ??
    dto.RoomSelection[0]?.Guest?.[0];

  const policyRows = cancelSummary.policies.map((p) => ({
    amount:           new Prisma.Decimal(p.amount),
    windowFrom:       p.windowFrom,
    windowTo:         p.windowTo,
    amendCharge:      p.amendCharge != null ? new Prisma.Decimal(p.amendCharge) : null,
    amendRestricted:  p.amendRestricted,
    cancelRestricted: p.cancelRestricted,
    noShowPolicy:     p.noShowPolicy,
  }));

  const reservation = await prisma.reservation.upsert({
    where: { demandBookingId },
    create: {
      demandBookingId,
      propertyID:       dto.propertyID,
      propertyCode:     dto.PropertyCode,
      brandCode:        dto.BrandCode,
      hotelName:        preCheck.hotelName,
      checkin:          dto.checkin,
      checkout:         dto.checkout,
      currency:         preCheck.currency,
      totalNet:         new Prisma.Decimal(preCheck.totalNet),
      msp:              toDecimal(preCheck.Msp),
      commissionAmt:    toDecimal(preCheck.CommissionAmt),
      commissionPct:    toDecimal(preCheck.CommissionPct),
      status:           'PENDING',
      guestFirstName:   primaryGuest?.FirstName ?? null,
      guestLastName:    primaryGuest?.LastName  ?? null,
      guestEmail:       primaryGuest?.Email     ?? null,
      guestPhone:       primaryGuest?.Phone     ?? null,
      canCancel:        preCheck.modificationPolicies.cancellation,
      canModify:        preCheck.modificationPolicies.modification,
      isNonRefundable:  cancelSummary.isNonRefundable,
      preCheckSnapshot: preCheck as unknown as Prisma.InputJsonValue,
      cancellationPolicies: { create: policyRows },
    },
    update: {
      totalNet:         new Prisma.Decimal(preCheck.totalNet),
      msp:              toDecimal(preCheck.Msp),
      commissionAmt:    toDecimal(preCheck.CommissionAmt),
      commissionPct:    toDecimal(preCheck.CommissionPct),
      isNonRefundable:  cancelSummary.isNonRefundable,
      preCheckSnapshot: preCheck as unknown as Prisma.InputJsonValue,
      status:           'PENDING',
      updatedAt:        new Date(),
      cancellationPolicies: {
        deleteMany: {},
        create:     policyRows,
      },
    },
  });

  return reservation.id;
};

export const confirmReservation = async (
  demandBookingId: string,
  booking: CommitBookingResult,
): Promise<void> => {
  await prisma.reservation.update({
    where: { demandBookingId },
    data: {
      confirmationNumber: booking.confirmationNumber,
      reservationId:      booking.reservationId,
      hotelName:          booking.hotel.hotelName,
      status:             'CONFIRMED',
      totalNet:           new Prisma.Decimal(booking.totalNet),
      msp:                toDecimal(booking.Msp),
      commissionAmt:      toDecimal(booking.CommissionAmt),
      commissionPct:      toDecimal(booking.CommissionPct),
      canCancel:          booking.modificationPolicies.cancellation,
      canModify:          booking.modificationPolicies.modification,
      voucherRemark:      booking.voucherRemark ?? null,
      commitSnapshot:     booking as unknown as Prisma.InputJsonValue,
      rooms: {
        create: booking.hotel.rooms.map((room) => ({
          roomCode:       room.RoomCode,
          roomName:       room.name,
          roomTypeCode:   room.RoomCode,
          numberOfRooms:  room.rates[0]?.rooms    ?? 1,
          numberOfAdults: room.rates[0]?.adults   ?? 1,
          numberOfChild:  room.rates[0]?.children ?? 0,
          boardCode:      room.rates[0]?.boardCode ?? null,
          boardName:      room.rates[0]?.boardName ?? null,
          roomRate:       new Prisma.Decimal(booking.totalNet),
          rateKey:        room.rates[0]?.rateKey ?? '',
          status:         room.status,
          paxes: {
            create: room.paxes.map((pax) => ({
              roomId:  pax.roomId,
              type:    pax.type,
              name:    pax.name    ?? null,
              surname: pax.surname ?? null,
              age:     pax.age    ?? null,
            })),
          },
        })),
      },
    },
  });
};

export const failReservation = async (
  demandBookingId: string,
  reason: string,
): Promise<void> => {
  await prisma.reservation.update({
    where: { demandBookingId },
    data: {
      status:         'FAILED',
      commitSnapshot: { error: reason } as unknown as Prisma.InputJsonValue,
      updatedAt:      new Date(),
    },
  });
};

export const cancelReservation = async (
  confirmationNumber: string,
  cancelResponse: CancelResponseBody,
): Promise<void> => {
  await prisma.reservation.update({
    where: { confirmationNumber },
    data: {
      status:             'CANCELLED',
      cancellationNumber: cancelResponse.cancellationNumber,
      cancelSnapshot:     cancelResponse as unknown as Prisma.InputJsonValue,
      updatedAt:          new Date(),
    },
  });
};

export const findReservationByDemandId = async (demandBookingId: string) => {
  return prisma.reservation.findUnique({
    where:   { demandBookingId },
    include: {
      rooms:               { include: { paxes: true } },
      cancellationPolicies: { orderBy: { windowFrom: 'asc' } },
    },
  });
};

export const findReservationByConfirmationNumber = async (confirmationNumber: string) => {
  return prisma.reservation.findUnique({
    where:   { confirmationNumber },
    include: {
      rooms:               { include: { paxes: true } },
      cancellationPolicies: { orderBy: { windowFrom: 'asc' } },
    },
  });
};