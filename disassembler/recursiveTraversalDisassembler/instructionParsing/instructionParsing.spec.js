import {parseRetInstruction, parseCallInstruction, calculateJumpLocation, parseJumpInstruction} from './instructionParsing';
import * as assert from 'assert';
import { describe, it, beforeEach } from 'mocha';

var blankState;
beforeEach(function () {
  blankState = {callStack: [0x100], jumpAssemblyInstructions: {}, additionalPaths: [], jumpAddresses: [], pc: 0x00};
});

describe('Instruction parsing', function () {
  it('should parse RET instruction and jump back to where it was called from', function () {
    const resultState = parseRetInstruction([0xC0], blankState);
    assert.deepEqual(resultState.pc, 0x100);
    assert.deepEqual(resultState.callStack, []);
  });

  it('should parse Call instruction and jump to that location', function () {
    const resultState = parseCallInstruction([0xC4, 0x20, 0x00], {callStack: [], jumpAssemblyInstructions: {}, jumpAddresses: [], pc: 0x100, additionalPaths: []});
    assert.deepEqual(resultState.pc, 32);
    const callStackSgouldHaveReturnAddressPlusSizeOfInstruction = 259;
    assert.deepEqual(resultState.callStack, [callStackSgouldHaveReturnAddressPlusSizeOfInstruction]);
  });

  it('should parse Relative Jump instruction and jump to that location (0x6F + instruction length (2) + jump of 3)', function () {
    blankState.pc = 0x6F;
    const resultState = parseJumpInstruction([0x18, 0x03], blankState);
    assert.deepEqual(resultState.pc, 0x74);
  });
});

describe('Calculating jump location', function () {
  it('should be able to convert [C3,80,01] to 0x150 (336)', function () {
    const result = calculateJumpLocation([0xC3, 80, 1], {pc: 0x100});
    assert.deepEqual(result, 336);
  });

  it('should be able to support short jumps +2 bytes', function () {
    const result = calculateJumpLocation([0x18, 0x02], {pc: 0x00});
    assert.deepEqual(result, 0x04);
  });

  it('should be able to support short jumps -2 bytes', function () {
    const result = calculateJumpLocation([0x18, 130], {pc: 0x100});
    assert.deepEqual(result, 254);
  });
});
