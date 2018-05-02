import { RawAssertions, Step, Waiter } from '@ephox/agar';
import { Cell } from '@ephox/katamari';
import { Image } from '@ephox/dom-globals';

const sExecCommand = function (editor, cmd, value?) {
  return Step.sync(function () {
    editor.execCommand(cmd, false, value);
  });
};

const sLoadImage = function (editor, url, size?) {
  return Step.async(function (done) {
    const img = new Image();

    img.onload = function () {
      editor.setContent(`<p><img src="${url}" ${size ? `width="${size.width}" height="${size.height}"` : ''} /></p>`);
      editor.focus();
      done();
    };

    img.src = url;
  });
};

const sUploadImages = function (editor) {
  return Step.async(function (done) {
    editor.uploadImages(done);
  });
};

const sWaitForBlobImage = function (editor) {
  return Waiter.sTryUntil('Did not find a blobimage', Step.sync(function () {
    RawAssertions.assertEq('Should be one blob image', true, editor.dom.select('img[src^=blob]').length === 1);
  }), 10, 3000);
};

const createStateContainer = function () {
  const state = Cell(null);

  const handler = function (url) {
    return function (blobInfo, success) {
      state.set({
        blobInfo
      });

      success(url);
    };
  };

  const sResetState = Step.sync(function () {
    state.set(null);
  });

  const sWaitForState = Waiter.sTryUntil('Did not get a state change', Step.sync(function () {
    RawAssertions.assertEq('Should be true when we have the state', true, state.get() !== null);
  }), 10, 3000);

  return {
    get: state.get,
    handler,
    sResetState,
    sWaitForState
  };
};

export default {
  sExecCommand,
  sLoadImage,
  sUploadImages,
  sWaitForBlobImage,
  createStateContainer
};