export default class BinaryReader {

    protected _dv: DataView;

    public littleEndian: boolean = false;

    constructor(ar: ArrayBuffer) {
        this._dv = new DataView(ar);
    }

    readByteAt(idx) {
        return this._dv.getUint8(idx);
    }

    read(idx, size) {
        if (idx + size > this.length()) {
            return null;
        }

        var mv = this.littleEndian ? 0 : -8 * (size - 1);

        for (var i = 0, sum = 0; i < size; i++) {
            sum |= (this.readByteAt(idx + i) << Math.abs(mv + i*8));
        }
        return sum;
    }

    BYTE(idx) {
        return this.read(idx, 1);
    }

    SHORT(idx) {
        return this.read(idx, 2);
    }

    LONG(idx) {
        return this.read(idx, 4);
    }

    SLONG(idx) { // 2's complement notation
        var num = this.read(idx, 4);
        return (num > 2147483647 ? num - 4294967296 : num);
    }

    CHAR(idx) {
        return String.fromCharCode(this.read(idx, 1));
    }

    STRING(idx, count) {
        return this.asArray('CHAR', idx, count).join('');
    }

    SEGMENT(idx, size) {
        var ar = this._dv.buffer;

        switch (arguments.length) {
            case 2:
                return ar.slice(idx, idx + size);
            case 1:
                return ar.slice(idx);
            default: return ar;
        }
    }

    asArray(type, idx, count) {
        var values = [];

        for (var i = 0; i < count; i++) {
            values[i] = this[type](idx + i);
        }
        return values;
    }

    length() {
        return this._dv ? this._dv.byteLength : 0;
    }
}
