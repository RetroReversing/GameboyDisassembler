import {isJumpInstruction, isLoadInstruction, isCallInstruction, isRetInstruction, isJumpConditionalInstruction, isRetConditionalInstruction, loadInstructions} from '../../disassemblerInstructions';
import {DisassembleBytesWithLinearSweep} from '../../linearSweepDisassembler/LinearSweepDisassembler';
import {convertToHex, convertTo2CharacterHexAddress, convertTo8BitSignedValue, convertHexStringToNumber, convertTo8CharacterHexAddress} from '../../Util/ValueConversion';
import {logAction, logError} from '../../Util/Logger';
import {hasAlreadyVisited} from '../RecursiveTraversalDisassembler';
import * as _ from 'lodash';

function addAdditionalTraversalPath (state, instruction) {
  state.additionalPaths.push(state.pc + instruction.length);
  return state;
}

export function parseJumpInstruction (instruction, state, additionalDetails='') {
  if (!isJumpInstruction(instruction)) return state;
  
  if (instruction[0] === 233) {
    console.error('Warning: Not Handling JP [HL] at: ', convertTo8CharacterHexAddress(state.pc,state,' Not Handling JP [HL] in parseJumpInstruction'));
    return state;
  }
  const jumpDestination = calculateJumpLocation(instruction, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction, state, additionalDetails+' via parseJumpInstruction');
  let comments = '';
  if (isRelativeJump(instruction)) {
    comments = ' ; ' + convertToHex(jumpDestination, '0x');
  }
  state = saveDisassemblyInformationForAddress(instruction, state, comments, additionalDetails+' via parseJumpInstruction');
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

function handleCallJumping (jumpDestination, instruction, state, additionalDetails='') {
  const userFriendlyJumpLocation = state.symbols[jumpDestination] || convertTo8CharacterHexAddress(jumpDestination, state, 'handleCallJumping jumpDestination');
  logAction('--> Jumping to: ' + userFriendlyJumpLocation, state);
  state.jumpAddresses.push(jumpDestination);
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction, state, additionalDetails+' via handleCallJumping');
  const jumpBackLocation = state.pc + instruction.length;
  logAction('-- Add To Callstack (for RET): ' + convertTo8CharacterHexAddress(jumpBackLocation, state, 'handleCallJumping jumpBackLocation'), state);
  state.callStack.push(jumpBackLocation);
  state.pc = jumpDestination;
  return state;
}

