import {parseRetInstruction, parseCallInstruction} from './instructionParsing';
import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Instruction parsing', function () {
  it('should parse RET instruction and jump back to where it was called from', function () {
    const resultState = parseRetInstruction([0xC0], {callStack: [0x100], jumpAssemblyInstructions: {}});
    assert.deepEqual(resultState.pc, 0x100);
    assert.deepEqual(resultState.callStack, []);
  });

  it('should parse Call instruction and jump to that location', function () {
    const resultState = parseCallInstruction([0xC4, 0x200, 0x00], {callStack: [], jumpAssemblyInstructions: {}, jumpAddresses: [], pc: 0x100});
    assert.deepEqual(resultState.pc, 512);
    assert.deepEqual(resultState.callStack, [0x100]);
  });
});
