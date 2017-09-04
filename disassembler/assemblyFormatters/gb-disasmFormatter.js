import {reduce, map, isUndefined} from 'lodash';
import {convertTo8CharacterHexAddress, convertTo2CharacterHexAddress, hexToNumber} from '../Util/ValueConversion';

export function formatIntoGBDisBinaryFormat (mapOfInstructions, groupsOfInstructions) {
  const sortedMapOfInstructions = sortMapOfInstructions(mapOfInstructions);
  const formattedMapOfInstructions = map(sortedMapOfInstructions, function formatInstruction (instructionArray, address) {
    return getFullAddress(address) + ' ' + getHexBytesForInstruction(address, groupsOfInstructions) + instructionArray;
  });
  return formattedMapOfInstructions;
}

export function sortMapOfInstructions (mapOfInstructions) {
  const orderedMapOfInstructions = {};
  Object.keys(mapOfInstructions).sort().forEach(function (key) {
    orderedMapOfInstructions[key] = mapOfInstructions[key];
  });
  return orderedMapOfInstructions;
}

const spacesBasedOnInstructionLength = {1: '           ', 2: '      ', 3: ' '};

export function getFullAddress (originalHexAddress) {
  const hexAddressWithoutPrefix = originalHexAddress.replace('$', '');
  return '[0x' + convertTo8CharacterHexAddress(hexAddressWithoutPrefix) + ']';
}

function getHexBytesForInstruction (originalHexAddress, groupsOfInstructions) {
  const hexAddressWithoutPrefix = originalHexAddress.replace('$', '');
  const instructionBytes = groupsOfInstructions.instructions[hexToNumber(hexAddressWithoutPrefix)];
  if (isUndefined(instructionBytes)) {
    return 'Error Fetching Hex String:' + originalHexAddress + ' ' + hexToNumber(hexAddressWithoutPrefix);
  }
  const formattedHexBytes = reduce(instructionBytes, convertInstructionBytesToHexString, '');
  return formattedHexBytes + spacesBasedOnInstructionLength[instructionBytes.length];
}

function convertInstructionBytesToHexString (formattedString, value, index, collection) {
  if (index !== 0) formattedString += ' ';
  return formattedString + '0x' + convertTo2CharacterHexAddress(value).toUpperCase();
}
