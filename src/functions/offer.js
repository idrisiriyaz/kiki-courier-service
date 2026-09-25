import { constants } from "../utils/config.js";

const OFFERS = constants.offers;

function isOfferApplicable(weight, distance, offerCode) {
  const offer = OFFERS[offerCode];
  if (!offer) return false;
  return weight >= offer.minWeight && weight <= offer.maxWeight && distance >= offer.minDistance && distance <= offer.maxDistance;
}

function calculateDiscount(cost, weight, distance, offerCode) {
  const offer = OFFERS[offerCode];
  if (!offer) return 0;
  const applicable = isOfferApplicable(weight, distance, offerCode);
  if (!applicable) return 0;
  return (cost * offer.discount) / 100;
}

export { calculateDiscount };
