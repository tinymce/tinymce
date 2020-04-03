import { BinaryReader } from './BinaryReader';
import { Result } from '@ephox/katamari';

export const readList = <T> (reader: BinaryReader, idx: number, unitSize: number, count: number, read: (reader: BinaryReader, idx: number) => Result<T, string>) => {
  if (idx + (unitSize * count) > reader.length()) {
    return Result.error<T[], string>('Read would extend past end of buffer');
  }
  const list: T[] = [];
  for (let i = 0; i < count; i++) {
    const offset = idx + unitSize * i;
    const item = read(reader, offset);
    if (item.isError()) {
      return item.map((value) => [ value ]);
    }
    list.push(item.getOrDie());
  }
  return Result.value<T[], string>(list);
};

export const readByte = (reader: BinaryReader, idx: number) => reader.read(idx, 1);

export const readShort = (reader: BinaryReader, idx: number) => reader.read(idx, 2);

export const readLong = (reader: BinaryReader, idx: number) => reader.read(idx, 4);

export const byteToChar = (num: number) => Result.value<string, string>(String.fromCharCode(num));

export const longToSignedLong = (num: number) => Result.value<number, string>(num > 2147483647 ? num - 4294967296 : num);

export const readSignedLong = (reader: BinaryReader, idx: number) =>
  readLong(reader, idx).bind(longToSignedLong);

export const readChar = (reader: BinaryReader, idx: number) =>
  readByte(reader, idx).bind(byteToChar);

export const readString = (reader: BinaryReader, idx: number, length: number = 1) =>
  readList(reader, idx, 1, length, readChar).map((chars) => chars.join(''));