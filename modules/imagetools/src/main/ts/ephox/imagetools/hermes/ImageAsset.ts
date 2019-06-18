import { Adt } from '@ephox/katamari';
import { ImageResult } from '../util/ImageResult';
import { Element } from '@ephox/sugar';

/*
 * An arbitrary common data structure for handling both local image files
 * and images from web urls.
 */

export interface BlobImageAsset {
  id: () => string;
  imageresult: () => ImageResult;
  objurl: () => string;
}

export interface UrlImageAsset {
  id: () => string;
  url: () => string;
  raw: () => Element;
}

interface ImageAssetAdt extends Adt {
  blob: (id: string, imageresult: ImageResult, objurl: string) => BlobImageAsset;
  url: (id: string, url: string, raw: Element) => UrlImageAsset;
}

const adt: ImageAssetAdt = Adt.generate([
  { blob: // Local image. W3C blob object (or File).
    [       // NOTE File is just a subclass of Blob
      'id',             // unique ID
      'imageresult',    // the ImageResult object storing blob and data
      'objurl'          // an object URL - THIS MUST BE RELEASED WHEN DONE
    ]
  },
  { url:  ['id', 'url', 'raw'] } // Remote image. JS image object/element loaded via url

]);

type onFileCallback = (id: string, imageresult: ImageResult, objurl: string) => any;
type onImageCallback = (id: string, url: string, raw: any) => any;

const cata = (subject: ImageAssetAdt, onFile: onFileCallback, onImage: onImageCallback) => {
  return subject.fold(onFile, onImage);
};

export default {
  cata,
  ...adt
};