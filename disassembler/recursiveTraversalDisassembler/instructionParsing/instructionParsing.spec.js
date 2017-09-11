import {parseRetInstruction, parseCallInstruction, calculateJumpLocation, parseJumpInstruction} from './instructionParsing';
import * as assert from 'assert';
import { describe, it, beforeEach } from 'mocha';

var blankState;
beforeEach(function () {
  blankState = {callStack: [0x100], jumpAssemblyInstructions: {}, additionalPaths: [], jumpAddresses: [], pc: 0x00, allAssemblyInstructions: {}};
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
    const result = calculateJumpLocation([0x18, 0xFE], {pc: 0x100});
    assert.deepEqual(result, 0x100 + 2 - 2);
  });

  it('should be able to support short jumps by 0 bytes (jumps to next instruction)', function () {
    const result = calculateJumpLocation([0x18, 0x00], {pc: 0x4A9});
    assert.deepEqual(result, 0x4A9 + 2 + 0);
    assert.deepEqual(result, 0x4AB);
  });

  it('should be able to support negative jumps by -6 bytes', function () {
    const result = calculateJumpLocation([0x20, 0xFA], {pc: 0x4D0});
    assert.deepEqual(result, 0x4D0 + 2 - 6);
  });

  it('should be able to support negative jumps by -9 bytes', function () {
    // EXAMPLE: [0x00000078] 0x20 0xF7      JR NZ,$F7 ; 0x71 (PC POINTS to next instruction so add 2)
    const result = calculateJumpLocation([0x20, 0xF7], {pc: 0x078});
    assert.deepEqual(result, 0x078 + 2 - 9 );
    assert.deepEqual(result, 0x071);
  });

  it('should be able to support Call instruction to 0x0307', function () {
    const result = calculateJumpLocation([205, 7, 3], {pc: 0x0});
    assert.deepEqual(result, 775);
  });
});
