import { Adt } from '@ephox/katamari';
import { ImageAssetAdt, ImageAssetConstructor, BlobCallback, UrlCallback } from './ImageAssetTypes';

/*
 * An arbitrary common
  data structure for handling both local image files
 * and images from web urls.
 */

const adt: ImageAssetConstructor = Adt.generate([
  { blob: // Local image. W3C blob object (or File).
    [       // NOTE File is just a subclass of Blob
      'id',             // unique ID
      'imageresult',    // the ImageResult object storing blob and data
      'objurl'          // an object URL - THIS MUST BE RELEASED WHEN DONE
    ]
  },
  { url:  [ 'id', 'url', 'raw' ] } // Remote image. JS image object/element loaded via url

]);

const cata = <T> (subject: ImageAssetAdt, onFile: BlobCallback<T>, onImage: UrlCallback<T>): T => subject.fold(onFile, onImage);

export default {
  cata,
  ...adt
};