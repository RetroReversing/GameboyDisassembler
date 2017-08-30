import {parseInstruction} from './instructionParsing/instructionParsing';
import {reduceBytesToDisassembleIntoInstructionGroupData} from '../linearSweepDisassembler/LinearSweepDisassembler';
import {reduce, map, isUndefined} from 'lodash';
import {convertTo8CharacterHexAddress, convertTo2CharacterHexAddress, hexToNumber} from '../Util/ValueConversion';

/**
 * Disassemble Bytes by executing all jumps, ignoring data, if you don't have data bytes use DisassembleBytesWithRecursiveTraversal
 *
 * @export
 * @param {any} bytesToDisassemble
 * @returns
 */
export function DisassembleBytesWithRecursiveTraversal (bytesToDisassemble, startAddress = 0x100) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  return disassembleLoop(startAddress, groupsOfInstructions, []);
}

export function DisassembleBytesWithRecursiveTraversalIntoOptimizedArray (bytesToDisassemble, startAddress = 0x100) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  const resultingInstructionMap = disassembleLoop(startAddress, groupsOfInstructions, []).allAssemblyInstructions;
  const arrayOfJustInstructions = map(resultingInstructionMap, (value, key) => [value, key.replace('$', '')]);
  const sortedArrayByAddress = arrayOfJustInstructions.sort((a, b) => parseInt(a[1], 16) - parseInt(b[1], 16));
  return reduceInstructionCount(sortedArrayByAddress);
}

export function DisassembleBytesWithRecursiveTraversalFormatted (bytesToDisassemble, startAddress = 0x100) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  const resultingInstructionMap = disassembleLoop(startAddress, groupsOfInstructions, []);
  return formatIntoGBDisBinaryFormat(resultingInstructionMap.allAssemblyInstructions, groupsOfInstructions);
}

const spacesBasedOnInstructionLength = {1: '           ', 2: '      ', 3: ' '};

function getFullAddress (originalHexAddress) {
  const hexAddressWithoutPrefix = originalHexAddress.replace('$', '');
  return '[0x' + convertTo8CharacterHexAddress(hexAddressWithoutPrefix) + '] ';
}

function convertInstructionBytesToHexString (formattedString, value, index, collection) {
  if (index !== 0) formattedString += ' ';
  return formattedString + '0x' + convertTo2CharacterHexAddress(value).toUpperCase();
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

export function formatIntoGBDisBinaryFormat (mapOfInstructions, groupsOfInstructions) {
  const formattedMapOfInstructions = map(mapOfInstructions, function formatInstruction (instructionArray, address) {
    return getFullAddress(address) + getHexBytesForInstruction(address, groupsOfInstructions) + ' ' + instructionArray;
  });
  return formattedMapOfInstructions;
}

let visitedLocations = {};

export function hasAlreadyVisited (state) {
  if (visitedLocations[state.pc]) {
    return true;
  }
  visitedLocations[state.pc] = state;
  return false;
}

function resetVisitedAddresses () {
  visitedLocations = {};
  return visitedLocations;
}

function disassembleLoop (startAddress, groupsOfInstructions, addressesToJumpTo) {
  resetVisitedAddresses();
  addressesToJumpTo.push(startAddress);
  let state = {pc: startAddress, jumpAddresses: [startAddress], jumpAssemblyInstructions: {}, allAssemblyInstructions: {}, callStack: [], additionalPaths: []};
  // let maxLoops = 1000;
  let currentLoop = 0;
  while (true) {
    // Why do we have to subtract 1 to programcounter to get the correct result?
    const instruction = groupsOfInstructions.instructions[state.pc];
    if (!instruction || hasAlreadyVisited(state)) {
      if (state.additionalPaths.length === 0) break;
      state.pc = state.additionalPaths.pop();
      continue;
    }
    state = parseInstruction(instruction, state);
    currentLoop++;
    // if (hasAlreadyVisited(state) || currentLoop > maxLoops) { break; }
  }
  return state;
}

/**
 * Find all Jump instructions in a rom
 * @export
 * @param {any} bytesToDisassemble
 * @param {any} startAddress
 * @returns
 */
export function findAllJumpInstructions (bytesToDisassemble, startAddress = 0x100) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  return disassembleLoop(startAddress, groupsOfInstructions, []).jumpAssemblyInstructions;
}

function reduceIdenticalInstructionsIntoOne (newInstructionList, value, index, collection) {
  const stringOfInstructionOpcode = value[0][0];
  const previousInstruction = collection[index - 1];
  if (index === 0 || stringOfInstructionOpcode !== previousInstruction[0][0]) {
    value.push(1);
    newInstructionList.push(value);
    return newInstructionList;
  }
  const previousElement = newInstructionList.pop();
  previousElement[previousElement.length - 1] += 1;
  newInstructionList.push(previousElement);
  return newInstructionList;
}

export function reduceInstructionCount (originalInstructionList) {
  const modifiedInstructionList = reduce(originalInstructionList, reduceIdenticalInstructionsIntoOne, []);
  return modifiedInstructionList;
}
