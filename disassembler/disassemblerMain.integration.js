import {DisassembleBytes} from './disassemblerMain';
import * as assert from 'assert';
import { describe, it } from 'mocha';

const instructionTests = [];

instructionTests.push({name: 'start Code', instructions: [0, 195, 80, 1], assembly: [ 'NOP', 'JP $150' ]});
instructionTests.push({
  name: 'Unknown Code',
  instructions: [123, 134, 39, 34, 122, 142, 39, 34, 62, 0, 142, 39, 119, 62, 1, 224, 224],
  assembly: [ 'LD A,E',
    'ADD A,[HL]',
    'DAA',
    'LD [HLI],A',
    'LD A,D',
    'ADC A,[HL]',
    'DAA',
    'LD [HLI],A',
    'LD A, $0',
    'ADC A,[HL]',
    'DAA',
    'LD [HL],A',
    'LD A, $1',
    'LDH [ $E0']
});

describe('Integration tests for Disassembling Roms', function () {
  instructionTests.forEach(function (testDefinition) {
    it('should generate assembly output for ' + testDefinition.name, function () {
      const resultingAssembly = DisassembleBytes(testDefinition.instructions);
      assert.deepEqual(resultingAssembly, testDefinition.assembly);
    });
  });

  it('should generate assembly output for blocks of known instructions', function (done) {
    const startCodeInstructions = [0, 195, 80, 1];
    const startCodeAssembly = [ 'NOP', 'JP $150' ];
    const resultingAssembly = DisassembleBytes(startCodeInstructions);
    assert.deepEqual(resultingAssembly, startCodeAssembly);
    done();
  });
});
