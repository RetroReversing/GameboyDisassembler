import * as assert from 'assert';
import { describe, it } from 'mocha';

describe('Goals for the project:', function () {
  it('should be able to open zip files as roms', function () {
    assert.fail('not implemented');
  });
  it('should be able to return the number of instructions it found in a rom', function () {
    assert.fail('not implemented');
  });
  it('should be able to run through a folder of roms and return an array of instruction numbers per rom', function () {
    assert.fail('not implemented');
  });
  it('should be able to create a Code/Data Logger file .cdl', function () {
    assert.fail('not implemented');
  });
  it('should be able to disassembler into a js like format', function () {
    assert.fail('not implemented');
  });

  it('should be able to return rom information in the same form as gbdis', function () {
    const expected = `Title: EXAMPLE
CGB flag: Not used, old cartridge
SGB flag: SuperGameBoy not supported
Type: ROM ONLY
ROM: 32KByte
RAM: None
Destination: non-Japanese
Version: 0x00
Header checksum: OK
Warning: RGBASM could not handle HALT instruction properly (0x000001BB)`;
    assert.fail('not implemented', expected);
  });
});
