import {DisassembleRomBytes, DisassembleBytes, findAllJumpInstructions, reduceBytesToDisassembleIntoInstructionGroupData} from '../disassembler/disassemblerMain';
import * as assert from 'assert';
import {describe, it, before, beforeEach} from 'mocha';
import * as fs from 'fs';
import {expect, use} from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';

use(chaiJestSnapshot);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

describe('Integration tests for Disassembling Game.gb', function () {
  it('should generate assembly output for game.gb', function () {
    var romData = fs.readFileSync('./roms/game/game.gb');
    const resultingAssembly = DisassembleBytes(romData);
    expect(resultingAssembly).to.matchSnapshot();
  });

  it('should generate assembly output for helicopter.gb', function () {
    var romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const resultingAssembly = DisassembleBytes(romData);
    expect(resultingAssembly).to.matchSnapshot();
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

  it('should return a list of jump instructions in a rom snapshot', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const jumpInstructions = findAllJumpInstructions(romData, 0x100);
    expect(jumpInstructions).to.matchSnapshot();
  });

  it('should return a list of jump instructions in a rom', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const jumpInstructions = findAllJumpInstructions(romData, 0x100);
    assert.deepEqual(jumpInstructions[0], 0x100);
    assert.deepEqual(jumpInstructions, [0x100, 0x150]);
  });

  it('should reduceBytesToDisassembleIntoInstructionGroupData', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const result = reduceBytesToDisassembleIntoInstructionGroupData(romData);
    expect(result).to.matchSnapshot();
  });
});
