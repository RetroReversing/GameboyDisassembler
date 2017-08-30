import * as assert from 'assert';
import { describe, it } from 'mocha';
import {convertTo8CharacterHexAddress, convertTo8BitSignedValue, convertToHex, is8BitSignedValueNegative, convertHexStringToNumber} from '../Util/ValueConversion';

describe('Utility functions', function () {
  //
  // Test Conversion to Hex
  //
  it('should convert 174 to hex value $AE', function () {
    const hexResult = convertToHex(174);
    assert.equal(hexResult, '$AE');
  });

  it('should convert 1211 to hex value $4BB', function () {
    const hexResult = convertToHex(1211);
    assert.equal(hexResult, '$4BB');
  });

  it('should return error when not provided parameter', function () {
    const hexResult = convertToHex();
    assert.equal(hexResult, 'ErrorInConvertToHex');
  });

  it('should return $0 when provided 0', function () {
    const hexResult = convertToHex(0);
    assert.equal(hexResult, '$0');
  });

  //
  // Test conversion to number
  //
  it('should be able to convert #FFFF to number', function () {
    const result = convertHexStringToNumber('FFFF');
    assert.deepEqual(result, 65535);
  });
});

describe('Converting to Signed Values', function () {
  //
  // Test converting to signed values
  //
  it('should be able to detect if a signed value is negative', function () {
    const result = is8BitSignedValueNegative(129);
    assert.equal(result, true);
  });

  it('should be able to detect if a signed value is positive', function () {
    const result = is8BitSignedValueNegative(12);
    assert.equal(result, false);
  });

  it('should be able to convert to negative 8Bit Signed Value', function () {
    const result = convertTo8BitSignedValue(129);
    assert.equal(result, -1);
  });

  it('should be able to convert to positive 8Bit Signed Value', function () {
    const result = convertTo8BitSignedValue(12);
    assert.equal(result, 12);
  });
});

describe('Formatting functions', function () {
  it('should be able to format 12 to 0000000c', function () {
    const result = convertTo8CharacterHexAddress(12);
    assert.equal(result, '0000000c');
  });

  it('should be able to format 6 to 00000006', function () {
    const result = convertTo8CharacterHexAddress('6');
    assert.equal(result, '00000006');
  });
});
