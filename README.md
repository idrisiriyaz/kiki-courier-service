# Kiki Courier Service

Command-line tool that estimates delivery cost and delivery time for courier packages.

It reads a batch of packages from standard input and prints one result line per package. Two modes are available:

- **cost** — base delivery cost, weight and distance charges, and offer discounts
- **time** — estimated delivery time when packages share a fleet of vehicles

## Requirements

- Node.js 18 or later

## Run

From the project root:

```bash
npm run cost < examples/cost-input.txt
npm run time < examples/time-input.txt
```

The same commands without npm:

```bash
node src/cli.js cost < examples/cost-input.txt
node src/cli.js time < examples/time-input.txt
```

`npm start` runs cost mode. If the mode argument is omitted, cost mode is used.

```bash
node src/cli.js < examples/cost-input.txt
```

Invalid input prints `Error: …` to stderr and exits with status code 1.

## Cost mode

### Input

The first line is the base delivery cost and the number of packages. Each following line is one package. The offer code is optional and defaults to `NA`.

```text
BASE_DELIVERY_COST PACKAGE_COUNT
PACKAGE_ID WEIGHT DISTANCE [OFFER_CODE]
```

`BASE_DELIVERY_COST`, `WEIGHT`, and `DISTANCE` must be zero or greater. `PACKAGE_COUNT` must be a positive integer.

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

Final cost is the pre-discount cost minus the discount. Amounts are printed with up to two decimal places.

### Example

`examples/cost-input.txt`:

```text
100 5
PKG1 5 5 OFR001
PKG2 15 5 OFR002
PKG3 10 100 OFR003
PKG4 10 50 OFR002
PKG5 10 200 OFR001
```

```bash
npm run cost < examples/cost-input.txt
```

```text
PACKAGE_ID,DISCOUNT,FINAL_COST
PKG1,0,175
PKG2,0,275
PKG3,35,665
PKG4,0,450
PKG5,0,1200
```

Only `PKG3` qualifies for a discount. Its pre-discount cost is `100 + (10 × 10) + (100 × 5) = 700`, and OFR003 takes 5% off, which is 35.

## Time mode

### Input

The first line describes the fleet. Each following line is one package, in the same shape as cost mode. Offer codes are accepted and ignored for scheduling.

```text
PACKAGE_COUNT VEHICLE_COUNT MAX_VEHICLE_WEIGHT VEHICLE_SPEED
PACKAGE_ID WEIGHT DISTANCE [OFFER_CODE]
```

`PACKAGE_COUNT` and `VEHICLE_COUNT` must be positive integers. `MAX_VEHICLE_WEIGHT` and `VEHICLE_SPEED` must be greater than zero. A package heavier than `MAX_VEHICLE_WEIGHT` cannot be delivered.

### Scheduling

Vehicles start available at time 0 and travel at the same speed. Packages are assigned heaviest first. Each package goes on its own trip, to the vehicle that can deliver it soonest. If two vehicles tie, the one with the lower id is chosen.

Delivery time for a package is the vehicle’s available time plus `distance / speed`. After a delivery, that vehicle is busy for the round trip, `2 × distance / speed`, before it can leave again.

Results are printed in the original package order. Times use up to two decimal places.

### Example

`examples/time-input.txt`:

```text
5 2 100 70
PKG1 50 100 OFR001
PKG2 75 125 OFR002
PKG3 10 175 OFR003
PKG4 60 110 OFR002
PKG5 95 155 NA
```

```bash
npm run time < examples/time-input.txt
```

```text
PKG1 5.86
PKG2 1.79
PKG3 9.21
PKG4 5.14
PKG5 2.21
```

## Project layout

```text
src/cli.js                  Reads stdin and runs cost or time mode
src/functions/cost.js       Delivery cost calculation
src/functions/offer.js      Offer rules and discounts
src/functions/vehicle.js    Vehicle assignment
src/functions/deliveryTime.js  Travel and round-trip times
src/utils/input.js          Parsing and number formatting
examples/                   Sample inputs
```
