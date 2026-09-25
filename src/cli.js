import fs from "node:fs";
import { constants } from "./utils/config.js";
import { logger } from "./utils/logger.js";
import { calculateAllPackageCosts } from "./functions/cost.js";
import { estimateDeliveryTimes } from "./functions/vehicle.js";
import { parseNonNegativeNumber, parsePositiveNumber, parsePositiveInteger, formatNumber } from "./utils/input.js";

function readInput() {
  const input = fs.readFileSync(0, "utf8").trim();
  if (!input) throw new Error("No input provided.");
  return input;
}

function parseJsonInput(input) {
  try {
    const data = JSON.parse(input);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new Error("Input must be a JSON object.");
    }
    return data;
  } catch (error) {
    if (error instanceof SyntaxError) throw new Error("Input must be valid JSON.");
    throw error;
  }
}

function parsePackages(packages) {
  if (!Array.isArray(packages) || packages.length === 0) {
    throw new Error("Packages must be a non-empty array.");
  }

  return packages.map((pkg, index) => {
    const line = index + 1;

    if (!pkg || typeof pkg !== "object" || Array.isArray(pkg)) {
      throw new Error(`Package ${line} must be an object.`);
    }

    if (typeof pkg.id !== "string" || !pkg.id.trim()) {
      throw new Error(`Package ${line} ID cannot be empty.`);
    }

    return {
      id: pkg.id.trim(),
      weight: parseNonNegativeNumber(pkg.weight, "Package weight"),
      distance: parseNonNegativeNumber(pkg.distance, "Package distance"),
      offerCode: pkg.offerCode ?? constants.defaultOfferCode
    };
  });
}

function assertPackageCount(packageCount, packages) {
  if (packageCount === undefined) return packages;

  const count = parsePositiveInteger(packageCount, "Package count");

  if (count !== packages.length) {
    throw new Error(`Expected ${count} packages, received ${packages.length}.`);
  }

  return packages;
}

function rounded(value) {
  return Number(formatNumber(value));
}

function runCost(input) {
  const data = parseJsonInput(input);
  const baseDeliveryCost = parseNonNegativeNumber(data.baseDeliveryCost, "Base delivery cost");
  const packages = assertPackageCount(data.packageCount, parsePackages(data.packages));
  const results = calculateAllPackageCosts(baseDeliveryCost, packages);

  return results.map(result => ({
    packageId: result.packageId,
    discount: rounded(result.discount),
    finalCost: rounded(result.finalCost)
  }));
}

function runTime(input) {
  const data = parseJsonInput(input);
  const vehicleCount = parsePositiveInteger(data.vehicleCount, "Vehicle count");
  const maxVehicleWeight = parsePositiveNumber(data.maxVehicleWeight, "Maximum vehicle weight");
  const vehicleSpeed = parsePositiveNumber(data.vehicleSpeed, "Vehicle speed");
  const packages = assertPackageCount(data.packageCount, parsePackages(data.packages));
  const results = estimateDeliveryTimes(packages, vehicleCount, maxVehicleWeight, vehicleSpeed);

  return results.map(result => ({
    packageId: result.packageId,
    deliveryTime: rounded(result.deliveryTime)
  }));
}

function main() {
  const mode = process.argv[2] || "cost";

  try {
    logger.info("run_started", { mode });

    const input = readInput();
    let output;

    switch (mode) {
      case "cost":
        output = runCost(input);
        break;
      case "time":
        output = runTime(input);
        break;
      default:
        throw new Error(`Unknown mode "${mode}". Use "cost" or "time".`);
    }

    logger.info("run_completed", { mode, result: output });
    console.log(JSON.stringify(output, null, 2));
  } catch (error) {
    logger.error("run_failed", { mode, message: error.message });
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();
