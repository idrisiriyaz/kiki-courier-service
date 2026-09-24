import fs from "node:fs";
import { calculateAllPackageCosts } from "./functions/cost.js";
import { estimateDeliveryTimes } from "./functions/vehicle.js";
import { tokenize, parseNonNegativeNumber, parsePositiveNumber, parsePositiveInteger, formatNumber } from "./utils/input.js";

function readInput() {
  const input = fs.readFileSync(0,"utf8").trim();
  if (!input) throw new Error( "No input provided." );
  return input;
}

function parsePackages(lines,packageCount) {

  if (lines.length <packageCount + 1) throw new Error( `Expected ${packageCount} package lines.` );

  return lines.slice( 1, packageCount + 1).map((line, index) => {
        const parts = tokenize(line); // [id, weight, distance, offerCode]

        if (parts.length < 3 || parts.length > 4) throw new Error( `Invalid package line ${index + 1}. Expected: ID WEIGHT DISTANCE [OFFER_CODE]` );

        const [ id, weightValue, distanceValue, offerCode = "NA" ] = parts;

        const weight = parseNonNegativeNumber(weightValue, "Package weight");

        const distance = parseNonNegativeNumber( distanceValue, "Package distance" );

        if (!id) throw new Error( "Package ID cannot be empty." );

        return {id,weight,distance,offerCode };
      }
    );
}

function parseLines(input) {
  return input.split(/\r?\n/) .map(line => line.trim()).filter(Boolean);
}

function runCost(input) {

  const lines = parseLines(input);

  const header = tokenize(lines[0]);

  if (header.length !== 2) throw new Error( "Expected: BASE_DELIVERY_COST PACKAGE_COUNT" );

  const baseDeliveryCost = parseNonNegativeNumber(header[0],  "Base delivery cost");

  const packageCount = parsePositiveInteger(header[1], "Package count");

  const packages = parsePackages(lines, packageCount);

  const results = calculateAllPackageCosts(baseDeliveryCost,packages);

  const resultsHeader = [ "Package ID","Discount","Final Cost"];

  return [resultsHeader, ...results.map(result =>[result.packageId,formatNumber(result.discount),  formatNumber( result.finalCost)])
  ];
}

function runTime(input) {

  const lines = parseLines(input);

  const header = tokenize(lines[0]);

  /*
   * Format:
   *
   * PACKAGE_COUNT
   * VEHICLE_COUNT
   * MAX_VEHICLE_WEIGHT
   * VEHICLE_SPEED
   *
   * Example:
   *
   * 5 2 100 70
   */

  if (header.length !== 4) throw new Error( "Expected: PACKAGE_COUNT VEHICLE_COUNT MAX_VEHICLE_WEIGHT VEHICLE_SPEED" );

  const packageCount = parsePositiveInteger(header[0],"Package count");

  const vehicleCount = parsePositiveInteger(header[1],"Vehicle count");

  const maxVehicleWeight = parsePositiveNumber(header[2], "Maximum vehicle weight");

  const vehicleSpeed = parsePositiveNumber(header[3],"Vehicle speed");

  const packages = parsePackages(lines,packageCount);

  const results = estimateDeliveryTimes( packages, vehicleCount, maxVehicleWeight, vehicleSpeed);

  const resultsHeader = [ "Package ID","Delivery Time"];

  return [resultsHeader, ...results.map( result =>[result.packageId,formatNumber(result.deliveryTime)].join(" "))];
}

function main() {
  try {
    const mode = process.argv[2] || "cost";

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
        throw new Error(
          `Unknown mode "${mode}". Use "cost" or "time".`
        );
    }

    console.log(output.join("\n"));

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  }
}

main();