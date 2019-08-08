import { BinaryReader } from './BinaryReader';

// See https://www.exif.org/Exif2-2.PDF for types
export interface TiffTags {
  Orientation?: number;
  ImageDescription?: string;
  Make?: string;
  Model?: string;
  Software?: string;
  ExifIFDPointer?: number;
  GPSInfoIFDPointer?: number;
}

export interface GPSTags {
  GPSVersionID?: string;
  GPSLatitudeRef?: 'N' | 'S';
  GPSLatitude?: number;
  GPSLongitudeRef?: 'E' | 'W';
  GPSLongitude?: number;
}

export interface ExifTags {
  ExifVersion?: string;
  ColorSpace?: number;
  PixelXDimension?: number;
  PixelYDimension?: number;
  DateTimeOriginal?: string;
  ExposureTime?: number;
  FNumber?: number;
  ISOSpeedRatings?: number;
  ShutterSpeedValue?: number;
  ApertureValue?: number;
  MeteringMode?: number;
  LightSource?: number;
  Flash?: number;
  FocalLength?: number;
  ExposureMode?: number;
  WhiteBalance?: number;
  SceneCaptureType?: string;
  DigitalZoomRatio?: number;
  Contrast?: number;
  Saturation?: number;
  Sharpness?: number;
}

const tags: Record<string, any> = {
  tiff: {
    /*
    The image orientation viewed in terms of rows and columns.

    1 = The 0th row is at the visual top of the image, and the 0th column is the visual left-hand side.
    2 = The 0th row is at the visual top of the image, and the 0th column is the visual right-hand side.
    3 = The 0th row is at the visual bottom of the image, and the 0th column is the visual right-hand side.
    4 = The 0th row is at the visual bottom of the image, and the 0th column is the visual left-hand side.
    5 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual top.
    6 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual top.
    7 = The 0th row is the visual right-hand side of the image, and the 0th column is the visual bottom.
    8 = The 0th row is the visual left-hand side of the image, and the 0th column is the visual bottom.
    */
    0x0112: 'Orientation',
    0x010E: 'ImageDescription',
    0x010F: 'Make',
    0x0110: 'Model',
    0x0131: 'Software',
    0x8769: 'ExifIFDPointer',
    0x8825:	'GPSInfoIFDPointer'
  },
  exif: {
    0x9000: 'ExifVersion',
    0xA001: 'ColorSpace',
    0xA002: 'PixelXDimension',
    0xA003: 'PixelYDimension',
    0x9003: 'DateTimeOriginal',
    0x829A: 'ExposureTime',
    0x829D: 'FNumber',
    0x8827: 'ISOSpeedRatings',
    0x9201: 'ShutterSpeedValue',
    0x9202: 'ApertureValue'	,
    0x9207: 'MeteringMode',
    0x9208: 'LightSource',
    0x9209: 'Flash',
    0x920A: 'FocalLength',
    0xA402: 'ExposureMode',
    0xA403: 'WhiteBalance',
    0xA406: 'SceneCaptureType',
    0xA404: 'DigitalZoomRatio',
    0xA408: 'Contrast',
    0xA409: 'Saturation',
    0xA40A: 'Sharpness'
  },
  gps: {
    0x0000: 'GPSVersionID',
    0x0001: 'GPSLatitudeRef',
    0x0002: 'GPSLatitude',
    0x0003: 'GPSLongitudeRef',
    0x0004: 'GPSLongitude'
  },

  thumb: {
    0x0201: 'JPEGInterchangeFormat',
    0x0202: 'JPEGInterchangeFormatLength'
  }
};

