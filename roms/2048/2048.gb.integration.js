import {handleSymFile, DisassembleBytesWithRecursiveTraversalIntoOptimizedArray, DisassembleBytesWithRecursiveTraversalFormatted, DisassembleBytesWithRecursiveTraversalFormattedWithHeader} from '../../disassembler/recursiveTraversalDisassembler/RecursiveTraversalDisassembler';
import * as assert from 'assert';
import {describe, it, before, beforeEach} from 'mocha';
import * as fs from 'fs';
import {expect, use} from 'chai';
import chaiJestSnapshot from 'chai-jest-snapshot';
import {getRomTitle, parseGBHeader} from '../../disassembler/romInformation/romInformation'
import {parseSymFiles} from '../../disassembler/Util/ParseSymFile';

use(chaiJestSnapshot);
const romPath = './roms/2048/';
const romName = '2048.gb';
const romData = fs.readFileSync(`${romPath}/${romName}`);

before(function () {
  chaiJestSnapshot.resetSnapshotRegistry();
});

beforeEach(function () {
  chaiJestSnapshot.configureUsingMochaContext(this);
});

describe(`Integration tests for Recursive disassembling of ${romName}.js`, function () {

  it(`should generate assembly output for ${romName} with traversal`, function () {
    return handleSymFile(romPath+romName+'.sym').then((symbols) => {
      const resultingAssembly = DisassembleBytesWithRecursiveTraversalFormattedWithHeader(romData, 0x100, true,symbols);
      fs.writeFileSync(`${romPath}/${romName}.generated.s`, resultingAssembly);
      const gbdisOutput = fs.readFileSync(`${romPath}/${romName}.gbdis.s`);
      assert.deepEqual(resultingAssembly, gbdisOutput.toString());
    })
  });
});

describe('Rom Information', function () {
  it('should be able to get the Title of the rom', function () {
    const gbGameHeader = parseGBHeader(romData);
    const result = getRomTitle(gbGameHeader);
    assert.deepEqual(result, '2048-gb    XXXX');
  });
});

