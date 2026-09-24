
function tokenize(line) {
    return line.trim().split(/\s+/).filter(Boolean);
}
  
function parseNumber(value, fieldName) {
    const number = Number(value);
    if (!Number.isFinite(number)) throw new Error(`${fieldName} must be a valid number.`);
    return number;
}
  
function parsePositiveNumber(value,fieldName) {
    const number = parseNumber(value, fieldName);
    if (number <= 0) throw new Error(`${fieldName} must be greater than zero.`);
    return number;
}
  
function parseNonNegativeNumber( value, fieldName) {
  const number = parseNumber(value, fieldName);
  if (number < 0) throw new Error(`${fieldName} cannot be negative.`);
  return number;
}
  
function parsePositiveInteger(value, fieldName) {
    const number = parseNumber(value, fieldName);
    if (!Number.isInteger(number) || number <= 0) throw new Error(`${fieldName} must be a positive integer.`);
    return number;
}

function formatNumber(value) {
  return Number(value.toFixed(2)).toString();
}

export { tokenize, parseNumber, parsePositiveNumber, parseNonNegativeNumber, parsePositiveInteger, formatNumber};