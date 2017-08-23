import {isJumpInstruction, isCallInstruction, isRetInstruction} from '../disassemblerInstructions';
import {calculateJumpLocation, DisassembleBytes} from '../disassemblerMain';

export function parseJumpInstruction (instruction, state) {
  if (!isJumpInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytes(instruction);
  state.pc = jumpDestination;
  return state;
}

export function parseCallInstruction (instruction, state) {
  if (!isCallInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytes(instruction);
  state.callStack.push(state.pc);
  state.pc = jumpDestination;
  return state;
}

export function parseRetInstruction (instruction, state) {
  if (!isRetInstruction(instruction)) return state;
  const jumpDestination = state.callStack.pop();
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytes(instruction);
  state.pc = jumpDestination;
  return state;
}
