export function isJumpInstruction (instruction) {
  return jumpInstructions[instruction[0]];
}

export function isCallInstruction (instruction) {
  return callInstructions[instruction[0]];
}

export function isRetInstruction (instruction) {
  return retInstructions[instruction[0]];
}

export const oneByteInstructions = {0: 'NOP', 2: 'LD [BC],A', 3: 'INC BC', 4: 'INC B', 5: 'DEC B', 7: 'RLCA', 9: 'ADD HL,BC', 10: 'LD A,[BC]', 11: 'DEC BC', 12: 'INC C', 13: 'DEC C', 15: 'RRCA', 18: 'LD [DE],A', 19: 'INC DE', 20: 'INC D', 21: 'DEC D', 23: 'RLA', 25: 'ADD HL,DE', 26: 'LD A,[DE]', 27: 'DEC DE', 28: 'INC E', 29: 'DEC E', 31: 'RRA', 34: 'LD [HLI],A', 35: 'INC HL', 36: 'INC H', 37: 'DEC H', 39: 'DAA', 41: 'ADD HL,HL', 42: 'LD A,[HLI]', 43: 'DEC HL', 44: 'INC L', 45: 'DEC L', 47: 'CPL', 50: 'LD [HLD],A', 51: 'INC SP', 52: 'INC [HL]', 53: 'DEC [HL]', 55: 'SCF', 57: 'ADD HL,SP', 58: 'LD A,[HLD]', 59: 'DEC SP', 60: 'INC A', 61: 'DEC A', 63: 'CCF', 64: 'LD B,B', 65: 'LD B,C', 66: 'LD B,D', 67: 'LD B,E', 68: 'LD B,H', 69: 'LD B,L', 70: 'LD B,[HL]', 71: 'LD B,A', 72: 'LD C,B', 73: 'LD C,C', 74: 'LD C,D', 75: 'LD C,E', 76: 'LD C,H', 77: 'LD C,L', 78: 'LD C,[HL]', 79: 'LD C,A', 80: 'LD D,B', 81: 'LD D,C', 82: 'LD D,D', 83: 'LD D,E', 84: 'LD D,H', 85: 'LD D,L', 86: 'LD D,[HL]', 87: 'LD D,A', 88: 'LD E,B', 89: 'LD E,C', 90: 'LD E,D', 91: 'LD E,E', 92: 'LD E,H', 93: 'LD E,L', 94: 'LD E,[HL]', 95: 'LD E,A', 96: 'LD H,B', 97: 'LD H,C', 98: 'LD H,D', 99: 'LD H,E', 100: 'LD H,H', 101: 'LD H,L', 102: 'LD H,[HL]', 103: 'LD H,A', 104: 'LD L,B', 105: 'LD L,C', 106: 'LD L,D', 107: 'LD L,E', 108: 'LD L,H', 109: 'LD L,L', 110: 'LD L,[HL]', 111: 'LD L,A', 112: 'LD [HL],B', 113: 'LD [HL],C', 114: 'LD [HL],D', 115: 'LD [HL],E', 116: 'LD [HL],H', 117: 'LD [HL],L', 118: 'HALT', 119: 'LD [HL],A', 120: 'LD A,B', 121: 'LD A,C', 122: 'LD A,D', 123: 'LD A,E', 124: 'LD A,H', 125: 'LD A,L', 126: 'LD A,[HL]', 127: 'LD A,A', 128: 'ADD A,B', 129: 'ADD A,C', 130: 'ADD A,D', 131: 'ADD A,E', 132: 'ADD A,H', 133: 'ADD A,L', 134: 'ADD A,[HL]', 135: 'ADD A,A', 136: 'ADC A,B', 137: 'ADC A,C', 138: 'ADC A,D', 139: 'ADC A,E', 140: 'ADC A,H', 141: 'ADC A,L', 142: 'ADC A,[HL]', 143: 'ADC A,A', 144: 'SUB B', 145: 'SUB C', 146: 'SUB D', 147: 'SUB E', 148: 'SUB H', 149: 'SUB L', 150: 'SUB [HL]', 151: 'SUB A', 152: 'SBC A,B', 153: 'SBC A,C', 154: 'SBC A,D', 155: 'SBC A,E', 156: 'SBC A,H', 157: 'SBC A,L', 158: 'SBC A,[HL]', 159: 'SBC A,A', 160: 'AND B', 161: 'AND C', 162: 'AND D', 163: 'AND E', 164: 'AND H', 165: 'AND L', 166: 'AND [HL]', 167: 'AND A', 168: 'XOR B', 169: 'XOR C', 170: 'XOR D', 171: 'XOR E', 172: 'XOR H', 173: 'XOR L', 174: 'XOR [HL]', 175: 'XOR A', 176: 'OR B', 177: 'OR C', 178: 'OR D', 179: 'OR E', 180: 'OR H', 181: 'OR L', 182: 'OR [HL]', 183: 'OR A', 184: 'CP B', 185: 'CP C', 186: 'CP D', 187: 'CP E', 188: 'CP H', 189: 'CP L', 190: 'CP [HL]', 191: 'CP A', 192: 'RET NZ', 193: 'POP BC', 197: 'PUSH BC', 199: 'RST $00', 200: 'RET Z', 201: 'RET', 207: 'RST $08', 208: 'RET NC', 209: 'POP DE', 213: 'PUSH DE', 215: 'RST $10', 216: 'RET C', 217: 'RETI', 223: 'RST $18', 225: 'POP HL', 226: 'LD [C],A', 229: 'PUSH HL', 231: 'RST $20', 233: 'JP [HL]', 239: 'RST $28', 241: 'POP AF', 242: 'LD A,[C]', 243: 'DI', 245: 'PUSH AF', 247: 'RST $30', 249: 'LD SP,HL', 251: 'EI', 255: 'RST $38'};
export const twoByteInstructions = {6: 'LD B,', 14: 'LD C,', 16: 'RRCA', 22: 'LD D,', 24: 'JR', 30: 'LD E,', 32: 'JR NZ,', 38: 'LD H,', 40: 'JR Z,', 46: 'LD L,', 48: 'JR NC,', 54: 'LD [HL],', 56: 'JR C,', 62: 'LD A,', 198: 'ADD A,', 206: 'ADC A,', 214: 'SUB', 222: 'SBC A,', 224: 'LDH [', 230: 'AND', 232: 'ADD SP,', 238: 'XOR', 240: 'LDH A,[', 246: 'OR', 248: 'LD HL,SP+', 254: 'CP'};
export const threeByteInstructions = {1: 'LD BC,', 194: 'JP NZ,', 195: 'JP', 17: 'LD DE,', 33: 'LD HL,', 8: 'LD [', 202: 'JP Z,', 204: 'CALL Z,', 205: 'CALL', 49: 'LD SP,', 210: 'JP NC,', 212: 'CALL NC,', 196: 'CALL NZ,', 218: 'JP C,', 220: 'CALL C,', 234: 'LD [', 250: 'LD A,['};
export const cbPrefixedOps = {0: 'RLC B', 1: 'RLC C', 2: 'RLC D', 3: 'RLC E', 4: 'RLC H', 5: 'RLC L', 6: 'RLC [HL]', 7: 'RLC A', 8: 'RRC B', 9: 'RRC C', 10: 'RRC D', 11: 'RRC E', 12: 'RRC H', 13: 'RRC L', 14: 'RRC [HL]', 15: 'RRC A', 16: 'RL B', 17: 'RL C', 18: 'RL D', 19: 'RL E', 20: 'RL H', 21: 'RL L', 22: 'RL [HL]', 23: 'RL A', 24: 'RR B', 25: 'RR C', 26: 'RR D', 27: 'RR E', 28: 'RR H', 29: 'RR L', 30: 'RR [HL]', 31: 'RR A', 32: 'SLA B', 33: 'SLA C', 34: 'SLA D', 35: 'SLA E', 36: 'SLA H', 37: 'SLA L', 38: 'SLA [HL]', 39: 'SLA A', 40: 'SRA B', 41: 'SRA C', 42: 'SRA D', 43: 'SRA E', 44: 'SRA H', 45: 'SRA L', 46: 'SRA [HL]', 47: 'SRA A', 48: 'SWAP B', 49: 'SWAP C', 50: 'SWAP D', 51: 'SWAP E', 52: 'SWAP H', 53: 'SWAP L', 54: 'SWAP [HL]', 55: 'SWAP A', 56: 'SRL B', 57: 'SRL C', 58: 'SRL D', 59: 'SRL E', 60: 'SRL H', 61: 'SRL L', 62: 'SRL [HL]', 63: 'SRL A', 64: 'BIT 0,B', 65: 'BIT 0,C', 66: 'BIT 0,D', 67: 'BIT 0,E', 68: 'BIT 0,H', 69: 'BIT 0,L', 70: 'BIT 0,[HL]', 71: 'BIT 0,A', 72: 'BIT 1,B', 73: 'BIT 1,C', 74: 'BIT 1,D', 75: 'BIT 1,E', 76: 'BIT 1,H', 77: 'BIT 1,L', 78: 'BIT 1,[HL]', 79: 'BIT 1,A', 80: 'BIT 2,B', 81: 'BIT 2,C', 82: 'BIT 2,D', 83: 'BIT 2,E', 84: 'BIT 2,H', 85: 'BIT 2,L', 86: 'BIT 2,[HL]', 87: 'BIT 2,A', 88: 'BIT 3,B', 89: 'BIT 3,C', 90: 'BIT 3,D', 91: 'BIT 3,E', 92: 'BIT 3,H', 93: 'BIT 3,L', 94: 'BIT 3,[HL]', 95: 'BIT 3,A', 96: 'BIT 4,B', 97: 'BIT 4,C', 98: 'BIT 4,D', 99: 'BIT 4,E', 100: 'BIT 4,H', 101: 'BIT 4,L', 102: 'BIT 4,[HL]', 103: 'BIT 4,A', 104: 'BIT 5,B', 105: 'BIT 5,C', 106: 'BIT 5,D', 107: 'BIT 5,E', 108: 'BIT 5,H', 109: 'BIT 5,L', 110: 'BIT 5,[HL]', 111: 'BIT 5,A', 112: 'BIT 6,B', 113: 'BIT 6,C', 114: 'BIT 6,D', 115: 'BIT 6,E', 116: 'BIT 6,H', 117: 'BIT 6,L', 118: 'BIT 6,[HL]', 119: 'BIT 6,A', 120: 'BIT 7,B', 121: 'BIT 7,C', 122: 'BIT 7,D', 123: 'BIT 7,E', 124: 'BIT 7,H', 125: 'BIT 7,L', 126: 'BIT 7,[HL]', 127: 'BIT 7,A', 128: 'RES 0,B', 129: 'RES 0,C', 130: 'RES 0,D', 131: 'RES 0,E', 132: 'RES 0,H', 133: 'RES 0,L', 134: 'RES 0,[HL]', 135: 'RES 0,A', 136: 'RES 1,B', 137: 'RES 1,C', 138: 'RES 1,D', 139: 'RES 1,E', 140: 'RES 1,H', 141: 'RES 1,L', 142: 'RES 1,[HL]', 143: 'RES 1,A', 144: 'RES 2,B', 145: 'RES 2,C', 146: 'RES 2,D', 147: 'RES 2,E', 148: 'RES 2,H', 149: 'RES 2,L', 150: 'RES 2,[HL]', 151: 'RES 2,A', 152: 'RES 3,B', 153: 'RES 3,C', 154: 'RES 3,D', 155: 'RES 3,E', 156: 'RES 3,H', 157: 'RES 3,L', 158: 'RES 3,[HL]', 159: 'RES 3,A', 160: 'RES 4,B', 161: 'RES 4,C', 162: 'RES 4,D', 163: 'RES 4,E', 164: 'RES 4,H', 165: 'RES 4,L', 166: 'RES 4,[HL]', 167: 'RES 4,A', 168: 'RES 5,B', 169: 'RES 5,C', 170: 'RES 5,D', 171: 'RES 5,E', 172: 'RES 5,H', 173: 'RES 5,L', 174: 'RES 5,[HL]', 175: 'RES 5,A', 176: 'RES 6,B', 177: 'RES 6,C', 178: 'RES 6,D', 179: 'RES 6,E', 180: 'RES 6,H', 181: 'RES 6,L', 182: 'RES 6,[HL]', 183: 'RES 6,A', 184: 'RES 7,B', 185: 'RES 7,C', 186: 'RES 7,D', 187: 'RES 7,E', 188: 'RES 7,H', 189: 'RES 7,L', 190: 'RES 7,[HL]', 191: 'RES 7,A', 192: 'SET 0,B', 193: 'SET 0,C', 194: 'SET 0,D', 195: 'SET 0,E', 196: 'SET 0,H', 197: 'SET 0,L', 198: 'SET 0,[HL]', 199: 'SET 0,A', 200: 'SET 1,B', 201: 'SET 1,C', 202: 'SET 1,D', 203: 'SET 1,E', 204: 'SET 1,H', 205: 'SET 1,L', 206: 'SET 1,[HL]', 207: 'SET 1,A', 208: 'SET 2,B', 209: 'SET 2,C', 210: 'SET 2,D', 211: 'SET 2,E', 212: 'SET 2,H', 213: 'SET 2,L', 214: 'SET 2,[HL]', 215: 'SET 2,A', 216: 'SET 3,B', 217: 'SET 3,C', 218: 'SET 3,D', 219: 'SET 3,E', 220: 'SET 3,H', 221: 'SET 3,L', 222: 'SET 3,[HL]', 223: 'SET 3,A', 224: 'SET 4,B', 225: 'SET 4,C', 226: 'SET 4,D', 227: 'SET 4,E', 228: 'SET 4,H', 229: 'SET 4,L', 230: 'SET 4,[HL]', 231: 'SET 4,A', 232: 'SET 5,B', 233: 'SET 5,C', 234: 'SET 5,D', 235: 'SET 5,E', 236: 'SET 5,H', 237: 'SET 5,L', 238: 'SET 5,[HL]', 239: 'SET 5,A', 240: 'SET 6,B', 241: 'SET 6,C', 242: 'SET 6,D', 243: 'SET 6,E', 244: 'SET 6,H', 245: 'SET 6,L', 246: 'SET 6,[HL]', 247: 'SET 6,A', 248: 'SET 7,B', 249: 'SET 7,C', 250: 'SET 7,D', 251: 'SET 7,E', 252: 'SET 7,H', 253: 'SET 7,L', 254: 'SET 7,[HL]', 255: 'SET 7,A'};

export const jumpInstructions = {
  0x18: {},
  0xC3: {},
  0x20: {},
  0xC2: {},
  0x38: {},
  0x28: {},
  0x30: {},
  0xCA: {},
  0xD2: {},
  0xDA: {},
  0xE9: {}
};

export const callInstructions = {
  0xC4: {},
  0xCC: {},
  0xCD: {},
  0xD4: {},
  0xDC: {}
};

export const retInstructions = {
  0xC0: {},
  0xC8: {},
  0xC9: {},
  0xD0: {},
  0xD8: {},
  0xD9: {}
};
