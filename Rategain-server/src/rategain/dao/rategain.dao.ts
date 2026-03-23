import { Hotel, Product, Rate } from "../types";
import { prisma } from "../../configs/db.config";



export const upsertProperty = async (hotel: Hotel): Promise<string> => {
  const property = await prisma.property.upsert({
    where: { propertyId: hotel.propertyId },
    update: {
      propertyCode: hotel.propertyCode,
      brandCode: hotel.brandCode,
      propertyName: hotel.propertyName,
      description: hotel.description,
      accomodationType: hotel.accomodationType,
      accMultiDesc: hotel.accMultiDesc,
      accTypeDesc: hotel.accTypeDesc,
      phone: hotel.phone,
      ranking: hotel.ranking,
      currency: hotel.currency,
      startingPrice: hotel.price,
      categoryCode: hotel.categoryCode,
      categoryName: hotel.categoryName,
      categoryGroupCode: hotel.categoryGroupCode,
      categoryGroupDesc: hotel.categoryGroupDesc,
      chainCode: hotel.chainCode,
      chainName: hotel.chainName,
      s2c: hotel.s2C,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      hotelAmenities: hotel.hotelAmenities ?? [],
    },
    create: {
      propertyId: hotel.propertyId,
      propertyCode: hotel.propertyCode,
      brandCode: hotel.brandCode,
      propertyName: hotel.propertyName,
      description: hotel.description,
      accomodationType: hotel.accomodationType,
      accMultiDesc: hotel.accMultiDesc,
      accTypeDesc: hotel.accTypeDesc,
      phone: hotel.phone,
      ranking: hotel.ranking,
      currency: hotel.currency,
      startingPrice: hotel.price,
      categoryCode: hotel.categoryCode,
      categoryName: hotel.categoryName,
      categoryGroupCode: hotel.categoryGroupCode,
      categoryGroupDesc: hotel.categoryGroupDesc,
      chainCode: hotel.chainCode,
      chainName: hotel.chainName,
      s2c: hotel.s2C,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      hotelAmenities: hotel.hotelAmenities ?? [],
    },
  });

  await Promise.all([
    prisma.propertyAddress.deleteMany({ where: { propertyId: property.id } }),
    prisma.propertyImage.deleteMany({ where: { propertyId: property.id } }),
    prisma.propertyBoard.deleteMany({ where: { propertyId: property.id } }),
    prisma.propertyFacility.deleteMany({ where: { propertyId: property.id } }),
    prisma.propertySegment.deleteMany({ where: { propertyId: property.id } }),
  ]);

  await prisma.propertyAddress.create({
    data: {
      propertyId: property.id,
      address: hotel.address,
      street: hotel.street,
      city: hotel.city,
      postalCode: hotel.postalCode,
      destinationCode: hotel.destinationCode,
      destinationName: hotel.destinationName,
      countryCode: hotel.countryCode,
      countryName: hotel.countryName,
      stateCode: hotel.stateCode,
      stateName: hotel.stateName,
      zoneCode: hotel.zoneCode,
      zoneName: hotel.zoneName,
    },
  });

  if (hotel.images?.length) {
    await prisma.propertyImage.createMany({
      data: hotel.images
        .filter(Boolean)
        .map((url) => ({ propertyId: property.id, url })),
    });
  }

  if (hotel.hotelBoard?.length) {
    await prisma.propertyBoard.createMany({
      data: hotel.hotelBoard.map((b) => ({
        propertyId: property.id,
        code: b.code,
        name: b.name,
      })),
    });
  }

  if (hotel.hotelFacility?.length) {
    const facilityRows = hotel.hotelFacility.flatMap((group) =>
      group.facilityInfo.map((f) => ({
        propertyId: property.id,
        facilityGroupName: group.facilityGroupName,
        facilityName: f.facilityName,
        facilityDesc: f.facilityDescription,
      }))
    );
    await prisma.propertyFacility.createMany({ data: facilityRows });
  }

  if (hotel.hotelSegments?.length) {
    await prisma.propertySegment.createMany({
      data: hotel.hotelSegments.map((s) => ({
        propertyId: property.id,
        code: s.code,
        name: s.name,
      })),
    });
  }

  return property.id;
};

