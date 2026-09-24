function calculateDeliveryTime(distance, speed) {
    if (speed <= 0)  throw new Error( "Vehicle speed must be greater than zero." );
    return distance / speed;
}
  
function calculateRoundTripTime(distance, speed) {
    return (2 * distance) / speed;
}
  
function calculateVehicleAvailableAt(vehicle, packageData) {
    return vehicle.availableAt + calculateRoundTripTime(packageData.distance, vehicle.speed);
}
  
export { calculateDeliveryTime, calculateRoundTripTime, calculateVehicleAvailableAt };