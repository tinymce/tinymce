export class BinaryReader {

  public littleEndian: boolean = false;

  protected _dv: DataView;

  constructor(ar: ArrayBuffer) {
    this._dv = new DataView(ar);
  }

  public readByteAt(idx: number): number {
    return this._dv.getUint8(idx);
  }

  public read(idx: number, size: number): number | null {
    if (idx + size > this.length()) {
      return null;
    }

    const mv = this.littleEndian ? 0 : -8 * (size - 1);

    let sum = 0;
    for (let i = 0; i < size; i++) {
      sum |= (this.readByteAt(idx + i) << Math.abs(mv + i * 8));
    }
    return sum;
  }

  public BYTE(idx: number): number | null {
    return this.read(idx, 1);
  }

  public SHORT(idx: number): number | null {
    return this.read(idx, 2);
  }

  public LONG(idx: number): number | null {
    return this.read(idx, 4);
  }

  public SLONG(idx: number): number | null { // 2's complement notation
    const num = this.read(idx, 4);
    return num === null ? null : (num > 2147483647 ? num - 4294967296 : num);
  }

  public CHAR(idx: number): string {
    const num = this.read(idx, 1);
    return num === null ? '' : String.fromCharCode(num);
  }

  public STRING(idx: number, count: number): string {
    return this.asArray('CHAR', idx, count).join('');
  }

  public SEGMENT(idx?: number, size?: number): ArrayBuffer {
    const ar = this._dv.buffer;

    if (idx !== undefined && size !== undefined) {
      return ar.slice(idx!, idx! + size!);
    } else if (idx !== undefined) {
      return ar.slice(idx);
    } else {
      return ar;
    }
  }

  public asArray(type: 'STRING' | 'CHAR', idx: number, count: number): string[];
  public asArray(type: 'SEGMENT', idx: number, count: number): ArrayBuffer[];
  public asArray(type: string, idx: number, count: number): number[];
  public asArray(type: string, idx: number, count: number): (number | string | ArrayBuffer)[] {
    const values = [];

    for (let i = 0; i < count; i++) {
      values[i] = (this as any)[type](idx + i);
    }
    return values;
  }

  public length(): number {
    return this._dv ? this._dv.byteLength : 0;
  }
}
