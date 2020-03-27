import { UnitTest } from '@ephox/bedrock-client';
import { Blob, XMLHttpRequest } from '@ephox/dom-globals';
import { Obj } from '@ephox/katamari';
import * as Assertion from 'ephox/imagetools/test/Assertion';
import { JPEGMeta } from 'ephox/imagetools/api/Main';
import { Promise } from 'ephox/imagetools/util/Promise';

const problematiJPEGs: Record<string, any>[] = [
  {
    desc: '',
    path: 'exif/00da154a-0107-11e4-8336-3377b25ece3d.jpg',
    expect: {
      tiff: {
        Make: 'TCT',
        Orientation: 1
      },
      exif: {
        PixelXDimension: 2560,
        PixelYDimension: 1440,
        MeteringMode: 'CenterWeightedAverage',
        LightSource: 'Other',
        Flash: 'Flash fired',
        FNumber: 2.8
      }
    }
  },
  {
    desc: '',
    path: 'exif/20111119122131.jpg',
    expect: {
      tiff: {
        Make: 'Motorola'
      },
      exif: {
        PixelXDimension: 1920,
        PixelYDimension: 2560,
        DateTimeOriginal: '2011:11:19 12:21:30'
      }
    }
  },
  {
    desc: '',
    path: 'exif/3a5140ea-44fd-11e2-8df2-55ebef1da60e.jpg',
    expect: {
      exif: {
        PixelXDimension: 3264,
        PixelYDimension: 2448,
        MeteringMode: 'Pattern',
        Flash: 'Flash did not fire, auto mode',
        FNumber: 2.4
      }
    }
  },
  {
    desc: `Doesn't resize, #1146`,
    path: 'exif/img_0647.jpg',
    expect: {
      tiff: {
        Model: 'Canon EOS 1100D',
        Orientation: 1
      },
      exif: {
        PixelXDimension: 4272,
        PixelYDimension: 2848,
        MeteringMode: 'Pattern',
        Flash: 'Flash did not fire, compulsory flash mode',
        FNumber: 5.6
      }
    }
  },
  {
    desc: `Doesn't resize, #1146`,
    path: 'exif/19da5c1e-511e-11e4-98b8-477c078e31c6.jpg',
    hasThumb: true
  },
  {
    desc: 'Valid jpeg with embedded thumb.',
    path: 'exif/IMG_2232.JPG',
    hasThumb: true
  }
];

const urlToBlob = function (url: string): Promise<Blob> {
  return new Promise(function (resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.responseType = 'blob';
    xhr.open('get', '/project/@ephox/imagetools/src/test/resources/' + url);
    xhr.onload = function () {
      if (this.status === 200) {
        resolve(this.response);
      } else {
        reject(`${url} cannot be loaded.`);
      }
    };
    xhr.onerror = function () {
      reject(`${url} cannot be loaded.`);
    };
    xhr.send();
  });
};

UnitTest.asynctest('ExifReaderTest', function (success, failure) {

  const promises = problematiJPEGs.map(function (jpeg) {
    return urlToBlob(jpeg.path).then(JPEGMeta.extractFrom).then(function (meta: any) {
      if (jpeg.expect) {
        Obj.each(jpeg.expect, function (info, type) {
          Obj.each(info, function (value, key) {
            Assertion.assertEq(value, meta[type][key], `Testing for ${key} on ${jpeg.path}`);
          });
        });
      }

      if (jpeg.hasThumb) {
        Assertion.assertEq(true, meta.thumb instanceof ArrayBuffer, `Thumb is found on ${jpeg.path}`);
      }
    });
  });

  Promise.all(promises).then(success, failure);
});
