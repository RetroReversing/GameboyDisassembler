Title: TEST
CGB flag: Not used, old cartridge
SGB flag: SuperGameBoy not supported
Type: ROM ONLY
ROM: 32KByte
RAM: None
Destination: non-Japanese
Version: 0x00
Header checksum: OK
[0x00000100] 0x00           NOP
[0x00000101] 0xC3 0x50 0x01 JP $0150
[0x00000150] 0x76           HALT
[0x00000151] 0x00           NOP
[0x00000152] 0x18 0xFC      JR $FC ; 0x150
