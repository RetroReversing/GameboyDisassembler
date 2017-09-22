import {oneByteInstructions, twoByteInstructions, threeByteInstructions, cbPrefixedOps} from '../disassemblerInstructions';
import {convertToHex, convertTo2CharacterHexAddress} from '../Util/ValueConversion';
import {template, reduce, templateSettings, includes} from 'lodash';
import {logError} from '../Util/Logger';
const { Seq } = require('immutable');
templateSettings.interpolate = /{{([\s\S]+?)}}/g;

/**
 * Disassembles a single instruction (opcode + operands)
 *
 * @param {byte[]} byteValue (bytes for this instruction)
 * @param {any} key
 * @param {any} byteArray
 * @returns
 */
export function disassembleByte (byteValue, key, byteArray, state={}, additionalDetails='') {
  const opcode = byteValue[0];
  if (oneByteInstructions[opcode]) { return oneByteInstructions[opcode]; }
  const operand = byteValue[1];
  if (opcode === 0xCB) {
    return handleCBPrefixedInstructions(opcode, operand);
  }
  if (twoByteInstructions[opcode]) {
    return handleTwoByteInstructions(opcode, operand, state, additionalDetails+' via disassembleByte');
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

function handleTwoByteInstructions (byteValue, operandByte, state={}, additionalDetails='') {
  const instructionString = twoByteInstructions[byteValue];
  if (typeof(operandByte) === 'undefined') {
    logError('Error: operandByte was undefined in handleTwoByteInstructions ('+additionalDetails+')');
  }
  const operand = '$' + convertTo2CharacterHexAddress(operandByte, state, additionalDetails+' via handleTwoByteInstructions');
  if (includes(instructionString, '{{op1}}')) {
    return handleTemplatizedInstruction(instructionString, operand);
  }
  return formatSpacesBetweenOpcodeAndOperandStrings(instructionString, operand);
}

function formatSpacesBetweenOpcodeAndOperandStrings (opcodeString, operandString, spacesBetween = 1) {
  if (opcodeString.slice(-1) === ',') { return opcodeString + operandString; }
  return opcodeString + ' '.repeat(spacesBetween) + operandString;
}

function handleThreeByteInstructions (byteValue, operandByte1, operandByte2, state={}, additionalDetails='') {
  const instructionString = threeByteInstructions[byteValue];

  const operand = '$' + convertTo2CharacterHexAddress(operandByte2) + convertTo2CharacterHexAddress(operandByte1, state, additionalDetails+' via handleThreeByteInstructions');
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

export function reduceBytesIntoInstructions (assemblyInstructions, valueAtAddress, addressOfOpcode, collection) {
  if (assemblyInstructions.skipBytes === 0) {
    return handleOpcode(valueAtAddress, assemblyInstructions, addressOfOpcode);
  }
  return skipBytesAndAddOperandsToLastInstruction(assemblyInstructions, valueAtAddress, addressOfOpcode);
}

export function reduceBytesToDisassembleIntoInstructionGroupData (bytesToDisassemble) {
  return reduce(bytesToDisassemble, reduceBytesIntoInstructions, {instructions: {}, skipBytes: 0, keys: []});
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
export function DisassembleBytesWithLinearSweep (bytesToDisassemble, state={}, additionalDetails='') {
  const instructions = reduceBytesToDisassembleIntoInstructionGroups(bytesToDisassemble);
  additionalDetails+=' via DisassembleBytesWithLinearSweep';
  return Seq(instructions)
           .map((byteValue, key, byteArray) => disassembleByte(byteValue, key, byteArray,state,additionalDetails))
           .filter(assemblyCode => assemblyCode !== '')
           .toArray();
}
