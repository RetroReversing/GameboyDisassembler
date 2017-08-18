import {one_byte_instructions, two_byte_instructions, three_byte_instructions, cb_prefixed_ops} from './disassemblerInstructions';
const { Seq } = require('immutable');
const _ = require('lodash');

function handleCBPrefixedInstructions (CBByte, actualInstruction) {
  if (CBByte !== 0xCB) return 'Error value not CB';
  return cb_prefixed_ops[actualInstruction];
}

function handleTwoByteInstructions (byteValue, operandByte) {
  const instruction = two_byte_instructions[byteValue];
  const operand = convertToHex(operandByte);
  return instruction + ' ' + operand;
}

function handleThreeByteInstructions (byteValue, operandByte1, operandByte2) {
  const instruction = three_byte_instructions[byteValue];
  const operand = convertToHex(operandByte2) + convertToHex(operandByte1, '');
  return instruction + ' ' + operand;
}

function disassembleByte (byteValue, key, byteArray) {
  const opcode = byteValue[0];
  if (one_byte_instructions[opcode]) { return one_byte_instructions[opcode]; }
  const operand = byteValue[1];
  if (opcode === 0xCB) {
    return handleCBPrefixedInstructions(opcode, operand);
  }
  if (two_byte_instructions[opcode]) {
    return handleTwoByteInstructions(opcode, operand);
  }
  if (three_byte_instructions[opcode]) {
    return handleThreeByteInstructions(opcode, operand, byteValue[2]);
  }
}

function getNumberOfBytesForInstruction (opcode) {
  if (opcode === 0xCB) return 2;
  if (one_byte_instructions[opcode]) { return 1; }
  if (two_byte_instructions[opcode]) { return 2; }
  if (three_byte_instructions[opcode]) { return 3; }
    //
    // # For unknown opcodes such as 0xDD it should just be 1 byte
    //
  return 1;
}

function skipBytesAndAddOperandsToLastInstruction (assemblyInstructions, operandValue) {
  const lastInstructionEntryIndex = assemblyInstructions.lastAddedInstruction;
    // console.error('addressOfOpcode',addressOfOpcode);
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

function reduceBytesToDisassembleIntoInstructionGroupData (bytesToDisassemble) {
  return _.reduce(bytesToDisassemble, joinOpcodesAndOperands, {instructions: {}, skipBytes: 0, keys: []});
}

function reduceBytesToDisassembleIntoInstructionGroups (bytesToDisassemble) {
  return reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble).instructions;
}

const jumpInstructions = {
  0x18: true,
  0xC3: {}
};
function isJumpInstruction (instruction) {
  return jumpInstructions[instruction[0]];
}

function calculateJumpLocation (instruction) {
  if (instruction.length === 3) {
    return convertHexStringToNumber(instruction[1] + '' + instruction[2]);
  }
  return instruction[1];
}

function parseInstruction (instruction, state) {
  if (instruction.length > 3) {
    console.log('instruction.length:', instruction.length, instruction);
  }
  state.pc += instruction.length;
  if (isJumpInstruction(instruction)) {
    state.jumpAddresses.push(calculateJumpLocation(instruction));
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
  addressesToJumpTo.push(startAddress);
  let nextAddress = startAddress;
  let state = {pc: startAddress, jumpAddresses: [startAddress]};
  let maxLoops = 2;
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
  groupsOfInstructions[startAddress];
  return state.jumpAddresses;
}

export function findAllJumpInstructions (bytesToDisassemble, startAddress) {
  let jumpInstructions = [startAddress];
  bytesToDisassemble[startAddress];
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
