import Conversions from '../util/Conversions';
import Promise from '../util/Promise';
import BinaryReader from './BinaryReader';
import ExifReader from './ExifReader';


var extractFrom = function (blob) {
    return Conversions.blobToArrayBuffer(blob).then(function (ar) {
        try {
            let br = new BinaryReader(ar);
            if (br.SHORT(0) === 0xFFD8) { // is JPEG
                let headers = extractHeaders(br);
                let app1 = headers.filter(header => header.name === 'APP1'); // APP1 contains Exif, Gps, etc
                var meta: any = {};

                if (app1.length) {
                    let exifReader = new ExifReader(app1[0].segment);
                    meta = {
                        tiff: exifReader.TIFF(),
                        exif: exifReader.EXIF(),
                        gps: exifReader.GPS(),
                        thumb: exifReader.thumb()
                    };
                }

                meta.rawHeaders = headers;
                return meta;
            }
        } catch (ex) {
            return Promise.reject(`Unsupported format or not an image: ${blob.type} (Exception: ${ex.message})`);
        }
    });
};

var extractHeaders = function (br: BinaryReader) {
    var headers = [], idx, marker, length = 0;

    idx = 2;

    while (idx <= br.length()) {
        marker = br.SHORT(idx);

        // omit RST (restart) markers
        if (marker >= 0xFFD0 && marker <= 0xFFD7) {
            idx += 2;
            continue;
        }

        // no headers allowed after SOS marker
        if (marker === 0xFFDA || marker === 0xFFD9) {
            break;
        }

        length = br.SHORT(idx + 2) + 2;

        // APPn marker detected
        if (marker >= 0xFFE1 && marker <= 0xFFEF) {
            headers.push({
                hex: marker,
                name: 'APP' + (marker & 0x000F),
                start: idx,
                length: length,
                segment: br.SEGMENT(idx, length)
            });
        }

        idx += length;
    }
    return headers;
};


export default <any> {
    extractFrom
};