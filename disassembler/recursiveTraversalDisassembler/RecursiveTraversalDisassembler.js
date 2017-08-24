import {parseInstruction} from './instructionParsing/instructionParsing';
import {reduceBytesToDisassembleIntoInstructionGroupData} from '../linearSweepDisassembler/LinearSweepDisassembler';
import {reduce} from 'lodash';
// import * as _ from 'lodash';
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
  const arrayOfJustInstructions = Object.values(resultingInstructionMap);
  return reduceInstructionCount(arrayOfJustInstructions);
}

let visitedLocations = {};

export function hasAlreadyVisited (state) {
  if (visitedLocations[state.pc]) {
    console.info('Already Visited:', state.pc);
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
  let maxLoops = 1000;
  let currentLoop = 0;
  while (true) {
    // Why do we have to subtract 1 to programcounter to get the correct result?
    const instruction = groupsOfInstructions.instructions[state.pc - 1];
    if (!instruction) {
      if (state.additionalPaths.length === 0) break;
      state.pc = state.additionalPaths.pop();
      continue;
    }
    state = parseInstruction(instruction, state);
    currentLoop++;
    if (hasAlreadyVisited(state) || currentLoop > maxLoops) { break; }
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
  if (index === 0 || value[0] !== collection[index - 1][0]) {
    value.push(1);
    newInstructionList.push(value);
    return newInstructionList;
  }
  const previousElement = newInstructionList.pop();
  previousElement[1] += 1;
  newInstructionList.push(previousElement);
  return newInstructionList;
}

export function reduceInstructionCount (originalInstructionList) {
  const modifiedInstructionList = reduce(originalInstructionList, reduceIdenticalInstructionsIntoOne, []);
  return modifiedInstructionList;
}
