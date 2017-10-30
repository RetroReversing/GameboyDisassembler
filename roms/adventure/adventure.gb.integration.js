import {DisassembleBytesWithRecursiveTraversalIntoOptimizedArray, DisassembleBytesWithRecursiveTraversalFormatted, DisassembleBytesWithRecursiveTraversalFormattedWithHeader} from '../../disassembler/recursiveTraversalDisassembler/RecursiveTraversalDisassembler';
import * as assert from 'assert';
import {describe, it, before, beforeEach} from 'mocha';
import * as fs from 'fs';
import {expect, use} from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import {getRomTitle, parseGBHeader} from '../../disassembler/romInformation/romInformation'

use(chaiJestSnapshot);
const gameName = 'adventure';
const romPath = `./roms/${gameName}/`;
const romData = fs.readFileSync(`${romPath}/${gameName}.gb`);
const romName = `${gameName}.gb`;

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

describe(`Integration tests for Recursive disassembling of ${romName}.js`, function () {

  it(`should generate assembly output for ${romName} with traversal`, function () {
    const resultingAssembly = DisassembleBytesWithRecursiveTraversalFormattedWithHeader(romData, 0x100, true);
    fs.writeFileSync(`${romPath}/${romName}.generated.s`, resultingAssembly);
    const gbdisOutput = fs.readFileSync(`${romPath}/${romName}.gbdis.s`);
    assert.deepEqual(resultingAssembly, gbdisOutput.toString());
  }); 
});

describe('Rom Information', function () {
  it('should be able to get the Title of the rom', function () {
    const gbGameHeader = parseGBHeader(romData);
    const result = getRomTitle(gbGameHeader);
    assert.deepEqual(result, 'Gameboy Program');
  });
});

