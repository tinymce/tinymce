import { Arr, Option, Result, Type } from '@ephox/katamari';
import { BinaryReader } from './BinaryReader';
import { readByte, readList, readLong, readShort, readSignedLong, readString } from './BinaryReaderUtils';

// See https://www.exif.org/Exif2-2.PDF for types
export interface TiffTags {
  Orientation?: number;
  ImageDescription?: string;
  Make?: string;
  Model?: string;
  Software?: string;
  ExifIFDPointer: Option<number>;
  GPSInfoIFDPointer: Option<number>;
}

export interface GPSTags {
  GPSVersionID?: string;
  GPSLatitudeRef?: string;
  GPSLatitude?: number;
  GPSLongitudeRef?: string;
  GPSLongitude?: number;
}

export interface ExifTags {
  ExifVersion?: string;
  ColorSpace?: string;
  PixelXDimension?: number;
  PixelYDimension?: number;
  DateTimeOriginal?: string;
  ExposureTime?: number;
  FNumber?: number;
  ISOSpeedRatings?: number;
  ShutterSpeedValue?: number;
  ApertureValue?: number;
  MeteringMode?: string;
  LightSource?: string;
  Flash?: string;
  FocalLength?: number;
  ExposureMode?: string;
  WhiteBalance?: string;
  SceneCaptureType?: string;
  DigitalZoomRatio?: number;
  Contrast?: string;
  Saturation?: string;
  Sharpness?: string;
}

interface ThumbTags {
  JPEGInterchangeFormat: number;
  JPEGInterchangeFormatLength: number;
}

const tags: Record<string, Record<number, string>> = {
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
    0x8825: 'GPSInfoIFDPointer'
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
    0x9202: 'ApertureValue',
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

const tagDescs: Record<string, Record<number, string>> = {
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
    0x4E: 'North latitude', // 'N' codepoint
    0x53: 'South latitude' // 'S' codepoint
  },

  GPSLongitudeRef: {
    0x45: 'East longitude', // 'E' codepoint
    0x57: 'West longitude' // 'W' codepoint
  }
};

const readRational = (reader: BinaryReader, idx: number) => readLong(reader, idx).bind((numerator) => readLong(reader, idx + 4).map((denominator) => numerator / denominator));

const readSignedRational = (reader: BinaryReader, idx: number) => readSignedLong(reader, idx).bind((numerator) => readSignedLong(reader, idx + 4).map((denominator) => numerator / denominator));

const extractTags = (reader: BinaryReader, ifdOffset: number, tiffHeaderOffset: number, tags2extract: Record<number, string>): Result<Record<string, unknown>, string> => {

  const types: Record<number, { name: string; size: number; read: (reader: BinaryReader, idx: number) => Result<number, string> }> = {
    1: { name: 'BYTE', size: 1, read: readByte },
    7: { name: 'UNDEFINED', size: 1, read: readByte },
    2: { name: 'ASCII', size: 1, read: readByte }, // readByte is only used for single characters
    3: { name: 'SHORT', size: 2, read: readShort },
    4: { name: 'LONG', size: 4, read: readLong },
    5: { name: 'RATIONAL', size: 8, read: readRational },
    9: { name: 'SLONG', size: 4, read: readSignedLong },
    10: { name: 'SRATIONAL', size: 8, read: readSignedRational }
  };

  const withTag = (tag: string) => (value: unknown) => Option.some<[string, unknown]>([ tag, value ]);

  // TODO: maybe escape and sanitize
  const cleanupString = (str: string) => str.replace(/\0$/, '').trim();

  const ID_OFFSET = 0;
  const TYPE_OFFSET = 2;
  const COUNT_OFFSET = 4;
  const DATA_OFFSET = 8;
  // read the length of this tag section
  return readShort(reader, ifdOffset).fold(
    () => Result.value({}), // it doesn't exist, we'll return an empty set
    (length) => {
      const tagSet: Record<string, unknown> = {};
      // The size of APP1 including all these elements shall not exceed the 64 Kbytes specified in the JPEG standard.

      for (let i = 0; i < length; i++) {

        // Set binary reader pointer to beginning of the next tag
        const offset = ifdOffset + 2 + (i * 12);

        // read the tagId, typeId and count from the tag
        const tagItem = readShort(reader, offset + ID_OFFSET).bind(
          (tagId) => readShort(reader, offset + TYPE_OFFSET).bind(
            (typeId) => readLong(reader, offset + COUNT_OFFSET).bind(
              (count): Result<Option<[string, unknown]>, string> => {
                // now see if we're interested in the tag
                const tag = tags2extract[tagId];
                if (tag === undefined) {
                  // skip tag, we're not interested in it
                  return Result.value(Option.none());
                }
                const type = types[typeId];
                if (type === undefined) {
                  // unknown type? this data is bad
                  return Result.error('Tag with type number ' + typeId + ' was unrecognised.');
                }
                // find where the data is
                let dataOffset = offset + DATA_OFFSET;
                // tag can only fit 4 bytes of data, if data is larger we should look outside
                if (type.size * count > 4) {
                  // instead of data, the tag contains an offset of the data
                  const indirectDataOffset = readLong(reader, offset + DATA_OFFSET);
                  if (indirectDataOffset.isError()) {
                    return indirectDataOffset.map((_value) => Option.none<[string, unknown]>());
                  }
                  dataOffset = indirectDataOffset.getOrDie() + tiffHeaderOffset;
                }
                // in case we left the boundaries of the buffer return an error
                if (dataOffset + (type.size * count) >= reader.length()) {
                  return Result.error('Invalid Exif data.');
                }
                // read the data associated with the tag
                if (count === 1 && tagDescs[tag] !== undefined) {
                  return type.read(reader, dataOffset).map((num) => tagDescs[tag][num]).map(withTag(tag));
                } else if (type.name === 'ASCII') { // special care for the string
                  return readString(reader, dataOffset, count).map(cleanupString).map(withTag(tag));
                } else if (count === 1) {
                  return type.read(reader, dataOffset).map(withTag(tag));
                } else {
                  return readList(reader, dataOffset, type.size, count, type.read).map(withTag(tag));
                }
              }
            )
          )
        );
        // check if we successfully read the tag
        if (tagItem.isError()) {
          return tagItem.map((_value) => tagSet);
        }
        // add to set of tags
        tagItem.each((opt) => opt.each(([ tag, value ]) => {
          tagSet[tag] = value;
        }));
      }

      return Result.value(tagSet);
    }
  );

};

