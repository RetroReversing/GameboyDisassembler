import {DisassembleRomBytes, DisassembleBytes, findAllJumpInstructions, reduceBytesToDisassembleIntoInstructionGroupData} from '../disassembler/disassemblerMain';
import * as assert from 'assert';
import {describe, it, before, beforeEach} from 'mocha';
import * as fs from 'fs';
import {expect, use} from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import {DisassembleBytesWithRecursiveTraversal} from '../disassembler/recursiveTraversalDisassembler/RecursiveTraversalDisassembler';

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
    const resultingAssembly = DisassembleBytesWithRecursiveTraversal(romData);
    expect(resultingAssembly).to.matchSnapshot();
  });
});

describe('Integration tests for Proper Traversal dissassembler', function () {
    //
    // test disassemble loop
    //
  it('should disassemble the start address', function () {
    var romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const resultingAssembly = DisassembleBytesWithRecursiveTraversal(romData).allAssemblyInstructions;
    assert.deepEqual(resultingAssembly['$100'], ['NOP']);
    assert.deepEqual(resultingAssembly['$101'], ['JP $150']);
    assert.deepEqual(resultingAssembly['$150'], ['NOP']);
    assert.deepEqual(resultingAssembly['$151'], ['DI']);
  });

  it('should return a list of jump instructions in a rom', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const jumpAddresses = findAllJumpInstructions(romData, 0x100);
    assert.deepEqual(jumpAddresses[261], ['JP $150']);
    assert.deepEqual(jumpAddresses[345], ['CALL $4AF']);
  });

  it('should return a list of jump instructions in a rom snapshot helicopter.gb', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const jumpInstructions = findAllJumpInstructions(romData, 0x100);
    expect(jumpInstructions).to.matchSnapshot();
  });

  it('should reduceBytesToDisassembleIntoInstructionGroupData helicopter.gb', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const result = reduceBytesToDisassembleIntoInstructionGroupData(romData);
    expect(result).to.matchSnapshot();
  });

  it('should return a list of all assembly instructions currently disassembled', function () {
    const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const result = DisassembleBytesWithRecursiveTraversal(romData, 0x100).allAssemblyInstructions;
    assert.deepEqual(result['$100'], ['NOP']);
  });
});
