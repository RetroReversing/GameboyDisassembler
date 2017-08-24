import {parseInstruction} from './instructionParsing/instructionParsing';
import {reduceBytesToDisassembleIntoInstructionGroupData} from '../linearSweepDisassembler/LinearSweepDisassembler';
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
  let state = {pc: startAddress, jumpAddresses: [startAddress], jumpAssemblyInstructions: {}, allAssemblyInstructions: {}, callStack: []};
  let maxLoops = 1000;
  let currentLoop = 0;
  while (true) {
    // Why do we have to subtract 1 to programcounter to get the correct result?
    const instruction = groupsOfInstructions.instructions[state.pc - 1];
    if (!instruction) {
      console.log('Instruction was undefined', instruction);
      break;
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