const tagDescs: Record<string, any> = {
  ColorSpace: {
    1: 'sRGB',
    0: 'Uncalibrated'
  },

  MeteringMode: {
    0: 'Unknown',
    1: 'Average',
    2: 'CenterWeightedAverage',
    3: 'Spot',
    4: 'MultiSpot',
    5: 'Pattern',
    6: 'Partial',
    255: 'Other'
  },

  LightSource: {
    1: 'Daylight',
    2: 'Fliorescent',
    3: 'Tungsten',
    4: 'Flash',
    9: 'Fine weather',
    10: 'Cloudy weather',
    11: 'Shade',
    12: 'Daylight fluorescent (D 5700 - 7100K)',
    13: 'Day white fluorescent (N 4600 -5400K)',
    14: 'Cool white fluorescent (W 3900 - 4500K)',
    15: 'White fluorescent (WW 3200 - 3700K)',
    17: 'Standard light A',
    18: 'Standard light B',
    19: 'Standard light C',
    20: 'D55',
    21: 'D65',
    22: 'D75',
    23: 'D50',
    24: 'ISO studio tungsten',
    255: 'Other'
  },

  Flash: {
    0x0000: 'Flash did not fire',
    0x0001: 'Flash fired',
    0x0005: 'Strobe return light not detected',
    0x0007: 'Strobe return light detected',
    0x0009: 'Flash fired, compulsory flash mode',
    0x000D: 'Flash fired, compulsory flash mode, return light not detected',
    0x000F: 'Flash fired, compulsory flash mode, return light detected',
    0x0010: 'Flash did not fire, compulsory flash mode',
    0x0018: 'Flash did not fire, auto mode',
    0x0019: 'Flash fired, auto mode',
    0x001D: 'Flash fired, auto mode, return light not detected',
    0x001F: 'Flash fired, auto mode, return light detected',
    0x0020: 'No flash function',
    0x0041: 'Flash fired, red-eye reduction mode',
    0x0045: 'Flash fired, red-eye reduction mode, return light not detected',
    0x0047: 'Flash fired, red-eye reduction mode, return light detected',
    0x0049: 'Flash fired, compulsory flash mode, red-eye reduction mode',
    0x004D: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light not detected',
    0x004F: 'Flash fired, compulsory flash mode, red-eye reduction mode, return light detected',
    0x0059: 'Flash fired, auto mode, red-eye reduction mode',
    0x005D: 'Flash fired, auto mode, return light not detected, red-eye reduction mode',
    0x005F: 'Flash fired, auto mode, return light detected, red-eye reduction mode'
  },

  ExposureMode: {
    0: 'Auto exposure',
    1: 'Manual exposure',
    2: 'Auto bracket'
  },

  WhiteBalance: {
    0: 'Auto white balance',
    1: 'Manual white balance'
  },

  SceneCaptureType: {
    0: 'Standard',
    1: 'Landscape',
    2: 'Portrait',
    3: 'Night scene'
  },

  Contrast: {
    0: 'Normal',
    1: 'Soft',
    2: 'Hard'
  },

  Saturation: {
    0: 'Normal',
    1: 'Low saturation',
    2: 'High saturation'
  },

  Sharpness: {
    0: 'Normal',
    1: 'Soft',
    2: 'Hard'
  },

  // GPS related
  GPSLatitudeRef: {
    N: 'North latitude',
    S: 'South latitude'
  },

  GPSLongitudeRef: {
    E: 'East longitude',
    W: 'West longitude'
  }
};

interface Offsets {
  tiffHeader: 10;
  IFD0: null | number;
  IFD1: null | number;
  exifIFD: null | number;
  gpsIFD: null | number;
}

export class ExifReader {

  private _reader: BinaryReader;
  private _idx: number;

  private _offsets: Offsets = {
    tiffHeader: 10,
    IFD0: null,
    IFD1: null,
    exifIFD: null,
    gpsIFD: null
  };

  private _tiffTags: TiffTags;

  constructor(ar: ArrayBuffer) {
    this._reader = new BinaryReader(ar);
    this._idx = this._offsets.tiffHeader;

    // Check if that's APP1 and that it has EXIF
    if (this.SHORT(0) !== 0xFFE1 || this.STRING(4, 5).toUpperCase() !== 'EXIF\0') {
      throw new Error('Exif data cannot be read or not available.');
    }

    // Set read order of multi-byte data
    this._reader.littleEndian = (this.SHORT(this._idx) === 0x4949);

    // Check if always present bytes are indeed present
    if (this.SHORT(this._idx += 2) !== 0x002A) {
      throw new Error('Invalid Exif data.');
    }

    this._offsets.IFD0 = this._offsets.tiffHeader + this.LONG(this._idx += 2)!;
    this._tiffTags = this.extractTags(this._offsets.IFD0, tags.tiff);

    if ('ExifIFDPointer' in this._tiffTags) {
      this._offsets.exifIFD = this._offsets.tiffHeader + this._tiffTags.ExifIFDPointer!;
      delete this._tiffTags.ExifIFDPointer;
    }

    if ('GPSInfoIFDPointer' in this._tiffTags) {
      this._offsets.gpsIFD = this._offsets.tiffHeader + this._tiffTags.GPSInfoIFDPointer!;
      delete this._tiffTags.GPSInfoIFDPointer;
    }

    // check if we have a thumb as well
    const IFD1Offset = this.LONG(this._offsets.IFD0 + this.SHORT(this._offsets.IFD0)! * 12 + 2);
    if (IFD1Offset) {
      this._offsets.IFD1 = this._offsets.tiffHeader + IFD1Offset;
    }
  }

  // The following methods are "inherited" from BinaryReader

  public BYTE(idx: number): number | null {
      return this._reader.BYTE(idx);
  }

  public SHORT(idx: number): number | null {
      return this._reader.SHORT(idx);
  }

  public LONG(idx: number): number | null {
      return this._reader.LONG(idx);
  }

  public SLONG(idx: number): number | null {
      return this._reader.SLONG(idx);
  }

  public CHAR(idx: number): string {
      return this._reader.CHAR(idx);
  }

  public STRING(idx: number, count: number): string {
      return this._reader.STRING(idx, count);
  }

  public SEGMENT(idx: number, size: number): ArrayBuffer {
      return this._reader.SEGMENT(idx, size);
  }