const parseTiffTags = (data: Record<string, unknown>): TiffTags => ({
  Orientation: Option.from(data.Orientation).filter(Type.isNumber).getOrUndefined(),
  ImageDescription: Option.from(data.ImageDescription).filter(Type.isString).getOrUndefined(),
  Make: Option.from(data.Make).filter(Type.isString).getOrUndefined(),
  Model: Option.from(data.Model).filter(Type.isString).getOrUndefined(),
  Software: Option.from(data.Software).filter(Type.isString).getOrUndefined(),
  ExifIFDPointer: Option.from(data.ExifIFDPointer).filter(Type.isNumber),
  GPSInfoIFDPointer: Option.from(data.GPSInfoIFDPointer).filter(Type.isNumber)
});

const parseExifTags = (data: Record<string, unknown>): ExifTags => {
  const ExifVersion = (() => {
    const version = data.ExifVersion;
    if (Type.isString(version)) {
      return version;
    } else if (Type.isArray(version)) {
      return Arr.map(version, (item) => {
        if (Type.isNumber(item)) {
          return String.fromCharCode(item);
        } else {
          return '';
        }
      }).join('');
    } else {
      return undefined;
    }
  })();

  return {
    ExifVersion,
    ColorSpace: Option.from(data.ColorSpace).filter(Type.isString).getOrUndefined(),
    PixelXDimension: Option.from(data.PixelXDimension).filter(Type.isNumber).getOrUndefined(),
    PixelYDimension: Option.from(data.PixelYDimension).filter(Type.isNumber).getOrUndefined(),
    DateTimeOriginal: Option.from(data.DateTimeOriginal).filter(Type.isString).getOrUndefined(),
    ExposureTime: Option.from(data.ExposureTime).filter(Type.isNumber).getOrUndefined(),
    FNumber: Option.from(data.FNumber).filter(Type.isNumber).getOrUndefined(),
    ISOSpeedRatings: Option.from(data.ISOSpeedRatings).filter(Type.isNumber).getOrUndefined(),
    ShutterSpeedValue: Option.from(data.ShutterSpeedValue).filter(Type.isNumber).getOrUndefined(),
    ApertureValue: Option.from(data.ApertureValue).filter(Type.isNumber).getOrUndefined(),
    MeteringMode: Option.from(data.MeteringMode).filter(Type.isString).getOrUndefined(),
    LightSource: Option.from(data.LightSource).filter(Type.isString).getOrUndefined(),
    Flash: Option.from(data.Flash).filter(Type.isString).getOrUndefined(),
    FocalLength: Option.from(data.FocalLength).filter(Type.isNumber).getOrUndefined(),
    ExposureMode: Option.from(data.ExposureMode).filter(Type.isString).getOrUndefined(),
    WhiteBalance: Option.from(data.WhiteBalance).filter(Type.isString).getOrUndefined(),
    SceneCaptureType: Option.from(data.SceneCaptureType).filter(Type.isString).getOrUndefined(),
    DigitalZoomRatio: Option.from(data.DigitalZoomRatio).filter(Type.isNumber).getOrUndefined(),
    Contrast: Option.from(data.Contrast).filter(Type.isString).getOrUndefined(),
    Saturation: Option.from(data.Saturation).filter(Type.isString).getOrUndefined(),
    Sharpness: Option.from(data.Sharpness).filter(Type.isString).getOrUndefined()
  };
};

