
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

export function convertTo8CharacterHexAddress (hexAddressWithoutPrefix) {
  return toPaddedHexString(8, hexAddressWithoutPrefix);
}

export function convertTo2CharacterHexAddress (hexAddressWithoutPrefix) {
  return toPaddedHexString(2, hexAddressWithoutPrefix);
}

function toPaddedHexString (len, num) {
  const str = num.toString(16).toUpperCase();
  const requiredNumberOfZeros = len - str.length;
  if (requiredNumberOfZeros < 0) {
    console.error('Invalid requiredNumberOfZeros in toPaddedHexString:', str, 'desired Length:', len, 'original number:', num);
    return str;
  }
  return '0'.repeat(requiredNumberOfZeros) + str;
}

export function hexToNumber (hexStringWithoutPrefix) {
  return parseInt(hexStringWithoutPrefix, 16);
}
