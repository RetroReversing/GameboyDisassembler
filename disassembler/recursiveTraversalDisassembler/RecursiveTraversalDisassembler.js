import {parseInstruction} from './instructionParsing/instructionParsing';
import {reduceBytesToDisassembleIntoInstructionGroupData} from '../linearSweepDisassembler/LinearSweepDisassembler';
import {reduce, map} from 'lodash';
import {formatIntoGBDisBinaryFormat} from '../assemblyFormatters/gb-disasmFormatter';
import {convertTo8CharacterHexAddress} from '../Util/ValueConversion';
import {logAction} from '../Util/Logger';
import {printRomHeaderInformation, parseGBHeader, getRomTitle} from '../romInformation/romInformation';

/**
 * Disassemble Bytes by executing all jumps, ignoring data, if you don't have data bytes use DisassembleBytesWithRecursiveTraversal
 *
 * @export
 * @param {any} bytesToDisassemble
 * @returns
 */
export function DisassembleBytesWithRecursiveTraversal (bytesToDisassemble, startAddress = 0x100, allowLogging = false) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  return disassembleLoop(startAddress, groupsOfInstructions, [], allowLogging);
}

export function DisassembleBytesWithRecursiveTraversalIntoOptimizedArray (bytesToDisassemble, startAddress = 0x100, allowLogging = false) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  const resultingInstructionMap = disassembleLoop(startAddress, groupsOfInstructions, [], allowLogging).allAssemblyInstructions;
  const arrayOfJustInstructions = map(resultingInstructionMap, (value, key) => [value, key.replace('$', '')]);
  const sortedArrayByAddress = arrayOfJustInstructions.sort((a, b) => parseInt(a[1], 16) - parseInt(b[1], 16));
  return reduceInstructionCount(sortedArrayByAddress);
}

export function DisassembleBytesWithRecursiveTraversalFormatted (bytesToDisassemble, startAddress = 0x100, allowLogging = false) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  const resultingInstructionMap = disassembleLoop(startAddress, groupsOfInstructions, [], allowLogging);
  const formattedMapOfInstructions = formatIntoGBDisBinaryFormat(resultingInstructionMap.allAssemblyInstructions, groupsOfInstructions);
  return formattedMapOfInstructions;
}

export function DisassembleBytesWithRecursiveTraversalFormattedWithHeader (bytesToDisassemble, startAddress = 0x100, allowLogging = false) {
  const romHeaderInformation = printRomHeaderInformation(bytesToDisassemble);
  const formattedMapOfInstructions = DisassembleBytesWithRecursiveTraversalFormatted (bytesToDisassemble, startAddress, allowLogging)
  const assemblyWithNewlines = formattedMapOfInstructions.join('\n');
  return romHeaderInformation+assemblyWithNewlines+'\n';
}

let visitedLocations = {};

export function hasAlreadyVisited (state) {
  if (visitedLocations[state.pc]) {
    return true;
  }

  return false;
}

export function markAddressAsVisited (state) {
  visitedLocations[state.pc] = state;
}

function resetVisitedAddresses () {
  visitedLocations = {};
  return visitedLocations;
}

function disassembleLoop (startAddress, groupsOfInstructions, addressesToJumpTo, allowLogging = false) {
  resetVisitedAddresses();
  addressesToJumpTo.push(startAddress);
  let state = {pc: startAddress, jumpAddresses: [startAddress], jumpAssemblyInstructions: {}, allAssemblyInstructions: {}, callStack: [], additionalPaths: [], allowLogging: allowLogging};
  let currentLoop = 0;
  while (true) {
    const instruction = groupsOfInstructions.instructions[state.pc];
    if (!instruction || hasAlreadyVisited(state)) {
      if (state.additionalPaths.length === 0) break;
      const previousPC = state.pc;
      state.pc = state.additionalPaths.pop();
      logAction('Going To additional path from:' + convertTo8CharacterHexAddress(previousPC) + ' To:' + convertTo8CharacterHexAddress(state.pc), state);
      continue;
    }
    markAddressAsVisited(state);
    state = parseInstruction(instruction, state);
    currentLoop++;
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
