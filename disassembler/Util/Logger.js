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
  winston.info(message, 'PC:', convertTo8CharacterHexAddress(state.pc));
}

export function logError (message, state) {
  winston.error('ERROR:', message);
}
