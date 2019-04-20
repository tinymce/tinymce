export class BinaryReader {

  protected _dv: DataView;

  public littleEndian: boolean = false;

  constructor(ar: ArrayBuffer) {
    this._dv = new DataView(ar);
  }

  readByteAt(idx: number): number {
    return this._dv.getUint8(idx);
  }

  read(idx: number, size: number): number | null {
    if (idx + size > this.length()) {
      return null;
    }

    const mv = this.littleEndian ? 0 : -8 * (size - 1);

    let sum = 0;
    for (let i = 0; i < size; i++) {
      sum |= (this.readByteAt(idx + i) << Math.abs(mv + i*8));
    }
    return sum;
  }

  BYTE(idx: number): number {
    const num = this.read(idx, 1);
    if (num !== null) {
      return num;
    } else {
      // TODO is this right?
      throw new Error('No more data to read');
    }
  }

  SHORT(idx: number): number {
    const num = this.read(idx, 2);
    if (num !== null) {
      return num;
    } else {
      // TODO is this right?
      throw new Error('No more data to read');
    }
  }

  LONG(idx: number): number {
    const num = this.read(idx, 4);
    if (num !== null) {
      return num;
    } else {
      // TODO is this right?
      throw new Error('No more data to read');
    }
  }

  SLONG(idx: number): number { // 2's complement notation
    const num = this.read(idx, 4);
    if (num !== null) {
      return (num > 2147483647 ? num - 4294967296 : num);
    } else {
      // TODO is this right?
      throw new Error('No more data to read');
    }
  }

  CHAR(idx: number): string {
    const num = this.read(idx, 1);
    if (num !== null) {
      return String.fromCharCode(num);
    } else {
      // TODO is this right?
      throw new Error('No more data to read');
    }
  }

  STRING(idx: number, count: number): string {
    return this.asArray('CHAR', idx, count).join('');
  }

  SEGMENT(idx?: number, size?: number): ArrayBuffer {
    const ar = this._dv.buffer;

    if (idx !== undefined && size !== undefined) {
      return ar.slice(idx!, idx! + size!);
    } else if (idx !== undefined) {
      return ar.slice(idx);
    } else {
      return ar;
    }
  }

  asArray(type: 'STRING' | 'CHAR', idx: number, count: number): string[];
  asArray(type: 'SEGMENT', idx: number, count: number): ArrayBuffer[];
  asArray(type: string, idx: number, count: number): number[];
  asArray(type: string, idx: number, count: number): (number | string | ArrayBuffer)[] {
    const values = [];

    for (let i = 0; i < count; i++) {
      values[i] = (this as any)[type](idx + i);
    }
    return values;
  }

  length(): number {
    return this._dv ? this._dv.byteLength : 0;
  }
}
