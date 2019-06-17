import { Blob } from '@ephox/dom-globals';
import * as Conversions from '../util/Conversions';
import { Promise } from '../util/Promise';
import { BinaryReader } from './BinaryReader';
import { ExifReader, ExifTags, GPSTags , TiffTags} from './ExifReader';

export interface JPEGMeta {
  tiff: TiffTags;
  exif: ExifTags | null;
  gps: GPSTags | null;
  thumb: ArrayBuffer | null;
  rawHeaders: Header[];
}

interface Header {
  hex: number;
  name: string;
  start: number;
  length: number;
  segment: ArrayBuffer;
}

const extractFrom = function (blob: Blob): Promise<JPEGMeta> {
  return Conversions.blobToArrayBuffer(blob).then<JPEGMeta>(function (ar) {
    try {
      const br = new BinaryReader(ar);
      if (br.SHORT(0) === 0xFFD8) { // is JPEG
        const headers = extractHeaders(br);
        const app1 = headers.filter((header) => header.name === 'APP1'); // APP1 contains Exif, Gps, etc
        const meta: JPEGMeta = {
          rawHeaders: headers
        } as JPEGMeta;

        if (app1.length) {
          const exifReader = new ExifReader(app1[0].segment);
          meta.tiff = exifReader.TIFF();
          meta.exif = exifReader.EXIF();
          meta.gps = exifReader.GPS();
          meta.thumb = exifReader.thumb();
        } else {
          return Promise.reject('Headers did not include required information');
        }

        return meta;
      }
      return Promise.reject('Image was not a jpeg');
    } catch (ex) {
      return Promise.reject(`Unsupported format or not an image: ${blob.type} (Exception: ${ex.message})`);
    }
  });
};

const extractHeaders = function (br: BinaryReader): Header[] {
  const headers = [];
  let marker;

  let idx = 2;

  while (idx + 2 <= br.length()) {
    marker = br.SHORT(idx)!;

    // omit RST (restart) markers
    if (marker >= 0xFFD0 && marker <= 0xFFD7) {
      idx += 2;
      continue;
    }

    // no headers allowed after SOS marker
    if (marker === 0xFFDA || marker === 0xFFD9) {
      break;
    }

    const length = br.SHORT(idx + 2)! + 2;

    // APPn marker detected
    if (marker >= 0xFFE1 && marker <= 0xFFEF) {
      headers.push({
        hex: marker,
        name: 'APP' + (marker & 0x000F),
        start: idx,
        length,
        segment: br.SEGMENT(idx, length)
      });
    }

    idx += length;
  }
  return headers;
};

export {
  extractFrom
};