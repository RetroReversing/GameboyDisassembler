import {isCallInstruction} from './disassemblerInstructions';
import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Disassembler Main', function () {
  it('should return true for all valid CALL instructions', function () {
    const validJumpInstructions = [ 196, 204, 205, 212, 220 ];
    validJumpInstructions.forEach(jmp => {
      const result = isCallInstruction([jmp]);
      assert.deepEqual(result, {});
    });
  });
});
