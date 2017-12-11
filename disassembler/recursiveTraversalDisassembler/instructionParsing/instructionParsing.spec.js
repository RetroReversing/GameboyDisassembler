import {parseRetInstruction, parseControlInstruction, parseLoadInstruction, parseCallInstruction, calculateJumpLocation, parseJumpInstruction, executeLoadInstruction, convert16BitInstructionOperandsToNumber, convert8BitInstructionOperandToNumber} from './instructionParsing';
import * as assert from 'assert';
import { describe, it, beforeEach } from 'mocha';
import { State } from '../RecursiveTraversalDisassembler';

var blankState;
beforeEach(function () {
  blankState = {callStack: [0x100], jumpAssemblyInstructions: {}, 
  additionalPaths: [], jumpAddresses: [], pc: 0x00, allAssemblyInstructions: {}, bank:0, a:0,
 symbols:{}, allowSymbols:false, bankSwitches:[], infoMessages:[]};
  blankState = Object.assign(new State(), blankState);
});

describe('Instruction parsing', function () {
  it('should parse RET instruction and jump back to where it was called from', function () {
    const resultState = parseRetInstruction([0xC0], blankState);
    assert.deepEqual(resultState.pc, 0x100);
    assert.deepEqual(resultState.callStack, []);
  });

  it('should parse Call instruction and jump to that location', function () {
    let initialState = blankState;
    initialState.pc = 0x100;
    initialState.callStack=[];
    const resultState = parseCallInstruction([0xC4, 0x20, 0x00], initialState);
    assert.deepEqual(resultState.pc, 32);
    const callStackSgouldHaveReturnAddressPlusSizeOfInstruction = 259;
    assert.deepEqual(resultState.callStack, [callStackSgouldHaveReturnAddressPlusSizeOfInstruction]);
  });

  it('should parse Relative Jump instruction and jump to that location (0x6F + instruction length (2) + jump of 3)', function () {
    blankState.pc = 0x6F;
    const resultState = parseJumpInstruction([0x18, 0x03], blankState);
    assert.deepEqual(resultState.pc, 0x74);
  });

  it('should not handle JP [HL] Yet', function () {
    blankState.pc = 0x6F;
    const resultState = parseJumpInstruction([0xe9], blankState);
    assert.deepEqual(resultState.pc, 0x6F);
  });
});

describe('Common instruction utility functions', function () {
  it('should be able to convert8BitInstructionOperandToNumber [62, 255] to 0xFF (255)', function () {
    const result = convert8BitInstructionOperandToNumber([62, 255], blankState);
    assert.deepEqual(result, 255);
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

describe('Control instructions', function () {
  it('should parse HALT and display and info message', function () {
    const resultState = parseControlInstruction([0x76], blankState);
    assert.deepEqual(resultState.infoMessages, ['Warning: RGBASM could not handle HALT instruction properly (0x00000000)']);
  });
});

describe('Load/Store/Move instructions', function () {
  it('should parse LD [a16],A instruction and detect a bank switch', function () {
    const stateWithARegisterSetToBank2 = Object.assign({},blankState,{a:0x02});
    const resultState = parseLoadInstruction([0xEA,0x00,0x20], stateWithARegisterSetToBank2);
    assert.deepEqual(resultState.bank, 0x02);
  });

  it('should parse LD [a16],A instruction and not detect a bank switch', function () {
    const stateWithARegisterSetTo9 = Object.assign({},blankState,{a:0x09});
    const resultState = parseLoadInstruction([0xEA,0x00,0x01], stateWithARegisterSetTo9);
    assert.deepEqual(resultState.bank, 0x00);
  });
  
  it('should load A into B (B=A)', function () {
    const stateWithARegisterSetTo9 = Object.assign({},blankState,{a:0x09});
    const resultState = executeLoadInstruction([71], stateWithARegisterSetTo9);
    assert.deepEqual(resultState.b, 0x09);
  });

  it('should load A into [a16] ([a16]=A)', function () {
    const stateWithARegisterSetTo9 = Object.assign({},blankState,{a:0x09});
    const instruction = [ 234, 0, 1 ];
    const resultState = executeLoadInstruction(instruction, stateWithARegisterSetTo9);
    const address16 = convert16BitInstructionOperandsToNumber(instruction);
    assert.deepEqual(resultState.memory[address16], 0x09);
  });

  it('should load d8 into A (A=d8)', function () {
    const stateWithARegisterSetTo9 = Object.assign({},blankState,{a:0x09});
    const instruction = [ 62, 225 ];
    const resultState = executeLoadInstruction(instruction, stateWithARegisterSetTo9);
    assert.deepEqual(resultState.a, 225);
  });
});