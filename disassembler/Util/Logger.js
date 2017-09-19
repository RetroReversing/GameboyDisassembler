import {convertTo8CharacterHexAddress} from './ValueConversion';
import * as winston from 'winston';
winston.configure({
  transports: [
    new (winston.transports.Console)(),
    new (winston.transports.File)({ filename: './disassembler.log', json: false, timestamp: false })
  ]
});

export function logAction (message, state) {
  if (!state.allowLogging) return;
  const currentoffset = state.symbols[state.pc] || convertTo8CharacterHexAddress(state.pc);
  winston.info(message, 'PC:', currentoffset);
}

export function logError (message, state) {
  winston.error('ERROR:', message);
}
