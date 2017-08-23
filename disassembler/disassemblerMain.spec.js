import {DisassembleBytes, convertTo8BitSignedValue, is8BitSignedValueNegative, convertToHex, hasAlreadyVisited, convertHexStringToNumber, joinOpcodesAndOperands, calculateJumpLocation} from './disassemblerMain';
import {isJumpInstruction, isCallInstruction, isRetInstruction} from './disassemblerInstructions';
import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Disassemble Rom', function () {
  it('should generate assembly output for single INC C', function (done) {
    const resultingAssembly = DisassembleBytes([0x0C]);
    assert.equal(resultingAssembly[0], 'INC C');
    done();
  });

  it('should generate assembly output for NOP', function () {
    const resultingAssembly = DisassembleBytes([0x00]);
    assert.equal(resultingAssembly[0], 'NOP');
  });

  it('should support 2-byte jump return instructions', function () {
    const resultingAssembly = DisassembleBytes([0x18, 0xBE]);
    assert.equal(resultingAssembly[0], 'JR $BE');
  });
  it('should support 2-byte jump return instructions with $AE', function () {
    const resultingAssembly = DisassembleBytes([0x18, 0xAE]);
    assert.equal(resultingAssembly[0], 'JR $AE');
  });

  it('should support multiple 2-byte instructions', function () {
    const resultingAssembly = DisassembleBytes([0xE6, 0xBE, 0xF6, 0xF0]);
    assert.deepEqual(resultingAssembly, [ 'AND $BE', 'OR $F0' ]);
  });

  it('should support 3-byte jump instructions', function () {
    const resultingAssembly = DisassembleBytes([0xC3, 0xD3, 0x64]);
    assert.equal(resultingAssembly[0], 'JP $64D3');
  });

  it('should support 3-byte jump instructions to location $69A5', function () {
    const resultingAssembly = DisassembleBytes([0xC3, 0xA5, 0x69]);
    assert.equal(resultingAssembly[0], 'JP $69A5');
  });

  it('should support 3 byte CALL instruction', function () {
    const resultingAssembly = DisassembleBytes([0xCD, 0x5E, 0x6D]);
    assert.equal(resultingAssembly[0], 'CALL $6D5E');
  });

  it('should support 2-byte jump return instruction followed by a NOP', function () {
    const resultingAssembly = DisassembleBytes([0x18, 0xAE, 0x00]);
    assert.deepEqual(resultingAssembly, ['JR $AE', 'NOP']);
  });

  it('should support CB Prefix instructions ', function () {
    const resultingAssembly = DisassembleBytes([0xCB, 0x40]);
    assert.deepEqual(resultingAssembly, ['BIT 0,B']);
  });

    //
    // Test Conversion to Hex
    //
  it('should convert 174 to hex value $AE', function () {
    const hexResult = convertToHex(174);
    assert.equal(hexResult, '$AE');
  });

  it('should convert 1211 to hex value $4BB', function () {
    const hexResult = convertToHex(1211);
    assert.equal(hexResult, '$4BB');
  });

  it('should return error when not provided parameter', function () {
    const hexResult = convertToHex();
    assert.equal(hexResult, 'ErrorInConvertToHex');
  });

  it('should return $0 when provided 0', function () {
    const hexResult = convertToHex(0);
    assert.equal(hexResult, '$0');
  });

  it('should be able to join opcodes and operands into one array', function () {
    const instructionResult = joinOpcodesAndOperands({instructions: {}, skipBytes: 0, keys: []}, 0x18, 0, []);
    assert.deepEqual(instructionResult, { instructions: {0: [24]}, skipBytes: 1, 'lastAddedInstruction': 0, 'keys': [0] });
  });

  it('should be able to add a visited located to the map', function () {
    const result = hasAlreadyVisited({pc: 0x100});
    assert.deepEqual(result, false);
  });

  it('should be able to convert #FFFF to number', function () {
    const result = convertHexStringToNumber('FFFF');
    assert.deepEqual(result, 65535);
  });

  it('should be able to convert [C3,80,01] to 0x150 (336)', function () {
    const result = calculateJumpLocation([0xC3, 80, 1], {pc: 0x100});
    assert.deepEqual(result, 336);
  });

  it('should return true for all valid jump instructions', function () {
    const validJumpInstructions = [0x18, 0xC3, 0x20, 0x28, 0x30, 0x38, 0xC2, 0xC3, 0xCA, 0xD2, 0xDA, 0xE9];
    validJumpInstructions.forEach(jmp => {
      const result = isJumpInstruction([jmp]);
      assert.deepEqual(result, {});
    });
  });

  it('should return true for all valid CALL instructions', function () {
    const validJumpInstructions = [ 196, 204, 205, 212, 220 ];
    validJumpInstructions.forEach(jmp => {
      const result = isCallInstruction([jmp]);
      assert.deepEqual(result, {});
    });
  });

  it('should return true for all valid RET instructions', function () {
    const validJumpInstructions = [ 0xC0, 0xC8, 0xC9, 0xD0, 0xD8, 0xD9 ];
    validJumpInstructions.forEach(jmp => {
      const result = isRetInstruction([jmp]);
      assert.deepEqual(result, {});
    });
  });

  it('should be able to detect if a signed value is negative', function () {
    const result = is8BitSignedValueNegative(129);
    assert.equal(result, true);
  });

  it('should be able to detect if a signed value is positive', function () {
    const result = is8BitSignedValueNegative(12);
    assert.equal(result, false);
  });

  it('should be able to convert to negative 8Bit Signed Value', function () {
    const result = convertTo8BitSignedValue(129);
    assert.equal(result, -1);
  });

  it('should be able to convert to positive 8Bit Signed Value', function () {
    const result = convertTo8BitSignedValue(12);
    assert.equal(result, 12);
  });

  it('should be able to support short jumps +2 bytes', function () {
    const result = calculateJumpLocation([0x18, 0x02], {pc: 0x100});
    assert.deepEqual(result, 258);
  });

  it('should be able to support short jumps -2 bytes', function () {
    const result = calculateJumpLocation([0x18, 130], {pc: 0x100});
    assert.deepEqual(result, 254);
  });
});
