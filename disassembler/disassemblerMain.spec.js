import {isJumpInstruction, isCallInstruction, isRetInstruction} from './disassemblerInstructions';
import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Disassembler Main', function () {
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
});