export const upsertRoomTypes = async (
  propertyId: string,
  products: Product[]
): Promise<void> => {
  for (const product of products) {
    const roomType = await prisma.roomType.upsert({
      where: {
        propertyId_roomCode: {
          propertyId,
          roomCode: product.roomCode,
        },
      },
      update: {
        name: product.name,
        nativeCurrency: product.nativeCurrency,
      },
      create: {
        propertyId,
        roomCode: product.roomCode,
        name: product.name,
        nativeCurrency: product.nativeCurrency,
      },
    });

    await Promise.all([
      prisma.roomImage.deleteMany({ where: { roomTypeId: roomType.id } }),
      prisma.roomRate.deleteMany({ where: { roomTypeId: roomType.id } }),
    ]);
    if (product.images?.length) {
      await prisma.roomImage.createMany({
        data: product.images
          .filter(Boolean)
          .map((url) => ({ roomTypeId: roomType.id, url })),
      });
    }

    for (const rate of product.rate ?? []) {
      await insertRoomRate(roomType.id, rate);
    }
  }
};

const insertRoomRate = async (roomTypeId: string, rate: Rate): Promise<void> => {
  const roomRate = await prisma.roomRate.create({
    data: {
      roomTypeId,
      rateKey: rate.rateKey,
      rateCode: rate.RateCode,
      rateType: rate.rateType,
      rateName: rate.rateName,
      totalPrice: rate.totalPrice,
      msp: rate.Msp ?? null,
      commissionAmt: rate.CommissionAmt ?? null,
      commissionPct: rate.CommissionPct ?? null,
      isMandatory: rate.isMandatory ?? null,
      allotment: rate.allotment ?? null,
      boardCode: rate.boardCode,
      boardName: rate.boardName,
      paymentType: rate.paymentType,
      packaging: rate.packaging ?? false,
      rateCommentsId: rate.rateCommentsId ?? null,
      rateComments: rate.rateComments ?? null,
      allocationDetails: rate.allocationDetails ?? null,
      status: rate.status ?? null,
      rooms: rate.rooms ?? null,
      adults: rate.adults ?? null,
      children: rate.children ?? null,
      childrenAges: rate.childrenAges ?? null,
    },
  });

  if (rate.cancellationPolicies?.length) {
    await prisma.cancellationPolicy.createMany({
      data: rate.cancellationPolicies.map((cp) => ({
        roomRateId: roomRate.id,
        amount: cp.amount,
        fromDate: new Date(cp.from),
        toDate: cp.toDate ? new Date(cp.toDate) : null,
        amendCharge: cp.amendCharge ?? null,
        amendRestricted: cp.amendRestricted ?? null,
        cancelRestricted: cp.cancelRestricted ?? null,
        noShowPolicy: cp.noShowPolicy ?? null,
      })),
    });
  }

  if (rate.taxes?.taxes?.length) {
    await prisma.rateTax.createMany({
      data: rate.taxes.taxes.map((t) => ({
        roomRateId: roomRate.id,
        included: t.included,
        amount: t.amount,
        currency: t.currency,
        clientAmount: t.clientAmount,
        clientCurrency: t.clientCurrency,
      })),
    });
  }

  if (rate.Fees?.length) {
    await prisma.rateFee.createMany({
      data: rate.Fees.map((f) => ({
        roomRateId: roomRate.id,
        name: f.Name,
        description: f.Description,
        included: f.Included,
        amount: f.Amount,
        currency: f.Currency,
      })),
    });
  }

  if (rate.offers?.length) {
    await prisma.rateOffer.createMany({
      data: rate.offers.map((o) => ({
        roomRateId: roomRate.id,
        name: o.name,
        type: o.type ?? null,
        value: o.value ?? null,
        remark: o.remark ?? null,
      })),
    });
  }
};