export function parseCallInstruction (instruction, state) {
  if (!isCallInstruction(instruction)) return state;
  const jumpDestination = calculateJumpLocation(instruction, state);
  const userFriendlyJumpLocation = state.symbols[jumpDestination] || convertTo8CharacterHexAddress(jumpDestination, state, 'parseCallInstruction');
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

function parseBankSwitch(state) {
  logAction(`BANK: Bank switch to ${state.a}`, state);
  const pcFormattedAsString = convertTo8CharacterHexAddress(state.pc);
  state.infoMessages.push(`Info: Bank switch to ${state.a} at 0x${pcFormattedAsString}`);
  state.bank = state.a;
  state.bankSwitches[state.pc] = state.a;
  return state;
}

function parseOperands(expression, instruction) {
  if (expression === '[a16]') { 
    const address16 = convert16BitInstructionOperandsToNumber(instruction);
    return '['+address16+']';
  }
  if (expression === 'd8') {
    const immediateValue = convert8BitInstructionOperandToNumber(instruction);
    return 'i:'+immediateValue;
  }
  return expression;
}

function parseLoadSource(loadInstructionInfo, instruction, state) {
  let loadSource = loadInstructionInfo.load.toLowerCase();
  loadSource = parseOperands(loadSource, instruction);
  return loadSource;
}
function parseLoadDestination(loadInstructionInfo, instruction, state) {
  let loadDestination = loadInstructionInfo.into.toLowerCase();
  loadDestination = parseOperands(loadDestination, instruction);
  return loadDestination;
}

function handleLoadFromImmediateValue(loadSource, loadDestination, state) {
  if (!_.startsWith(loadSource,'i:') ) return state;
  state[loadDestination] = +loadSource.replace('i:','');
  return state;
}

export function executeLoadInstruction(instruction, state) {
  const opCodeAsHexString = '0x'+convertTo2CharacterHexAddress(instruction[0]).toLowerCase();
  const loadInstructionInfo = loadInstructions[opCodeAsHexString];
  const loadDestination = parseLoadDestination(loadInstructionInfo, instruction, state);
  const loadSource = parseLoadSource(loadInstructionInfo, instruction, state);
  if (_.startsWith(loadDestination,'[') ) {
    const destination = loadDestination.replace('[','').replace(']','');
    state.memory[destination] = state[loadSource];
    return state;
  } 
  else if (_.startsWith(loadSource,'i:') ) {
    state = handleLoadFromImmediateValue(loadSource,loadDestination, state);
  }
  else {
    state[loadDestination] = state[loadSource];
    return state;
  }
  // TODO: Finish implementing this for more load instructions
  console.error('instruction:',instruction,loadInstructionInfo,loadDestination,'=',loadSource,state[loadDestination]);
  return state;
}

export function parseLoadInstruction (instruction, state, additionalDetails='') {
  if (!isLoadInstruction(instruction)) return state;
  const ROM_ONLY = 0;
  const mbc = 1;
  const addr16 = convert16BitInstructionOperandsToNumber(instruction);
  if(mbc != ROM_ONLY && (addr16 == 0x2000 || addr16 == 0x2100)) {
    return parseBankSwitch(state);
  }
  
  return executeLoadInstruction(instruction, state);
}

export function parseRetInstruction (instruction, state, additionalDetails='') {
  if (!isRetInstruction(instruction)) return state;
  const jumpDestination = state.callStack.pop();
  if (!jumpDestination) {
    logError('No more Calls in the callstack for parsing the Ret instruction');
    return state;
  }
  let userFriendlyJumpLocation = state.symbols[jumpDestination] || convertTo8CharacterHexAddress(jumpDestination,state,'parseRetInstruction jumpDestination callstack.pop');
  state.jumpAssemblyInstructions[state.pc] = DisassembleBytesWithLinearSweep(instruction, state, additionalDetails+' via parseRetInstruction');
  if (isRetConditionalInstruction(instruction)) {
    userFriendlyJumpLocation+=' (Conditional)'
    addAdditionalTraversalPath(state, instruction);
  }
  logAction('<-- RETurn to: ' + userFriendlyJumpLocation, state);
  state.nextAddress = jumpDestination;
  state.pc = jumpDestination;
  return state;
}

function saveDisassemblyInformationForAddress (instruction, state, comments = '', additionalDetails='') {
  //
  // Here pc is pointing to the first instruction in this opcode
  //
  const instructionPCAddress = convertTo8CharacterHexAddress(state.pc, state, additionalDetails+' -> saveDisassemblyInformationForAddress');
  if (state.symbols[state.pc]) {
    if (state.allowSymbols)
    comments+='; '+state.symbols[state.pc];
  }
  state.allAssemblyInstructions[instructionPCAddress] = DisassembleBytesWithLinearSweep(instruction,state,additionalDetails+' via saveDisassemblyInformationForAddress') + comments;
  return state;
}

function logExecutionOfInstructionWithSymbol(state) {
  if (!state.symbols[state.pc]) return state;
  const userFriendlyJumpLocation = state.symbols[state.pc] + ' ('+ convertTo8CharacterHexAddress(state.pc,state,'logExecutionOfInstructionWithSymbol')+')';  
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
export function parseInstruction (instruction, state, additionalDetails='') {
  if (instruction.length > 3) {
    console.info('instruction.length:', instruction.length, instruction);
  }
  logExecutionOfInstructionWithSymbol(state);
  //
  // Here pc is pointing to the first instruction in this opcode
  //
  state = saveDisassemblyInformationForAddress(instruction, state, '', additionalDetails+' --> parseInstruction');
  // now calculate jumps etc
  const programCounterForThisInstruction = state.pc;
  state = parseJumpInstruction(instruction, state);
  state = parseCallInstruction(instruction, state);
  state = parseRetInstruction(instruction, state);
  state = parseLoadInstruction(instruction,state);

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

export function convert16BitInstructionOperandsToNumber(instruction) {
  const hexString = convertTo2CharacterHexAddress(instruction[2]) + '' + convertTo2CharacterHexAddress(instruction[1]);
  return convertHexStringToNumber(hexString);
}
export function convert8BitInstructionOperandToNumber(instruction) {
  const hexString = convertTo2CharacterHexAddress(instruction[1]);
  return convertHexStringToNumber(hexString);
}

export function calculateJumpLocation (instruction, state) {
  if (!isRelativeJump(instruction)) {
    return convert16BitInstructionOperandsToNumber(instruction);
  }
  //
  // This presumes the current pc points to the first byte in this instruction
  //
  const signedValueOfRelativeJump = convertTo8BitSignedValue(instruction[1]);
  const properProgramCounterAlwaysPointsToNextInstruction = state.pc + (instruction.length);
  if (signedValueOfRelativeJump >= 0) { return properProgramCounterAlwaysPointsToNextInstruction + signedValueOfRelativeJump; }
  return properProgramCounterAlwaysPointsToNextInstruction + signedValueOfRelativeJump;
}
