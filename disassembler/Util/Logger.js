import {convertTo8CharacterHexAddress} from './ValueConversion';
export function logAction (message, state) {
  if (!state.allowLogging) return;
  console.log(message, 'PC:', convertTo8CharacterHexAddress(state.pc));
}

export function logError (message, state) {
  console.error('ERROR:', message);
}
