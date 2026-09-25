import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

function loadJson(relativePath) {
  const filePath = path.join(root, relativePath);
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function loadConstants() {
  const constants = loadJson("config/constants.json");

  if (!Number.isFinite(constants.costPerKg) || constants.costPerKg < 0) {
    throw new Error("constants.json costPerKg must be zero or greater.");
  }

  if (!Number.isFinite(constants.costPerKm) || constants.costPerKm < 0) {
    throw new Error("constants.json costPerKm must be zero or greater.");
  }

  if (!Number.isFinite(constants.roundTripMultiplier) || constants.roundTripMultiplier <= 0) {
    throw new Error("constants.json roundTripMultiplier must be greater than zero.");
  }

  if (typeof constants.defaultOfferCode !== "string" || !constants.defaultOfferCode) {
    throw new Error("constants.json defaultOfferCode must be a non-empty string.");
  }

  if (!constants.offers || typeof constants.offers !== "object" || Array.isArray(constants.offers)) {
    throw new Error("constants.json offers must be an object.");
  }

  return constants;
}

const constants = loadConstants();

export { root, constants };