const parseGpsTags = (data: Record<string, unknown>): GPSTags => {
  const GPSVersionID = (() => {
    const version = data.GPSVersionID;
    if (Type.isString(version)) {
      return version;
    } else if (Type.isArray(version)) {
      return Arr.map(version, (item) => {
        if (Type.isNumber(item)) {
          return '' + item;
        } else if (Type.isString(item)) {
          return item;
        } else {
          return '';
        }
      }).join('.');
    }
    return undefined;
  })();

  return {
    GPSVersionID,
    GPSLatitudeRef: Option.from(data.GPSLatitudeRef).filter(Type.isString).getOrUndefined(),
    GPSLatitude: Option.from(data.GPSLatitude).filter(Type.isNumber).getOrUndefined(),
    GPSLongitudeRef: Option.from(data.GPSLongitudeRef).filter(Type.isString).getOrUndefined(),
    GPSLongitude: Option.from(data.GPSLongitude).filter(Type.isNumber).getOrUndefined()
  };
};

const parseThumbTags = (data: Record<string, unknown>): Result<ThumbTags, string> => {
  const JPEGInterchangeFormat = data.JPEGInterchangeFormat;
  if (JPEGInterchangeFormat === undefined) {
    return Result.error('');
  }
  if (!Type.isNumber(JPEGInterchangeFormat)) {
    return Result.error('');
  }
  const JPEGInterchangeFormatLength = data.JPEGInterchangeFormatLength;
  if (JPEGInterchangeFormatLength === undefined) {
    return Result.error('');
  }
  if (!Type.isNumber(JPEGInterchangeFormatLength)) {
    return Result.error('');
  }
  return Result.value({
    JPEGInterchangeFormat,
    JPEGInterchangeFormatLength
  });
};

export interface MetaData {
  tiff: Result<TiffTags, string>;
  exif: Result<Option<ExifTags>, string>;
  gps: Result<Option<GPSTags>, string>;
  thumb: Result<Option<ArrayBuffer>, string>;
}

export const readMetaData = (ar: ArrayBuffer): MetaData => {
  const reader = new BinaryReader(ar);
  const TIFF_HEADER = 10;
  const ifd0 = ((): Result<number, string> => {
    // Check if that's APP1 and that it has EXIF
    if (!readShort(reader, 0).is(0xFFE1) || !readString(reader, 4, 5).map((s) => s.toUpperCase()).is('EXIF\0')) {
      return Result.error('APP1 marker and EXIF marker cannot be read or not available.');
    }
    // Set read order of multi-byte data
    reader.littleEndian = readShort(reader, TIFF_HEADER).is(0x4949);

    // Check if always present bytes are indeed present
    if (!readShort(reader, TIFF_HEADER + 2).is(0x002A)) {
      return Result.error('Invalid Exif data.');
    }

    return readLong(reader, TIFF_HEADER + 4).map((ifb0Offset) => TIFF_HEADER + ifb0Offset);
  })();

  const tiff = ifd0.bind((ifb0Start) => extractTags(reader, ifb0Start, TIFF_HEADER, tags.tiff).map(parseTiffTags));

  const exif = tiff.bind((tiffTags) => tiffTags.ExifIFDPointer.fold(
    () => Result.value(Option.none<ExifTags>()),
    (exifOffset) => extractTags(reader, TIFF_HEADER + exifOffset, TIFF_HEADER, tags.exif)
      .map(parseExifTags).map(Option.some)
  ));

  const gps = tiff.bind((tiffTags) => tiffTags.GPSInfoIFDPointer.fold(
    () => Result.value(Option.none<GPSTags>()),
    (gpsOffset) => extractTags(reader, TIFF_HEADER + gpsOffset, TIFF_HEADER, tags.gps)
      .map(parseGpsTags).map(Option.some)
  ));

  const exififd = ifd0.bind((ifb0Start) => readShort(reader, ifb0Start).map((ifb0Length) => ifb0Start + 2 + (ifb0Length * 12)));

  const ifd1 = exififd.bind((exififdStart) => readLong(reader, exififdStart).map((ifb1Offset) => ifb1Offset + TIFF_HEADER));

  const thumb = ifd1.bind((ifd1Start) => extractTags(reader, ifd1Start, TIFF_HEADER, tags.thumb)
    .bind(parseThumbTags)
    .map((tags) => reader.segment(TIFF_HEADER + tags.JPEGInterchangeFormat, tags.JPEGInterchangeFormatLength))
    .map(Option.some));

  return {
    tiff,
    exif,
    gps,
    thumb
  };
};
