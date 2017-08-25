import {parseRetInstruction, parseCallInstruction, calculateJumpLocation} from './instructionParsing';
import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Instruction parsing', function () {
  it('should parse RET instruction and jump back to where it was called from', function () {
    const resultState = parseRetInstruction([0xC0], {callStack: [0x100], jumpAssemblyInstructions: {}, additionalPaths: []});
    assert.deepEqual(resultState.pc, 0x100);
    assert.deepEqual(resultState.callStack, []);
  });

  it('should parse Call instruction and jump to that location', function () {
    const resultState = parseCallInstruction([0xC4, 0x200, 0x00], {callStack: [], jumpAssemblyInstructions: {}, jumpAddresses: [], pc: 0x100, additionalPaths: []});
    assert.deepEqual(resultState.pc, 512);
    const callStackSgouldHaveReturnAddressPlusSizeOfInstruction = 259;
    assert.deepEqual(resultState.callStack, [callStackSgouldHaveReturnAddressPlusSizeOfInstruction]);
  });
});

describe('Calculating jump location', function () {
  it('should be able to convert [C3,80,01] to 0x150 (336)', function () {
    const result = calculateJumpLocation([0xC3, 80, 1], {pc: 0x100});
    assert.deepEqual(result, 336);
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
