import {isJumpInstruction, isCallInstruction, isRetInstruction, isRetConditionalInstruction} from '../../disassemblerInstructions';
import {DisassembleBytesWithLinearSweep} from '../../linearSweepDisassembler/LinearSweepDisassembler';
import {convertTo8BitSignedValue, convertHexStringToNumber, convertToHex} from '../../Util/ValueConversion';

export function parseJumpInstruction (instruction, state) {
  if (!isJumpInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction);
  state.additionalPaths.push(state.pc + instruction.length);
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
    state.additionalPaths.push(state.pc + instruction.length);
  }
  state.pc = jumpDestination;
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
  const instructionPCAddress = convertToHex(state.pc);
  state.allAssemblyInstructions[instructionPCAddress] = DisassembleBytesWithLinearSweep(instruction);
  // now calculate jumps etc
  const programCounterForThisInstruction = state.pc;
  state = parseJumpInstruction(instruction, state);
  state = parseCallInstruction(instruction, state);
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

export function calculateJumpLocation (instruction, state) {
  if (instruction.length === 3) {
    const hexString = instruction[2].toString(16) + '' + instruction[1].toString(16);
    return convertHexStringToNumber(hexString);
  }
  return state.pc + convertTo8BitSignedValue(instruction[1]);
}
