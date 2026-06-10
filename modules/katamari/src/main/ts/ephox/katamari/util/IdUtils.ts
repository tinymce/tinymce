/* eslint-disable no-bitwise */

const uuidV4Bytes = (): Uint8Array => {
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));

  // https://tools.ietf.org/html/rfc4122#section-4.1.3
  // This will first bit mask away the most significant 4 bits (version octet)
  // then mask in the v4 number we only care about v4 random version at this point so (byte & 0b00001111 | 0b01000000)
  bytes[6] = bytes[6] & 15 | 64;

  // https://tools.ietf.org/html/rfc4122#section-4.1.1
  // This will first bit mask away the highest two bits then masks in the highest bit so (byte & 0b00111111 | 0b10000000)
  // So it will set the Msb0=1 & Msb1=0 described by the "The variant specified in this document." row in the table
  bytes[8] = bytes[8] & 63 | 128;

  return bytes;
};

const uuidV4String = (): `${string}-${string}-${string}-${string}-${string}` => {
  const uuid = uuidV4Bytes();
  const getHexRange = (startIndex: number, endIndex: number) => {
    let buff = '';
    for (let i = startIndex; i <= endIndex; ++i) {
      const hexByte = uuid[i].toString(16).padStart(2, '0');
      buff += hexByte;
    }
    return buff;
  };
  // RFC 4122 UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  return `${getHexRange(0, 3)}-${getHexRange(4, 5)}-${getHexRange(6, 7)}-${getHexRange(8, 9)}-${getHexRange(10, 15)}`;
};

export {
  uuidV4Bytes,
  uuidV4String
};
