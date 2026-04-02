import { Request, Response } from 'express';
import { PreCheckDto, CommitDto, CancelDto } from '../types';
import {
  preCheckReservation,
  commitReservation,
  cancelReservation,
} from '../services';

export const preCheckReservationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto: PreCheckDto = req.body;

    if (!dto.propertyID || !dto.PropertyCode || !dto.BrandCode || !dto.checkin || !dto.checkout) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: propertyID, PropertyCode, BrandCode, checkin, checkout',
      });
      return;
    }

    if (!dto.RoomSelection?.length) {
      res.status(400).json({ success: false, message: 'RoomSelection must not be empty' });
      return;
    }

    const { preCheck, cancelSummary } = await preCheckReservation(dto);

    // Compute human-readable cancel info from the policy rows for the response
    const now          = new Date();
    const total        = parseFloat(preCheck.totalNet);
    const sortedRows   = [...cancelSummary.policies].sort(
      (a, b) => a.windowFrom.getTime() - b.windowFrom.getTime(),
    );
    const activePolicy = sortedRows.find(
      (p) => now >= p.windowFrom && (p.windowTo === null || now <= p.windowTo),
    );
    const isFreeCancel      = !!activePolicy && activePolicy.amount === 0;
    const penaltyIfCancelNow = activePolicy ? activePolicy.amount : total;
    const lastFree           = [...sortedRows].filter((p) => p.amount === 0).pop();
    const freeCancelDeadline =
      lastFree?.windowTo && lastFree.windowTo > now ? lastFree.windowTo : null;

    res.status(200).json({
      success: true,
      message: 'PreCheck passed — rate and availability confirmed',
      data: {
        hotelName:            preCheck.hotelName,
        checkin:              preCheck.checkin,
        checkout:             preCheck.checkout,
        currency:             preCheck.currency,
        totalNet:             preCheck.totalNet,
        Msp:                  preCheck.Msp,
        CommissionAmt:        preCheck.CommissionAmt,
        CommissionPct:        preCheck.CommissionPct,
        paymentDataRequired:  preCheck.paymentDataRequired,
        modificationPolicies: preCheck.modificationPolicies,
        cancellationPolicy: {
          isNonRefundable:    cancelSummary.isNonRefundable,
          isFreeCancel,
          freeCancelDeadline,
          penaltyIfCancelNow,
          currency:           preCheck.currency,
          policies:           cancelSummary.policies.map((p) => ({
            amount:           p.amount,
            windowFrom:       p.windowFrom,
            windowTo:         p.windowTo,
            cancelRestricted: p.cancelRestricted,
            amendRestricted:  p.amendRestricted,
          })),
        },
        rooms: preCheck.rooms,
      },
    });
  } catch (error: any) {
    console.error('PreCheck failed:', error?.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'PreCheckReservation failed',
      error: error?.response?.data || error.message,
    });
  }
};

export const commitReservationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto: CommitDto = req.body;

    if (
      !dto.propertyID      ||
      !dto.PropertyCode    ||
      !dto.BrandCode       ||
      !dto.checkin         ||
      !dto.checkout
    ) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: DemandBookingId, propertyID, PropertyCode, BrandCode, checkin, checkout',
      });
      return;
    }

    if (!dto.RoomSelection?.length) {
      res.status(400).json({ success: false, message: 'RoomSelection must not be empty' });
      return;
    }

    const booking = await commitReservation(dto);

    res.status(200).json({
      success: true,
      message: 'Reservation confirmed successfully',
      data: {
        confirmationNumber:   booking.confirmationNumber,
        reservationId:        booking.reservationId,
        status:               booking.status,
        creationDate:         booking.creationDate,
        hotelName:            booking.hotel.hotelName,
        checkin:              booking.hotel.checkIn,
        checkout:             booking.hotel.checkout,
        totalNet:             booking.totalNet,
        currency:             booking.currency,
        Msp:                  booking.Msp,
        CommissionAmt:        booking.CommissionAmt,
        CommissionPct:        booking.CommissionPct,
        voucherRemark:        booking.voucherRemark,
        modificationPolicies: booking.modificationPolicies,
        holder: {
          name:    booking.holder.name,
          surname: booking.holder.surname,
          email:   booking.holder.email,
          phone:   booking.holder.phone,
        },
      },
    });
  } catch (error: any) {
    console.error('CommitReservation failed:', error?.response?.data || error.message);

    const isBusinessError =
      error.message?.includes('CommitReservation failed') ||
      error.message?.includes('paymentDataRequired');

    res.status(isBusinessError ? 422 : 500).json({
      success: false,
      message: isBusinessError ? error.message : 'CommitReservation failed unexpectedly',
      error:   error?.response?.data || error.message,
    });
  }
};

export const cancelReservationController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const dto: CancelDto = req.body;

    if (!dto.confirmationNumber || !dto.reservationId || !dto.DemandCancelId) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: confirmationNumber, reservationId, DemandCancelId',
      });
      return;
    }

    const result = await cancelReservation(dto);

    res.status(200).json({
      success: true,
      message: 'Reservation cancelled successfully',
      data: {
        cancellationNumber: result.cancellationNumber,
        confirmationNumber: result.confirmationNumber,
        status:             result.status,
        hotelName:          result.hotelName,
        roomType:           result.roomType,
        checkin:            result.checkin,
        checkout:           result.checkout,
        totalAmount:        result.totalAmount,
        currency:           result.currency,
        numberOfRooms:      result.numberOfRooms,
        guest: {
          firstName: result.guest.firstName,
          lastName:  result.guest.lastName,
        },
        penaltyInfo: {
          willBeCharged:      result.penaltyInfo?.willBeCharged      ?? false,
          penaltyAmt:         result.penaltyInfo?.penaltyAmt         ?? null,
          freeCancelDeadline: result.penaltyInfo?.freeCancelDeadline ?? null,
        },
      },
    });
  } catch (error: any) {
    console.error('CancelReservation failed:', error?.response?.data || error.message);

    const isBusinessError =
      error.message?.includes('already cancelled')         ||
      error.message?.includes('non-refundable')            ||
      error.message?.includes('cannot be cancelled')       ||
      error.message?.includes('No reservation found');

    res.status(isBusinessError ? 422 : 500).json({
      success: false,
      message: isBusinessError ? error.message : 'CancelReservation failed unexpectedly',
      error:   error?.response?.data || error.message,
    });
  }
};