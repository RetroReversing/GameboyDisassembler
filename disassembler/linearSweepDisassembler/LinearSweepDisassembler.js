import {oneByteInstructions, twoByteInstructions, threeByteInstructions, cbPrefixedOps} from '../disassemblerInstructions';
import {convertToHex, convertTo2CharacterHexAddress} from '../Util/ValueConversion';
import {template, reduce, templateSettings, includes} from 'lodash';
const { Seq } = require('immutable');
templateSettings.interpolate = /{{([\s\S]+?)}}/g;

/**
 * Disassembles a single instruction (opcode + operands)
 *
 * @param {any} byteValue
 * @param {any} key
 * @param {any} byteArray
 * @returns
 */
export function disassembleByte (byteValue, key, byteArray) {
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

function handleCBPrefixedInstructions (CBByte, actualInstruction) {
  if (CBByte !== 0xCB) return 'Error value not CB';
  return cbPrefixedOps[actualInstruction];
}

function handleTwoByteInstructions (byteValue, operandByte) {
  const instructionString = twoByteInstructions[byteValue];
  const operand = '$' + convertTo2CharacterHexAddress(operandByte);
  if (includes(instructionString, '{{op1}}')) {
    return handleTemplatizedInstruction(instructionString, operand);
  }
  return formatSpacesBetweenOpcodeAndOperandStrings(instructionString, operand);
}

function formatSpacesBetweenOpcodeAndOperandStrings (opcodeString, operandString, spacesBetween = 1) {
  if (opcodeString.slice(-1) === ',') { return opcodeString + operandString; }
  return opcodeString + ' '.repeat(spacesBetween) + operandString;
}

function handleThreeByteInstructions (byteValue, operandByte1, operandByte2) {
  const instructionString = threeByteInstructions[byteValue];

  const operand = '$' + convertTo2CharacterHexAddress(operandByte2) + convertTo2CharacterHexAddress(operandByte1);
  if (includes(instructionString, '{{op1}}')) {
    return handleTemplatizedInstruction(instructionString, operand);
  }
  return formatSpacesBetweenOpcodeAndOperandStrings(instructionString, operand);
}

function handleTemplatizedInstruction (instructionString, operand) {
  const instructionTemplateFunction = template(instructionString);
  const instruction = instructionTemplateFunction({op1: operand});
  return instruction;
}

function handleOpcode (value, assemblyInstructions, addressOfOpcode) {
  assemblyInstructions.instructions[addressOfOpcode] = [value];
  assemblyInstructions.skipBytes = getNumberOfBytesForInstruction(value) - 1;
  assemblyInstructions.lastAddedInstruction = addressOfOpcode;
  assemblyInstructions.keys.push(addressOfOpcode);
  return assemblyInstructions;
}

function skipBytesAndAddOperandsToLastInstruction (assemblyInstructions, operandValue) {
  const lastInstructionEntryIndex = assemblyInstructions.lastAddedInstruction;
  assemblyInstructions.instructions[lastInstructionEntryIndex].push(operandValue);
  assemblyInstructions.skipBytes -= 1;
  return assemblyInstructions;
}

export function joinOpcodesAndOperands (assemblyInstructions, value, index, collection) {
  if (assemblyInstructions.skipBytes === 0) {
    return handleOpcode(value, assemblyInstructions, index);
  }
  return skipBytesAndAddOperandsToLastInstruction(assemblyInstructions, value, index);
}

export function reduceBytesToDisassembleIntoInstructionGroupData (bytesToDisassemble) {
  return reduce(bytesToDisassemble, joinOpcodesAndOperands, {instructions: {}, skipBytes: 0, keys: []});
}

function reduceBytesToDisassembleIntoInstructionGroups (bytesToDisassemble) {
  return reduceBytesToDisassembleIntoInstructionGroupData(bytesToDisassemble).instructions;
}

/**
 * Disassemble Bytes only disassembles known code bytes, if you also have data bytes use DisassembleBytesWithRecursiveTraversal
 *
 * @export
 * @param {any} bytesToDisassemble
 * @returns
 */
export function DisassembleBytesWithLinearSweep (bytesToDisassemble) {
  const instructions = reduceBytesToDisassembleIntoInstructionGroups(bytesToDisassemble);
  return Seq(instructions)
           .map(disassembleByte)
           .filter(assemblyCode => assemblyCode !== '')
           .toArray();
}
