import * as assert from 'assert';
import { describe, it } from 'mocha';
import {formatIntoGBDisBinaryFormat, getFullAddress} from '../assemblyFormatters/gb-disasmFormatter';

describe('gb-disasm Formatting output tests :: ', function () {
  it('formatIntoGBDisBinaryFormat should format into gbdis standard format', function () {
    const testInstructions = { '$0': [ 'INC B' ],
      '$1': [ 'INC C' ],
      '$2': [ 'JR Z, $1' ],
      '$5': [ 'NOP' ],
      '$4': [ 'LD [HLI],A' ] };
    const groupsOfInstructions = { instructions:
    { '0': [ 4 ],
      '1': [ 12 ],
      '2': [ 40, 1 ],
      '4': [ 34 ],
      '5': [ 0 ] },
      skipBytes: 0,
      keys: [ 0, 1, 2, 4, 5 ],
      lastAddedInstruction: 5 };
    const resultingState = formatIntoGBDisBinaryFormat(testInstructions, groupsOfInstructions);
    const outputAsString = resultingState.join('\n');
    assert.deepEqual(outputAsString,
`[0x00000000] 0x04            INC B
[0x00000001] 0x0C            INC C
[0x00000002] 0x28 0x01       JR Z, $1
[0x00000005] 0x00            NOP
[0x00000004] 0x22            LD [HLI],A`);
  });
});

describe('gb-disasm Formatting utility function tests :: ', function () {
  it('formatIntoGBDisBinaryFormat should format addresses into format [0x00000000]', function () {
    const result = getFullAddress('$01');
    assert.equal(result, '[0x00000001]');
    const largerResult = getFullAddress('$FFFF');
    assert.equal(largerResult, '[0x0000FFFF]');
  });
});
