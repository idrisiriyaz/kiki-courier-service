import { logger } from "../utils/logger.js";
import { calculateDeliveryTime, calculateRoundTripTime } from "./deliveryTime.js";
  
function createVehicles(vehicleCount, maxWeight, speed) {
    return Array.from({ length: vehicleCount },(_, index) => ({  id: index + 1,  maxWeight,  speed,  availableAt: 0 }));
}
  
function canCarryPackage(vehicle,  packageData) {
    return packageData.weight <= vehicle.maxWeight;
}
  
function getEligibleVehicles(vehicles,   packageData ) {
    return vehicles.filter(vehicle => canCarryPackage(vehicle, packageData));
}
  
function getVehicleDeliveryTime(vehicle,packageData) {
    const travelTime = calculateDeliveryTime(packageData.distance, vehicle.speed);
    return vehicle.availableAt + travelTime;
}
  
function findBestVehicle(vehicles, packageData) {

const eligibleVehicles = getEligibleVehicles(vehicles, packageData);

if (eligibleVehicles.length === 0) throw new Error( `No vehicle can carry package ${packageData.id}` );

const candidates = eligibleVehicles.map(vehicle => ({ vehicle, deliveryTime: getVehicleDeliveryTime(vehicle, packageData) }));
  
candidates.sort((a, b) => a.deliveryTime !== b.deliveryTime ? a.deliveryTime - b.deliveryTime : a.vehicle.id - b.vehicle.id);

return candidates[0];

}
  
function updateVehicleAvailability(vehicle,  packageData) {
    vehicle.availableAt += calculateRoundTripTime(packageData.distance,vehicle.speed);
}
  
function estimateDeliveryTimes(packages, vehicleCount, maxWeight,  speed) {

const vehicles = createVehicles(vehicleCount, maxWeight, speed);

const pendingPackages =[...packages].sort((a, b) =>b.weight - a.weight);

  
const results = new Map();
  
for (const packageData of pendingPackages) {

    const selected = findBestVehicle(vehicles, packageData);

    results.set(packageData.id, selected.deliveryTime);

    logger.info("package_assigned", {
      packageId: packageData.id,
      vehicleId: selected.vehicle.id,
      weight: packageData.weight,
      distance: packageData.distance,
      deliveryTime: selected.deliveryTime,
      vehicleAvailableAt: selected.vehicle.availableAt
    });

    updateVehicleAvailability(selected.vehicle, packageData);

}
  
return packages.map(packageData => ({ packageId: packageData.id,deliveryTime: results.get(packageData.id)}));

}
  
export { createVehicles, canCarryPackage, getEligibleVehicles, getVehicleDeliveryTime, findBestVehicle, updateVehicleAvailability, estimateDeliveryTimes};