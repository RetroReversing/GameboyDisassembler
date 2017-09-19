import {isJumpInstruction, isCallInstruction, isRetInstruction, isJumpConditionalInstruction, isRetConditionalInstruction} from '../../disassemblerInstructions';
import {DisassembleBytesWithLinearSweep} from '../../linearSweepDisassembler/LinearSweepDisassembler';
import {convertToHex, convertTo2CharacterHexAddress, convertTo8BitSignedValue, convertHexStringToNumber, convertTo8CharacterHexAddress} from '../../Util/ValueConversion';
import {logAction} from '../../Util/Logger';
import {hasAlreadyVisited} from '../RecursiveTraversalDisassembler';

function addAdditionalTraversalPath (state, instruction) {
  state.additionalPaths.push(state.pc + instruction.length);
  return state;
}

export function parseJumpInstruction (instruction, state) {
  if (!isJumpInstruction(instruction)) return state;
  
  if (instruction[0] === 233) {
    console.error('Warning: Not Handling JP [HL] at: ', convertTo8CharacterHexAddress(state.pc));
    return state;
  }
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

function addUsageofAJumpableAddress (usedAddress, state) {
  if (!state.usages) state.usages = {};
  if (!state.usages[usedAddress]) state.usages[usedAddress] = [];
  state.usages[usedAddress].push(state.pc);
  return state;
}

function numberOfUsagesOfJumpableAddress (usedAddress, state) {
  if (!state.usages) return 0;
  if (!state.usages[usedAddress]) return 0;
  return state.usages[usedAddress].length;
}

function handleCallJumping (jumpDestination, instruction, state) {
  const userFriendlyJumpLocation = state.symbols[jumpDestination] || convertTo8CharacterHexAddress(jumpDestination);
  logAction('--> Jumping to: ' + userFriendlyJumpLocation, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction);
  const jumpBackLocation = state.pc + instruction.length;
  logAction('-- Add To Callstack (for RET): ' + convertTo8CharacterHexAddress(jumpBackLocation), state);
  state.callStack.push(jumpBackLocation);
  state.pc = jumpDestination;
  return state;
}

export function parseCallInstruction (instruction, state) {
  if (!isCallInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  const userFriendlyJumpLocation = state.symbols[jumpDestination] || convertTo8CharacterHexAddress(jumpDestination);
  logAction('--> Calling: ' + userFriendlyJumpLocation+' '+instruction, state);
  state = addUsageofAJumpableAddress(jumpDestination, state);
  if (numberOfUsagesOfJumpableAddress(jumpDestination, state) > 1) return state;
  
  state = addAdditionalTraversalPath(state, instruction);
  if (hasAlreadyVisited(jumpDestination)) {
    logAction('--- Already Visited: ' + userFriendlyJumpLocation+' '+instruction, state);
    return state;
  }
  state = handleCallJumping(jumpDestination, instruction, state);
  return state;
}

export function parseRetInstruction (instruction, state) {
  if (!isRetInstruction(instruction)) return state;
  const jumpDestination = state.callStack.pop();
  let userFriendlyJumpLocation = state.symbols[jumpDestination] || convertTo8CharacterHexAddress(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction);
  if (isRetConditionalInstruction(instruction)) {
    userFriendlyJumpLocation+=' (Conditional)'
    addAdditionalTraversalPath(state, instruction);
  }
  logAction('<-- RETurn to: ' + userFriendlyJumpLocation, state);
  state.nextAddress = jumpDestination;
  state.pc = jumpDestination;
  return state;
}

function saveDisassemblyInformationForAddress (instruction, state, comments = '') {
  //
  // Here pc is pointing to the first instruction in this opcode
  //
  const instructionPCAddress = convertTo8CharacterHexAddress(state.pc);
  if (state.symbols[state.pc]) {
    comments+='; '+state.symbols[state.pc];
  }
  state.allAssemblyInstructions[instructionPCAddress] = DisassembleBytesWithLinearSweep(instruction) + comments;
  return state;
}

function logExecutionOfInstructionWithSymbol(state) {
  if (!state.symbols[state.pc]) return state;
  const userFriendlyJumpLocation = state.symbols[state.pc] + ' ('+ convertTo8CharacterHexAddress(state.pc)+')';  
  logAction('Executing Instruction: '+userFriendlyJumpLocation,state);
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
  logExecutionOfInstructionWithSymbol(state);
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
    return gotoNextInstructionLocation(state, instruction);
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
    const hexString = convertTo2CharacterHexAddress(instruction[2]) + '' + convertTo2CharacterHexAddress(instruction[1]);
    return convertHexStringToNumber(hexString);
  }
  //
  // This presumes the current pc points to the first byte in this instruction
  //
  const signedValueOfRelativeJump = convertTo8BitSignedValue(instruction[1]);
  const properProgramCounterAlwaysPointsToNextInstruction = state.pc + (instruction.length);
  if (signedValueOfRelativeJump >= 0) { return properProgramCounterAlwaysPointsToNextInstruction + signedValueOfRelativeJump; }
  return properProgramCounterAlwaysPointsToNextInstruction + signedValueOfRelativeJump;
}
