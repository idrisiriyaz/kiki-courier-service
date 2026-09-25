# Kiki Courier Service

Command-line tool that estimates delivery cost and delivery time for courier packages.

It reads a JSON batch of packages from standard input and prints a JSON array of results. Two modes are available:

- **cost** — base delivery cost, weight and distance charges, and offer discounts
- **time** — estimated delivery time when packages share a fleet of vehicles

## Requirements

- Node.js 18 or later

## Run

From the project root:

```bash
npm run cost < examples/cost-input.json
npm run time < examples/time-input.json
```

The same commands without npm:

```bash
node src/cli.js cost < examples/cost-input.json
node src/cli.js time < examples/time-input.json
```

`npm start` runs cost mode. If the mode argument is omitted, cost mode is used.

```bash
node src/cli.js < examples/cost-input.json
```

Invalid input prints `Error: …` to stderr and exits with status code 1.

## Cost mode

### Input

Input is a JSON object. `offerCode` is optional and defaults to `NA`. When `packageCount` is present, it must match the number of packages.

```json
{
  "baseDeliveryCost": 100,
  "packageCount": 1,
  "packages": [
    { "id": "PKG1", "weight": 5, "distance": 5, "offerCode": "OFR001" }
  ]
}
```

`baseDeliveryCost`, `weight`, and `distance` must be zero or greater. `packageCount` must be a positive integer.

### Pricing

Delivery cost before discount:

```text
base delivery cost + (weight × 10) + (distance × 5)
```

Weight is in kilograms and distance is in kilometres. An offer applies only when the package weight and distance fall inside that offer’s range. Otherwise the discount is 0.

| Code   | Discount | Weight (kg) | Distance (km) |
| ------ | -------- | ----------- | ------------- |
| OFR001 | 10%      | 70–200      | 0–200         |
| OFR002 | 7%       | 100–250     | 50–150        |
| OFR003 | 5%       | 10–150      | 50–250        |

Final cost is the pre-discount cost minus the discount. Amounts are JSON numbers rounded to two decimal places.

### Example

`examples/cost-input.json`:

```json
{
  "baseDeliveryCost": 100,
  "packageCount": 5,
  "packages": [
    { "id": "PKG1", "weight": 5, "distance": 5, "offerCode": "OFR001" },
    { "id": "PKG2", "weight": 15, "distance": 5, "offerCode": "OFR002" },
    { "id": "PKG3", "weight": 10, "distance": 100, "offerCode": "OFR003" },
    { "id": "PKG4", "weight": 10, "distance": 50, "offerCode": "OFR002" },
    { "id": "PKG5", "weight": 10, "distance": 200, "offerCode": "OFR001" }
  ]
}
```

```bash
npm run cost < examples/cost-input.json
```

```json
[
  { "packageId": "PKG1", "discount": 0, "finalCost": 175 },
  { "packageId": "PKG2", "discount": 0, "finalCost": 275 },
  { "packageId": "PKG3", "discount": 35, "finalCost": 665 },
  { "packageId": "PKG4", "discount": 0, "finalCost": 450 },
  { "packageId": "PKG5", "discount": 0, "finalCost": 1200 }
]
```

Only `PKG3` qualifies for a discount. Its pre-discount cost is `100 + (10 × 10) + (100 × 5) = 700`, and OFR003 takes 5% off, which is 35.

## Time mode

### Input

Input is a JSON object. Each package uses the same fields as cost mode. Offer codes are accepted and ignored for scheduling.

```json
{
  "packageCount": 5,
  "vehicleCount": 2,
  "maxVehicleWeight": 100,
  "vehicleSpeed": 70,
  "packages": [
    { "id": "PKG1", "weight": 50, "distance": 100, "offerCode": "OFR001" }
  ]
}
```

`packageCount` and `vehicleCount` must be positive integers. `maxVehicleWeight` and `vehicleSpeed` must be greater than zero. A package heavier than `maxVehicleWeight` cannot be delivered.

### Scheduling

Vehicles start available at time 0 and travel at the same speed. Packages are assigned heaviest first. Each package goes on its own trip, to the vehicle that can deliver it soonest. If two vehicles tie, the one with the lower id is chosen.

Delivery time for a package is the vehicle’s available time plus `distance / speed`. After a delivery, that vehicle is busy for the round trip, `2 × distance / speed`, before it can leave again.

Results are printed in the original package order as a JSON array. Times are JSON numbers rounded to two decimal places.

### Example

`examples/time-input.json`:

```json
{
  "packageCount": 5,
  "vehicleCount": 2,
  "maxVehicleWeight": 100,
  "vehicleSpeed": 70,
  "packages": [
    { "id": "PKG1", "weight": 50, "distance": 100, "offerCode": "OFR001" },
    { "id": "PKG2", "weight": 75, "distance": 125, "offerCode": "OFR002" },
    { "id": "PKG3", "weight": 10, "distance": 175, "offerCode": "OFR003" },
    { "id": "PKG4", "weight": 60, "distance": 110, "offerCode": "OFR002" },
    { "id": "PKG5", "weight": 95, "distance": 155, "offerCode": "NA" }
  ]
}
```

```bash
npm run time < examples/time-input.json
```

```json
[
  { "packageId": "PKG1", "deliveryTime": 5.86 },
  { "packageId": "PKG2", "deliveryTime": 1.79 },
  { "packageId": "PKG3", "deliveryTime": 9.21 },
  { "packageId": "PKG4", "deliveryTime": 5.14 },
  { "packageId": "PKG5", "deliveryTime": 2.21 }
]
```

## Constants

Offer codes, discount ranges, the per-kilogram rate (`costPerKg`), the per-kilometre rate (`costPerKm`), the round-trip multiplier, and the default offer code live in `config/constants.json`. Change that file to change pricing without editing the calculation code.

## Logs

Each run appends one JSON object per line to `logs/courier.jsonl`. A cost run records when it starts, each package’s base cost, discount, and final cost, then when it finishes. A time run records each vehicle assignment. Failures are logged with level `error`.

```json
{"timestamp":"2026-09-25T04:22:00.000Z","level":"info","event":"package_cost","packageId":"PKG3","weight":10,"distance":100,"offerCode":"OFR003","baseCost":700,"discount":35,"finalCost":665}
```

## Project layout

```text
src/cli.js                     Reads JSON from stdin and runs cost or time mode
src/functions/cost.js          Delivery cost calculation
src/functions/offer.js         Offer rules and discounts
src/functions/vehicle.js       Vehicle assignment
src/functions/deliveryTime.js  Travel and round-trip times
src/utils/config.js            Loads config/constants.json
src/utils/input.js             Parsing and number formatting
src/utils/logger.js            JSON log writer
config/constants.json          Rates, round-trip multiplier, and offers
examples/                      Sample JSON inputs
logs/courier.jsonl             Generated JSON logs
```
