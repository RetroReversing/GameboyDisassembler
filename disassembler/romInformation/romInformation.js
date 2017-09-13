import {convertTo2CharacterHexAddress} from '../Util/ValueConversion';
const Parser = require("binary-parser").Parser;

const GBFileHeader = Parser.start()
                        .endianess('little')
                        .array('hgw', {type: 'uint8',length:0x100})
                        .uint32('entryPoint')
                        .array('logo', {type: 'uint8',length:0x30})
                        .string('title',{type: 'uint8',length:0xB})
                        .string('manufacturer',{length:0x4})
                        .uint8('colourGameBoy')
                        .string('newLicenseeCode',{length:2})
                        .uint8('superGameBoy')
                        .uint8('cartridgeType')
                        .uint8('romSize')
                        .uint8('ramSize')
                        .uint8('destinationCode')
                        .uint8('oldLicenseeCode')
                        .uint8('maskRomVersionNumber')
                        .uint8('headerChecksum')
                        .uint16('globalChecksum')

export function parseGBHeader(romData) {
    const gameHeader = GBFileHeader.parse(romData);
    return gameHeader;
}

export function getRomTitle(gameHeader) {
    const title =  gameHeader.title.replace(/\0/g,'');
    return title.trim();
}

export function getSGBFlag(gameHeader) {
    const flag =  gameHeader.superGameBoy;
    if (flag === 0)
        return 'SuperGameBoy not supported';
    return '0x'+convertTo2CharacterHexAddress(flag);
}

export function printRomHeaderInformation(bytesToDisassemble) {
    const gbGameHeader = parseGBHeader(bytesToDisassemble);
    const romTitle = getRomTitle(gbGameHeader);
      return `Title: ${romTitle}
CGB flag: Not used, old cartridge
SGB flag: ${getSGBFlag(gbGameHeader)}
Type: ROM ONLY
ROM: 32KByte
RAM: None
Destination: non-Japanese
Version: 0x00
Header checksum: OK
`
}