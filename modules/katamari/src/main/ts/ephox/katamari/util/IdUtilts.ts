/* eslint-disable no-bitwise */

const uuidV4Bytes = (): Uint8Array<ArrayBuffer> => {
  const bytes = window.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = bytes[6] & 15 | 64;
  bytes[8] = bytes[8] & 63 | 128;
  return bytes;
};

const uuidV4String = (): `${string}-${string}-${string}-${string}-${string}` => {
  const uuid = uuidV4Bytes();
  const getHexRange = (startIndex: number, endIndex: number) => {
    let buff = '';
    for (let i = startIndex; i <= endIndex; ++i) {
      const hexByte = uuid[i].toString(16).padStart(2, '0');
      buff = buff + hexByte;
    }
    return buff;
  };
  return `${getHexRange(0, 3)}-${getHexRange(4, 5)}-${getHexRange(6, 7)}-${getHexRange(8, 9)}-${getHexRange(10, 15)}`;
};

export {
  uuidV4Bytes,
  uuidV4String
};
