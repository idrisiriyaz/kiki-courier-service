import { calculateDiscount } from "./offer.js";

const COST_PER_KG = 10;
const COST_PER_KM = 5;

function calculateBaseCost( baseDeliveryCost, weight, distance) {
  const weightCost =  weight * COST_PER_KG;
  const distanceCost = distance * COST_PER_KM;
  return baseDeliveryCost + weightCost + distanceCost;
}

function calculatePackageCost({ baseDeliveryCost, packageId, weight, distance, offerCode}) {

  const baseCost = calculateBaseCost(baseDeliveryCost, weight, distance);

  const discount = calculateDiscount( baseCost, weight, distance,offerCode );

  const finalCost =  baseCost - discount;

  return { packageId, baseCost, discount, finalCost};
}

function calculateAllPackageCosts(  baseDeliveryCost,  packages ) {
  return packages.map(pkg =>
    calculatePackageCost({  baseDeliveryCost, packageId: pkg.id, weight: pkg.weight, distance: pkg.distance, offerCode: pkg.offerCode})
  );
}

export {
  calculateBaseCost,
  calculatePackageCost,
  calculateAllPackageCosts
};