import {isJumpInstruction, isCallInstruction, isRetInstruction, isJumpConditionalInstruction, isRetConditionalInstruction} from '../../disassemblerInstructions';
import {DisassembleBytesWithLinearSweep} from '../../linearSweepDisassembler/LinearSweepDisassembler';
import {convertToHex, convertTo8BitSignedValue, convertHexStringToNumber, convertTo8CharacterHexAddress} from '../../Util/ValueConversion';

function addAdditionalTraversalPath (state, instruction) {
  state.additionalPaths.push(state.pc + instruction.length);
  return state;
}

export function parseJumpInstruction (instruction, state) {
  if (!isJumpInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction);
  let comments = '';
  if (isRelativeJump(instruction)) {
    comments = ' ; ' + convertToHex(jumpDestination, '0x');
  }
  state = saveDisassemblyInformationForAddress(instruction, state, comments);
  if (isJumpConditionalInstruction(instruction)) {
    addAdditionalTraversalPath(state, instruction);
  }
  state.pc = jumpDestination;
  return state;
}

export function parseCallInstruction (instruction, state) {
  if (!isCallInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction);
  const jumpBackLocation = state.pc + instruction.length;
  state.callStack.push(jumpBackLocation);
  state.pc = jumpDestination;
  return state;
}

export function parseRetInstruction (instruction, state) {
  if (!isRetInstruction(instruction)) return state;
  const jumpDestination = state.callStack.pop();
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction);
  if (isRetConditionalInstruction(instruction)) {
    addAdditionalTraversalPath(state, instruction);
  }
  state.pc = jumpDestination;
  return state;
}

function saveDisassemblyInformationForAddress (instruction, state, comments = '') {
  //
  // Here pc is pointing to the first instruction in this opcode
  //
  const instructionPCAddress = convertTo8CharacterHexAddress(state.pc);
  state.allAssemblyInstructions[instructionPCAddress] = DisassembleBytesWithLinearSweep(instruction) + comments;
  return state;
}

/**
 *
 *
 * @param {any} instruction
 * @param {any} state
 * @returns
 */
export function parseInstruction (instruction, state) {
  if (instruction.length > 3) {
    console.info('instruction.length:', instruction.length, instruction);
  }
  //
  // Here pc is pointing to the first instruction in this opcode
  //
  state = saveDisassemblyInformationForAddress(instruction, state);
  // now calculate jumps etc
  const programCounterForThisInstruction = state.pc;
  state = parseJumpInstruction(instruction, state);
  state = parseCallInstruction(instruction, state);
  state = parseRetInstruction(instruction, state);
  if (state.pc === programCounterForThisInstruction) {
    state = gotoNextInstructionLocation(state, instruction);
  }
  return state;
}

/**
 * Go to the next instruction (update the program counter)
 *  * this goes to the current pc plus the length of the current instruction (which gives the start address of the next function, no need to add an additional 1)
 * @param {any} state
 * @param {any} instruction
 * @returns
 */
function gotoNextInstructionLocation (state, instruction) {
  state.pc += instruction.length;
  return state;
}

function isRelativeJump (instruction) {
  if (instruction.length === 2) return true;
  return false;
}

export function calculateJumpLocation (instruction, state) {
  if (!isRelativeJump(instruction)) {
    const hexString = instruction[2].toString(16) + '' + instruction[1].toString(16);
    return convertHexStringToNumber(hexString);
  }
  //
  // This presumes the current pc points to the first byte in this instruction
  //
  const signedValueOfRelativeJump = convertTo8BitSignedValue(instruction[1]);
  if (signedValueOfRelativeJump >= 0) { return state.pc + (instruction.length) + signedValueOfRelativeJump; }
  return state.pc + signedValueOfRelativeJump;
}
