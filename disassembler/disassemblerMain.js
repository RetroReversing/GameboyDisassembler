import {isJumpInstruction, isCallInstruction, oneByteInstructions, twoByteInstructions, threeByteInstructions, cbPrefixedOps} from './disassemblerInstructions';
const { Seq } = require('immutable');
const _ = require('lodash');

function handleCBPrefixedInstructions (CBByte, actualInstruction) {
  if (CBByte !== 0xCB) return 'Error value not CB';
  return cbPrefixedOps[actualInstruction];
}

function handleTwoByteInstructions (byteValue, operandByte) {
  const instruction = twoByteInstructions[byteValue];
  const operand = convertToHex(operandByte);
  return instruction + ' ' + operand;
}

function handleThreeByteInstructions (byteValue, operandByte1, operandByte2) {
  const instruction = threeByteInstructions[byteValue];
  const operand = convertToHex(operandByte2) + convertToHex(operandByte1, '');
  return instruction + ' ' + operand;
}

function disassembleByte (byteValue, key, byteArray) {
  const opcode = byteValue[0];
  if (oneByteInstructions[opcode]) { return oneByteInstructions[opcode]; }
  const operand = byteValue[1];
  if (opcode === 0xCB) {
    return handleCBPrefixedInstructions(opcode, operand);
  }
  if (twoByteInstructions[opcode]) {
    return handleTwoByteInstructions(opcode, operand);
  }
  if (threeByteInstructions[opcode]) {
    return handleThreeByteInstructions(opcode, operand, byteValue[2]);
  }
}

function getNumberOfBytesForInstruction (opcode) {
  if (opcode === 0xCB) return 2;
  if (oneByteInstructions[opcode]) { return 1; }
  if (twoByteInstructions[opcode]) { return 2; }
  if (threeByteInstructions[opcode]) { return 3; }
    //
    // # For unknown opcodes such as 0xDD it should just be 1 byte
    //
  return 1;
}

function skipBytesAndAddOperandsToLastInstruction (assemblyInstructions, operandValue) {
  const lastInstructionEntryIndex = assemblyInstructions.lastAddedInstruction;
  assemblyInstructions.instructions[lastInstructionEntryIndex].push(operandValue);
  assemblyInstructions.skipBytes -= 1;
  return assemblyInstructions;
}

function handleOpcode (value, assemblyInstructions, addressOfOpcode) {
  assemblyInstructions.instructions[addressOfOpcode] = [value];
  assemblyInstructions.skipBytes = getNumberOfBytesForInstruction(value) - 1;
  assemblyInstructions.lastAddedInstruction = addressOfOpcode;
  assemblyInstructions.keys.push(addressOfOpcode);
  return assemblyInstructions;
}

export function joinOpcodesAndOperands (assemblyInstructions, value, index, collection) {
  if (assemblyInstructions.skipBytes === 0) {
    return handleOpcode(value, assemblyInstructions, index);
  }
  return skipBytesAndAddOperandsToLastInstruction(assemblyInstructions, value, index);
}

export function reduceBytesToDisassembleIntoInstructionGroupData (bytesToDisassemble) {
  return _.reduce(bytesToDisassemble, joinOpcodesAndOperands, {instructions: {}, skipBytes: 0, keys: []});
}

function reduceBytesToDisassembleIntoInstructionGroups (bytesToDisassemble) {
  return reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble).instructions;
}

export function calculateJumpLocation (instruction) {
  if (instruction.length === 3) {
    const hexString = instruction[2].toString(16) + '' + instruction[1].toString(16);
    return convertHexStringToNumber(hexString);
  }
  return instruction[1];
}

/**
 *
 *
 * @param {any} instruction
 * @param {any} state
 * @returns
 */
function parseInstruction (instruction, state) {
  if (instruction.length > 3) {
    console.log('instruction.length:', instruction.length, instruction);
  }
  state.pc += instruction.length;
  if (isJumpInstruction(instruction)) {
    const jumpDestination = calculateJumpLocation(instruction);
    state.jumpAddresses.push(jumpDestination);
    state.pc = jumpDestination;
  } else {
    console.log('Not a jump instruction:', instruction[0]);
  }
  return state;
}

let visitedLocations = {};

export function hasAlreadyVisited (state) {
  if (visitedLocations[state.pc]) {
    console.log('Already Visited:', state.pc);
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
  let state = {pc: startAddress, jumpAddresses: [startAddress]};
  let maxLoops = 20;
  let currentLoop = 0;
  while (true) {
    const instruction = groupsOfInstructions.instructions[state.pc];
    if (!instruction) {
      console.log('Instruction was undefined', instruction);
      break;
    }
    state = parseInstruction(instruction, state);
    currentLoop++;
    if (hasAlreadyVisited(state) || currentLoop > maxLoops) { break; }
  }
    // groupsOfInstructions.keys.forEach(function(address) {
    //     addressesToJumpTo.push(address);
    // })
  return state.jumpAddresses;
}

/**
 * Find all Jump instructions in a rom
 * @export
 * @param {any} bytesToDisassemble
 * @param {any} startAddress
 * @returns
 */
export function findAllJumpInstructions (bytesToDisassemble, startAddress) {
  const groupsOfInstructions = reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble);
  return disassembleLoop(startAddress, groupsOfInstructions, []);
}

export function DisassembleRomBytes (bytesToDisassemble, startAddress = 0x100) {
  return DisassembleBytes(bytesToDisassemble);
}

/**
 * Disassemble Bytes only disassembles known code bytes, if you also have data bytes use DisassembleRomBytes
 *
 * @export
 * @param {any} bytesToDisassemble
 * @returns
 */
export function DisassembleBytes (bytesToDisassemble) {
  const instructions = reduceBytesToDisassembleIntoInstructionGroups(bytesToDisassemble);
  return Seq(instructions)
           .map(disassembleByte)
           .filter(assemblyCode => assemblyCode !== '')
           .toArray();
}

export function convertToHex (value, prefix = '$') {
  if (value === undefined) return 'ErrorInConvertToHex';
  return prefix + ((value).toString(16)).toUpperCase();
}

export function convertHexStringToNumber (hexString) {
  return parseInt(hexString, 16);
}
