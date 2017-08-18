import {DisassembleRomBytes, DisassembleBytes, findAllJumpInstructions} from '../disassembler/disassemblerMain';
import * as assert from 'assert';
import snapshot from 'snap-shot';
import { describe, it } from 'mocha';
import * as fs from 'fs';

describe('Integration tests for Disassembling Game.gb', function () {
  it('should generate assembly output for game.gb', function () {
    var romData = fs.readFileSync('./roms/game/game.gb');
    const resultingAssembly = DisassembleBytes(romData);
    snapshot(resultingAssembly);
  });

  it('should generate assembly output for helicopter.gb', function () {
    var romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const resultingAssembly = DisassembleBytes(romData);
    snapshot(resultingAssembly);
  });
});

describe('Integration tests for Proper Traversal dissassembler', function () {
    //
    // test disassemble loop
    //
  it('should disassemble the start address', function () {
    var romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const resultingAssembly = DisassembleRomBytes(romData);
    assert.deepEqual(resultingAssembly[0], 'NOP');
  });

  it('should return a list of jump instructions in a rom', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const jumpInstructions = findAllJumpInstructions(romData, 0x100);
    assert.deepEqual(jumpInstructions[0], 0x100);
    assert.deepEqual(jumpInstructions, [0x100, 0x150]);
  });
});
