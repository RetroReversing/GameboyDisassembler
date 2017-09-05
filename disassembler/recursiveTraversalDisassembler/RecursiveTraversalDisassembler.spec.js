import {hasAlreadyVisited, reduceInstructionCount, DisassembleBytesWithRecursiveTraversal, DisassembleBytesWithRecursiveTraversalFormatted} from './RecursiveTraversalDisassembler';
import {isJumpInstruction, isCallInstruction, isRetInstruction} from '../disassemblerInstructions';
import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('RecursiveTraversalDisassembler Instruction Parsing', function () {
  it('should be able to add a visited located to the map', function () {
    const result = hasAlreadyVisited({pc: 0x100});
    assert.deepEqual(result, false);
  });

  it('should return true for all valid jump instructions', function () {
    const validJumpInstructions = [0x18, 0xC3, 0x20, 0x28, 0x30, 0x38, 0xC2, 0xC3, 0xCA, 0xD2, 0xDA, 0xE9];
    validJumpInstructions.forEach(jmp => {
      const result = isJumpInstruction([jmp]);
      assert.deepEqual(result, true);
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
      assert.deepEqual(result, true);
    });
  });
});

describe('RecursiveTraversalDisassembler Reduce instructions into new functions', function () {
  it('should reduce the number of NOP instructions by making it an array with the number', function () {
    const sixNopInstructions = [ ['NOP'], ['NOP'], ['NOP'], ['NOP'], ['NOP'], ['NOP'] ];
    const resultingCode = reduceInstructionCount(sixNopInstructions);
    assert.deepEqual(resultingCode, [ ['NOP', 6] ]);
  });

  it('should reduce the number of multiple instructions by making it an array with the number', function () {
    const sixInstructions = [ ['NOP'], ['NOP'], ['DI'], ['DI'], ['NOP'], ['NOP'] ];
    const resultingCode = reduceInstructionCount(sixInstructions);
    assert.deepEqual(resultingCode, [ ['NOP', 2], ['DI', 2], ['NOP', 2] ]);
  });
});

describe('RecursiveTraversalDisassembler Jump tests :: ', function () {
  it('should jump past one instruction', function () {
    const testInstructions = [0x04, 0x0C, 0x28, 0x01, 0x22, 0x0D];
    const resultingState = DisassembleBytesWithRecursiveTraversal(testInstructions, 0x00);
    assert.deepEqual(resultingState.allAssemblyInstructions,
      { '00000000': 'INC B',
        '00000001': 'INC C',
        '00000002': 'JR Z,$01 ; 0x5',
        '00000004': 'LD [HLI],A',
        '00000005': 'DEC C'
      });
  });

  it('should not parse bytes after unconditional Jump', function () {
    const resultState = DisassembleBytesWithRecursiveTraversal([0x18, 0x01, 0x05, 0x00], 0x00);
    assert.deepEqual(resultState.allAssemblyInstructions, { '00000000': 'JR $01 ; 0x3', '00000003': 'NOP' });
  });
});

describe('RecursiveTraversalDisassembler Formatting output tests', function () {
  it('should format into gbdis standard format', function () {
    const testInstructions = [0x04, 0x0C, 0x28, 0x01, 0x22, 0x0D];
    const resultingState = DisassembleBytesWithRecursiveTraversalFormatted(testInstructions, 0x00);
    const outputAsString = resultingState.join('\n');
    assert.deepEqual(outputAsString,
`[0x00000000] 0x04           INC B
[0x00000001] 0x0C           INC C
[0x00000002] 0x28 0x01      JR Z,$01 ; 0x5
[0x00000004] 0x22           LD [HLI],A
[0x00000005] 0x0D           DEC C`);
  });
});
