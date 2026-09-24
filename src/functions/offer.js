const OFFERS = {
  OFR001: {
    discount: 10,
    minWeight: 70,
    maxWeight: 200,
    minDistance: 0,
    maxDistance: 200
  },
  OFR002: {
    discount: 7,
    minWeight: 100,
    maxWeight: 250,
    minDistance: 50,
    maxDistance: 150
  },
  OFR003: {
    discount: 5,
    minWeight: 10,
    maxWeight: 150,
    minDistance: 50,
    maxDistance: 250
  }
};

function isOfferApplicable( weight, distance, offerCode) {
  const offer = OFFERS[offerCode];
  if (!offer) return false;
  return weight >= offer.minWeight && weight <= offer.maxWeight && distance >= offer.minDistance && distance <= offer.maxDistance;
}

function calculateDiscount( cost, weight, distance, offerCode) {
  const offer = OFFERS[offerCode];
  if (!offer) return 0;
  const applicable = isOfferApplicable( weight, distance, offerCode);
  if (!applicable) return 0;
  return (cost * offer.discount) / 100;

}

export { calculateDiscount };