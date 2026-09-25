import { constants } from "../utils/config.js";

function calculateDeliveryTime(distance, speed) {
  if (speed <= 0) throw new Error("Vehicle speed must be greater than zero.");
  return distance / speed;
}

function calculateRoundTripTime(distance, speed) {
  return (constants.roundTripMultiplier * distance) / speed;
}

export { calculateDeliveryTime, calculateRoundTripTime };