  public asArray(type: 'STRING' | 'CHAR', idx: number, count: number): string[];
  public asArray(type: 'SEGMENT', idx: number, count: number): ArrayBuffer[];
  public asArray(type: string, idx: number, count: number): number[];
  public asArray(type: string, idx: number, count: number): (number | string | ArrayBuffer)[] {
      // I have to override asArray because of the 'this[type]'
      const values = [];

      for (let i = 0; i < count; i++) {
          values[i] = (this as any)[type](idx + i);
      }
      return values;
  }

  public length(): number {
      return this._reader.length();
  }

  // End of "inherited" methods

  public UNDEFINED(idx: number): number | null {
    return this.BYTE(idx);
  }

  public RATIONAL(idx: number): number {
    return this.LONG(idx)! / this.LONG(idx + 4)!;
  }

  public SRATIONAL(idx: number): number {
    return this.SLONG(idx)! / this.SLONG(idx + 4)!;
  }

  public ASCII(idx: number): string {
    return this.CHAR(idx);
  }

  public TIFF(): TiffTags {
    return this._tiffTags;
  }

  public EXIF(): ExifTags | null {
    const self = this;

    if (self._offsets.exifIFD) {
      try {
        const Exif: ExifTags = self.extractTags(self._offsets.exifIFD, tags.exif);
        // Fix formatting of some tags
        if (Exif.ExifVersion && Array.isArray(Exif.ExifVersion)) {
          let exifVersion = '';
          for (const ch of Exif.ExifVersion) {
            exifVersion += String.fromCharCode(ch);
          }
          Exif.ExifVersion = exifVersion;
        }
        return Exif;
      } catch (ex) {
        return null;
      }
    } else {
      return null;
    }
  }

  public GPS(): GPSTags | null {
    const self = this;

    if (self._offsets.gpsIFD) {
      try {
        const GPS: GPSTags = self.extractTags(self._offsets.gpsIFD, tags.gps);
        // iOS devices (and probably some others) do not put in GPSVersionID tag (why?..)
        if (GPS.GPSVersionID && Array.isArray(GPS.GPSVersionID)) {
          GPS.GPSVersionID = GPS.GPSVersionID.join('.');
        }
        return GPS;
      } catch (ex) {
        return null;
      }
    } else {
      return null;
    }
  }

  public thumb(): ArrayBuffer | null {
    const self = this;

    if (self._offsets.IFD1) {
      try {
        const IFD1Tags: any = self.extractTags(self._offsets.IFD1, tags.thumb);

        if ('JPEGInterchangeFormat' in IFD1Tags) {
          return self.SEGMENT(self._offsets.tiffHeader + IFD1Tags.JPEGInterchangeFormat, IFD1Tags.JPEGInterchangeFormatLength);
        }
      } catch (ex) {
        return null;
      }
    }
    return null;
  }

  private extractTags(IFD_offset: number, tags2extract: any): any {
    const self = this;
    const hash: any = {};

    const types: Record<number, string> = {
      1 : 'BYTE',
      7 : 'UNDEFINED',
      2 : 'ASCII',
      3 : 'SHORT',
      4 : 'LONG',
      5 : 'RATIONAL',
      9 : 'SLONG',
      10: 'SRATIONAL'
    };

    const sizes: Record<string, number> = {
      BYTE      : 1,
      UNDEFINED : 1,
      ASCII     : 1,
      SHORT     : 2,
      LONG      : 4,
      RATIONAL  : 8,
      SLONG     : 4,
      SRATIONAL : 8
    };

    // Ensure we don't try to read something that doesn't exist
    if (IFD_offset + 2 > self.length()) {
      return hash;
    }

    const length = self.SHORT(IFD_offset)!;

    // The size of APP1 including all these elements shall not exceed the 64 Kbytes specified in the JPEG standard.

    for (let i = 0; i < length; i++) {
      let values = [];

      // Set binary reader pointer to beginning of the next tag
      let offset = IFD_offset + 2 + i * 12;

      const tag = tags2extract[self.SHORT(offset)!];

      if (tag === undefined) {
        continue; // Not the tag we requested
      }

      const type = types[self.SHORT(offset += 2)!];
      const count = self.LONG(offset += 2)!;
      const size = sizes[type];

      if (!size) {
        throw new Error('Invalid Exif data.');
      }

      offset += 4;

      // tag can only fit 4 bytes of data, if data is larger we should look outside
      if (size * count > 4) {
        // instead of data tag contains an offset of the data
        offset = self.LONG(offset)! + self._offsets.tiffHeader;
      }

      // in case we left the boundaries of data throw an early exception
      if (offset + size * count >= self.length()) {
        throw new Error('Invalid Exif data.');
      }

      // special care for the string
      if (type === 'ASCII') {
        // TODO: maybe escape and sanitize
        hash[tag] = self.STRING(offset, count).replace(/\0$/, '').trim(); // strip trailing NULL
        continue;
      } else {
        values = self.asArray(type, offset, count);
        const value = (count === 1 ? values[0] : values);

        if (tagDescs.hasOwnProperty(tag) && typeof value !== 'object') {
          hash[tag] = tagDescs[tag][value];
        } else {
          hash[tag] = value;
        }
      }
    }

    return hash;
  }
}
