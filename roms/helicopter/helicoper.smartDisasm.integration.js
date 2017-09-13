import {DisassembleBytesWithRecursiveTraversalIntoOptimizedArray, DisassembleBytesWithRecursiveTraversalFormatted, DisassembleBytesWithRecursiveTraversalFormattedWithHeader} from '../../disassembler/recursiveTraversalDisassembler/RecursiveTraversalDisassembler';
import * as assert from 'assert';
import {describe, it, before, beforeEach} from 'mocha';
import * as fs from 'fs';
import {expect, use} from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import {getRomTitle, parseGBHeader} from '../../disassembler/romInformation/romInformation'

use(chaiJestSnapshot);
const romData = fs.readFileSync('./roms/helicopter/helicopter.gb');

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

describe('Integration tests for Smarter disassembling of Helicoper.js', function () {
  it('should generate assembly output for helicopter.gb with traversal', function () {
    const resultingAssembly = DisassembleBytesWithRecursiveTraversalFormatted(romData, 0x100);
    expect(resultingAssembly).to.matchSnapshot();
  });

  it('should generate assembly output for helicopter.gb with traversal', function () {
    const resultingAssembly = DisassembleBytesWithRecursiveTraversalFormattedWithHeader(romData, 0x100, false);
    fs.writeFileSync('./roms/helicopter/helicopter.generated.s', resultingAssembly);
    const gbdisOutput = fs.readFileSync('./roms/helicopter/helicoper.gbdis.s');
    assert.deepEqual(resultingAssembly, gbdisOutput.toString());
  });
});

describe('Rom Information', function () {
  it('should be able to get the Title of the rom', function () {
    const gbGameHeader = parseGBHeader(romData);
    const result = getRomTitle(gbGameHeader);
    assert.deepEqual(result, 'EXAMPLE');
  });
});
