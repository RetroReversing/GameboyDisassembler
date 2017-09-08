import {logError} from './Logger';

export function is8BitSignedValueNegative (signed8bitValue) {
  if ((signed8bitValue & 0x80) === 128) return true;
  return false;
}

export function convertTo8BitSignedValue (value) {
  if (is8BitSignedValueNegative(value)) {
    return (value - 256);
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
  if (typeof (num) === 'undefined') {
    logError('toPaddedHexString number was not valid:' + num + ' ' + len);
    num = 0;
  }
  const str = (num).toString(16).toUpperCase();
  const requiredNumberOfZeros = len - str.length;
  if (requiredNumberOfZeros < 0) {
    logError('Invalid requiredNumberOfZeros in toPaddedHexString:' + str + ' Desired Length:' + len + ' Original number:' + num);
    return str;
  }
  return '0'.repeat(requiredNumberOfZeros) + str;
}

export function hexToNumber (hexStringWithoutPrefix) {
  return parseInt(hexStringWithoutPrefix, 16);
}
