import {DisassembleBytesWithRecursiveTraversalIntoOptimizedArray, DisassembleBytesWithRecursiveTraversalFormatted} from '../../disassembler/recursiveTraversalDisassembler/RecursiveTraversalDisassembler';
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

describe('Integration tests for Smarter disassembling of Helicoper.js', function () {
  it('should generate assembly output for helicopter.gb with traversal', function () {
    var romData = fs.readFileSync('./roms/helicopter/helicopter.gb');
    const resultingAssembly = DisassembleBytesWithRecursiveTraversalFormatted(romData, 0x100);
    expect(resultingAssembly).to.matchSnapshot();
  });
});
