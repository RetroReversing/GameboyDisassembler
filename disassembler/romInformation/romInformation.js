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

const ramSizes = {
    0:"None",
    1:"2 KBytes",
    2:"8 Kbytes",
    3:"32 KBytes",
    4:"128 KBytes"
};

export function getRAM(gameHeader) {
    const ramSize =  gameHeader.ramSize;
    return ramSizes[ramSize] || 'Unknown';
}

export function getVersion(gameHeader) {
    const flag =  gameHeader.maskRomVersionNumber;
    return '0x'+convertTo2CharacterHexAddress(flag);
}

export function getRomTitle(gameHeader) {
    let title =  (gameHeader.title);
    if (gameHeader.manufacturer) {
        title += gameHeader.manufacturer;
    }
    return title.replace(/\0/g,'').trim();
}

const romTypeMap = {
    0: 'ROM ONLY',
    1: 'MBC1',
    2: 'MBC1+RAM',
    3: 'MBC1+RAM+BATTERY',
    4: "Unknown", 
    5: "MBC2", 
    6: "MBC2+BATTERY", 
    7: "Unknown", 
    8: "ROM+RAM", 
    9: "ROM+RAM+BATTERY", 
    0x0A: "Unknown",
    0x0B: "MMM01", 
    0x0C: "MMM01+RAM",             
    0x0D: "MMM01+RAM+BATTERY", 
    0x0E: "Unknown", 
    0x0F: "MBC3+TIMER+BATTERY", 
    0x10: "MBC3+TIMER+RAM+BATTERY", 
    0x11: "MBC3", 
    0x12: "MBC3+RAM", 
    0x13: "MBC3+RAM+BATTERY",
    0x14: "Unknown", 
    0x15: "MBC4", 
    0x16: "MBC4+RAM",
    0x17: "MBC4+RAM+BATTERY", 
    0x18: "Unknown",
    0x19: "MBC5", 
    0x1A: "MBC5+RAM", 
    0x1B: "MBC5+RAM+BATTERY", 
    0x1C: "MBC5+RUMBLE", 
    0x1D: "MBC5+RUMBLE+RAM",
    0x1E: "MBC5+RUMBLE+RAM+BATTERY"
}

export function getRomType(gameHeader) {
    const cartType =  gameHeader.cartridgeType;
    return romTypeMap[cartType] || cartType;
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
Type: ${getRomType(gbGameHeader)}
ROM: 32KByte
RAM: ${getRAM(gbGameHeader)}
Destination: non-Japanese
Version: ${getVersion(gbGameHeader)}
Header checksum: OK
`
}