import { Pipeline, Step, Logger, Log } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Cell } from '@ephox/katamari';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Delay from 'tinymce/core/api/util/Delay';
import Promise from 'tinymce/core/api/util/Promise';
import { Clipboard } from 'tinymce/plugins/paste/api/Clipboard';
import Plugin from 'tinymce/plugins/paste/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { atob, Blob } from '@ephox/dom-globals';

UnitTest.asynctest('tinymce.plugins.paste.browser.ImagePasteTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();

  Plugin();
  Theme();

  const base64ImgSrc = [
    'R0lGODdhZABkAHcAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQECgAAACwAAAAAZABkAIEAAAD78jY/',
    'P3SsMjIC/4SPqcvtD6OctNqLs968+w+G4kiW5ommR8C27gvHrxrK9g3TIM7f+tcL5n4doZFFLB6F',
    'Sc6SCRFIp9SqVTp6BiPXbjer5XG95Ck47IuWy2e0bLz2tt3DR5w8p7vgd2tej6TW5ycCGMM3aFZo',
    'OCOYqFjDuOf4KPAHiPh4qZeZuEnXOfjpFto3ilZ6dxqWGreq1br2+hTLtigZaFcJuYOb67DLC+Qb',
    'UIt3i2sshyzZtEFc7JwBLT1NXI2drb3N3e39DR4uPk5ebn6Onq6+zu488A4fLz9P335Aj58fb2+g',
    '71/P759AePwADBxY8KDAhAr9MWyY7yFEgPYmRgxokWK7jEYa2XGcJ/HjgJAfSXI0mRGlRZUTWUJ0',
    '2RCmQpkHaSLEKPKdzYU4c+78VzCo0KFEixo9ijSp0qVMmzp9CjWq1KlUq1q9eqEAADs='
  ].join('');
  const base64ImgSrc2 = [
    'R0lGODlhAQABAPAAAP8REf///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw=='
  ].join('');

  const sTeardown = function (editor) {
    return Logger.t('Delete editor settings', Step.sync(function () {
      delete editor.settings.paste_data_images;
      delete editor.settings.images_dataimg_filter;
      editor.editorUpload.destroy();
    }));
  };

  const appendTeardown = function (editor, steps) {
    return Arr.bind(steps, function (step) {
      return [step, sTeardown(editor)];
    });
  };

  const base64ToBlob = function (base64, type) {
    const buff = atob(base64);
    const bytes = new Uint8Array(buff.length);

    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = buff.charCodeAt(i);
    }

    return new Blob([bytes], { type });
  };

  const noop = function () {
  };

  const mockEvent = function (type, files) {
    let event, transferName;

    event = {
      type,
      preventDefault: noop
    };

    transferName = type === 'drop' ? 'dataTransfer' : 'clipboardData';
    event[transferName] = {
      files
    };

    return event;
  };

  const setupContent = function (editor) {
    editor.setContent('<p>a</p>');
    LegacyUnit.setSelection(editor, 'p', 0);
    return editor.selection.getRng();
  };

  const waitFor = function (predicate) {
    return new Promise(function (resolve, reject) {
      const check = function (time, count) {
        if (predicate()) {
          resolve();
        } else {
          if (count === 0) {
            reject(new Error('Waited for predicate to be true'));
          } else {
            Delay.setTimeout(function () {
              check(time, count - 1);
            }, time);
          }
        }
      };

      check(10, 100);
    });
  };

  const waitForSelector = function (editor, selector) {
    return waitFor(() => editor.dom.select(selector).length > 0);
  };

  suite.asyncTest('TestCase-TBA: Paste: pasteImages should set unique id in blobcache', function (editor, done, die) {
    let rng, event;
    const clipboard = Clipboard(editor, Cell('html'));

    const hasCachedItem = (name) => !!editor.editorUpload.blobCache.get(name);

    editor.settings.paste_data_images = true;
    rng = setupContent(editor);

    event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif'),
      base64ToBlob(base64ImgSrc2, 'image/gif')
    ]);
    clipboard.pasteImageData(event, rng);

    waitForSelector(editor, 'img').then(function () {
      waitFor((editor) => hasCachedItem('mceclip0') && hasCachedItem('mceclip1')).then(() => {
        const cachedBlob1 = editor.editorUpload.blobCache.get('mceclip0');
        const cachedBlob2 = editor.editorUpload.blobCache.get('mceclip1');
        LegacyUnit.equal(base64ImgSrc, cachedBlob1.base64());
        LegacyUnit.equal(base64ImgSrc2, cachedBlob2.base64());

        done();
      }).catch(die);
    }).catch(die);
  });

  suite.asyncTest('TestCase-TBA: Paste: dropImages', function (editor, done, die) {
    let rng, event;
    const clipboard = Clipboard(editor, Cell('html'));

    editor.settings.paste_data_images = true;
    rng = setupContent(editor);

    event = mockEvent('drop', [
      base64ToBlob(base64ImgSrc, 'image/gif')
    ]);
    clipboard.pasteImageData(event, rng);

    waitForSelector(editor, 'img').then(function () {
      LegacyUnit.equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
      LegacyUnit.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

      done();
    }).catch(die);
  });

  suite.asyncTest('TestCase-TBA: Paste: pasteImages', function (editor, done, die) {
    let rng, event;
    const clipboard = Clipboard(editor, Cell('html'));

    editor.settings.paste_data_images = true;
    rng = setupContent(editor);

    event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif')
    ]);
    clipboard.pasteImageData(event, rng);

    waitForSelector(editor, 'img').then(function () {
      LegacyUnit.equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
      LegacyUnit.strictEqual(editor.dom.select('img')[0].src.indexOf('blob:'), 0);

      done();
    }).catch(die);
  });

  suite.asyncTest('TestCase-TBA: Paste: dropImages - images_dataimg_filter', function (editor, done, die) {
    let rng, event;
    const clipboard = Clipboard(editor, Cell('html'));

    editor.settings.paste_data_images = true;
    editor.settings.images_dataimg_filter = function (img) {
      LegacyUnit.strictEqual(img.src, 'data:image/gif;base64,' + base64ImgSrc);
      return false;
    };
    rng = setupContent(editor);

    event = mockEvent('drop', [
      base64ToBlob(base64ImgSrc, 'image/gif')
    ]);
    clipboard.pasteImageData(event, rng);

    waitForSelector(editor, 'img').then(function () {
      LegacyUnit.equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
      LegacyUnit.strictEqual(editor.dom.select('img')[0].src.indexOf('data:'), 0);

      done();
    }).catch(die);
  });

  suite.asyncTest('TestCase-TBA: Paste: pasteImages - images_dataimg_filter', function (editor, done, die) {
    let rng, event;
    const clipboard = Clipboard(editor, Cell('html'));

    editor.settings.paste_data_images = true;
    editor.settings.images_dataimg_filter = function (img) {
      LegacyUnit.strictEqual(img.src, 'data:image/gif;base64,' + base64ImgSrc);
      return false;
    };
    rng = setupContent(editor);

    event = mockEvent('paste', [
      base64ToBlob(base64ImgSrc, 'image/gif')
    ]);
    clipboard.pasteImageData(event, rng);

    waitForSelector(editor, 'img').then(function () {
      LegacyUnit.equal(editor.getContent(), '<p><img src=\"data:image/gif;base64,' + base64ImgSrc + '" />a</p>');
      LegacyUnit.strictEqual(editor.dom.select('img')[0].src.indexOf('data:'), 0);

      done();
    }).catch(die);
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, appendTeardown(editor, Log.steps('TBA', 'Paste: Test image paste', suite.toSteps(editor))), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    automatic_uploads: false,
    plugins: 'paste',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
