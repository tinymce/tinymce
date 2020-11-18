import { Logger, Step, Waiter } from '@ephox/agar';
import { Assert } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import Editor from 'tinymce/core/api/Editor';

const sExecCommand = function (editor: Editor, cmd: string, value?: string) {
  return Logger.t(`Execute ${cmd}`, Step.sync(function () {
    editor.execCommand(cmd, false, value);
  }));
};

const sLoadImage = function (editor: Editor, url: string, size?: { width: number; height: number }) {
  return Logger.t(`Load image ${url}`, Step.async(function (done, die) {
    const img = new Image();

    img.onload = function () {
      editor.setContent(`<p><img src="${url}" ${size ? `width="${size.width}" height="${size.height}"` : ''} /></p>`);
      editor.focus();
      done();
    };

    img.onerror = (e) => die(e);

    img.src = url;
  }));
};

const sUploadImages = function (editor: Editor) {
  return Logger.t('Upload images', Step.async(function (done) {
    editor.uploadImages(done);
  }));
};

const sWaitForBlobImage = function (editor: Editor) {
  return Waiter.sTryUntil('Did not find a blobimage', Step.sync(function () {
    Assert.eq('Should be one blob image', true, editor.dom.select('img[src^=blob]').length === 1);
  }), 10, 3000);
};

const createStateContainer = function () {
  const state = Cell(null);

  const handler = function (url: string) {
    return function (blobInfo, success) {
      state.set({
        blobInfo
      });

      success(url);
    };
  };

  const sResetState = Logger.t('Reset state',
    Step.sync(function () {
      state.set(null);
    })
  );

  const sWaitForState = Waiter.sTryUntil('Did not get a state change', Step.sync(function () {
    Assert.eq('Should be true when we have the state', true, state.get() !== null);
  }), 10, 3000);

  return {
    get: state.get,
    handler,
    sResetState,
    sWaitForState
  };
};

export {
  sExecCommand,
  sLoadImage,
  sUploadImages,
  sWaitForBlobImage,
  createStateContainer
};
