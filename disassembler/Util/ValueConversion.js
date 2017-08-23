
export function is8BitSignedValueNegative (signed8bitValue) {
  if ((signed8bitValue & 0x80) === 128) return true;
  return false;
}

export function convertTo8BitSignedValue (value) {
  if (is8BitSignedValueNegative(value)) {
    return -(value & 0x7F);
  }
  return value;
}

export function convertToHex (value, prefix = '$') {
  if (value === undefined) return 'ErrorInConvertToHex';
  return prefix + ((value).toString(16)).toUpperCase();
}

export function convertHexStringToNumber (hexString) {
  return parseInt(hexString, 16);
}
