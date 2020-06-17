import { Blob } from '@ephox/dom-globals';
import { Options } from '@ephox/katamari';
import * as Conversions from '../util/Conversions';
import { Promise } from '../util/Promise';
import { BinaryReader } from './BinaryReader';
import { readShort } from './BinaryReaderUtils';
import { ExifTags, GPSTags, readMetaData, TiffTags } from './ExifReader';

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
      if (readShort(br, 0).is(0xFFD8)) { // is JPEG
        const headers = extractHeaders(br);
        const app1 = headers.filter((header) => header.name === 'APP1'); // APP1 contains Exif, Gps, etc
        const meta: JPEGMeta = {
          rawHeaders: headers
        } as JPEGMeta;

        if (app1.length) {
          const data = readMetaData(app1[0].segment);
          meta.tiff = data.tiff.getOrDie();
          // silence errors for the optional parts
          meta.exif = Options.flatten(data.exif.toOption()).getOrNull();
          meta.gps = Options.flatten(data.gps.toOption()).getOrNull();
          meta.thumb = Options.flatten(data.thumb.toOption()).getOrNull();
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
  const headers: Header[] = [];

  let idx = 2;

  while (idx + 2 <= br.length()) {
    const marker = readShort(br, idx).toOption().getOrNull();
    if (marker === null) {
      throw new Error('Invalid Exif data.');
    }

    // omit RST (restart) markers
    if (marker >= 0xFFD0 && marker <= 0xFFD7) {
      idx += 2;
      continue;
    }

    // no headers allowed after SOS marker
    if (marker === 0xFFDA || marker === 0xFFD9) {
      break;
    }

    const lengthTemp = readShort(br, idx + 2).toOption().getOrNull();
    if (lengthTemp === null) {
      throw new Error('Invalid Exif data.');
    }

    const length = lengthTemp + 2;

    // APPn marker detected
    if (marker >= 0xFFE1 && marker <= 0xFFEF) {
      headers.push({
        hex: marker,
        name: 'APP' + (marker & 0x000F), // eslint-disable-line no-bitwise
        start: idx,
        length,
        segment: br.segment(idx, length)
      });
    }

    idx += length;
  }
  return headers;
};

export {
  extractFrom
};
