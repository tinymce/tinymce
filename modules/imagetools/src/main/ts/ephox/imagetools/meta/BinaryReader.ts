import { Result } from '@ephox/katamari';

export class BinaryReader {

  public littleEndian: boolean = false;

  private dataView: DataView;

  public constructor(ar: ArrayBuffer) {
    this.dataView = new DataView(ar);
  }

  private readByteAt(idx: number): number {
    return this.dataView.getUint8(idx);
  }

  public read(idx: number, size: number): Result<number, string> {
    if (idx + size > this.length()) {
      return Result.error('Read extends past buffer end');
    }

    const mv = this.littleEndian ? 0 : -8 * (size - 1);

    let sum = 0;
    for (let i = 0; i < size; i++) {
      // eslint-disable-next-line no-bitwise
      sum |= (this.readByteAt(idx + i) << Math.abs(mv + i * 8));
    }
    return Result.value(sum);
  }

  public segment(idx?: number, size?: number): ArrayBuffer {
    const ar = this.dataView.buffer;

    if (idx !== undefined && size !== undefined) {
      return ar.slice(idx, idx + size);
    } else if (idx !== undefined) {
      return ar.slice(idx);
    } else {
      return ar;
    }
  }

  public length(): number {
    return this.dataView.byteLength;
  }
}
