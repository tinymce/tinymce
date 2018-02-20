import Canvas from './Canvas';
import Conversions from './Conversions';
import Promise from './Promise';
import { Fun } from '@ephox/katamari';

function create(getCanvas, blob, uri) {
  var initialType = blob.type;

  var getType = Fun.constant(initialType);

  function toBlob() {
    return Promise.resolve(blob);
  }

  function toDataURL() {
    return uri;
  }

  function toBase64() {
    return uri.split(',')[1];
  }

  function toAdjustedBlob(type, quality) {
    return getCanvas.then(function (canvas) {
      return Conversions.canvasToBlob(canvas, type, quality);
    });
  }

  function toAdjustedDataURL(type, quality) {
    return getCanvas.then(function (canvas) {
      return Conversions.canvasToDataURL(canvas, type, quality);
    });
  }

  function toAdjustedBase64(type, quality) {
    return toAdjustedDataURL(type, quality).then(function (dataurl) {
      return dataurl.split(',')[1];
    });
  }

  function toCanvas() {
    return getCanvas.then(Canvas.clone);
  }

  return {
    getType,
    toBlob,
    toDataURL,
    toBase64,
    toAdjustedBlob,
    toAdjustedDataURL,
    toAdjustedBase64,
    toCanvas
  };
}

function fromBlob(blob) {
  return Conversions.blobToDataUri(blob).then(function (uri) {
    return create(Conversions.blobToCanvas(blob), blob, uri);
  });
}

function fromCanvas(canvas, type) {
  return Conversions.canvasToBlob(canvas, type).then(function (blob) {
    return create(Promise.resolve(canvas), blob, canvas.toDataURL());
  });
}

function fromImage(image) {
  return Conversions.imageToBlob(image).then(function (blob) {
    return fromBlob(blob);
  });
}

var fromBlobAndUrlSync = function (blob, url) {
  return create(Conversions.blobToCanvas(blob), blob, url);
};

export default <any> {
  fromBlob,
  fromCanvas,
  fromImage,
  fromBlobAndUrlSync
};