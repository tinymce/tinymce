import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';

import Promise from 'tinymce/core/api/util/Promise';
import VK from 'tinymce/core/api/util/VK';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/modern/Theme';
import FilePicker from 'tinymce/ui/FilePicker';
import { window } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.ui.FilePickerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();
  LinkPlugin();

  const getFilePickerCtrl = function (editor) {
    const win = editor.windowManager.getWindows()[0];
    return win ? win.find('filepicker')[0] : null;
  };

  const keydownOnCtrl = function (pickerCtrl, keyCode) {
    return new Promise(function (resolve) {
      pickerCtrl.fire('keydown', { target: pickerCtrl.getEl('inp'), keyCode });
      resolve(pickerCtrl);
    });
  };

  const downOnMenu = function (editor) {
    return function () {
      return keydownOnCtrl(getFilePickerCtrl(editor).menu, VK.DOWN);
    };
  };

  const enterOnMenu = function (editor) {
    return function () {
      return keydownOnCtrl(getFilePickerCtrl(editor).menu, VK.ENTER);
    };
  };

  const downOnPicker = function (editor) {
    return function () {
      return keydownOnCtrl(getFilePickerCtrl(editor), VK.DOWN);
    };
  };

  const enterOnPicker = function (editor) {
    return function () {
      return keydownOnCtrl(getFilePickerCtrl(editor), VK.ENTER);
    };
  };

  const setContent = function (editor, content) {
    return function () {
      return new Promise(function (resolve) {
        editor.setContent(content);
        resolve(true);
      });
    };
  };

  const execCommand = function (editor, cmd) {
    return function () {
      return new Promise(function (resolve) {
        editor.execCommand(cmd);
        resolve(true);
      });
    };
  };

  const assertContent = function (editor, exceptedContent) {
    return function () {
      return new Promise(function (resolve) {
        LegacyUnit.equal(editor.getContent(), exceptedContent, 'Should have the expected content');
        resolve(true);
      });
    };
  };

  const waitFor = function (predicate, poll, timeout) {
    return function () {
      const start = new Date().getTime();

      return new Promise(function (resolve, reject) {
        const check = function () {
          if (predicate()) {
            resolve();
            return;
          }

          if (new Date().getTime() - start > timeout) {
            reject(new Error('Timeout while waiting for predicate'));
            return;
          }

          window.setTimeout(check, poll);
        };

        check();
      });
    };
  };

  const waitForMenu = function (editor) {
    return waitFor(
      function () {
        const pickerCtrl = getFilePickerCtrl(editor);
        return pickerCtrl && pickerCtrl.menu;
      },
      100,
      1000
    );
  };

  const setCaret = function (editor, selector, index) {
    return function () {
      return new Promise(function (resolve) {
        LegacyUnit.setSelection(editor, selector, index);
        resolve(true);
      });
    };
  };

  const assertValue = function (editor, expectedValue) {
    return function () {
      return new Promise(function (resolve) {
        const pickerCtrl = getFilePickerCtrl(editor);
        LegacyUnit.equal(pickerCtrl.value(), expectedValue, 'Should have the correct file picker value');
        resolve(pickerCtrl);
      });
    };
  };

  const setPickerValue = function (editor, value) {
    return function () {
      return new Promise(function (resolve) {
        const pickerCtrl = getFilePickerCtrl(editor);
        pickerCtrl.value(value);
        resolve(pickerCtrl);
      });
    };
  };

  const waitForStatusChange = function (editor) {
    return waitFor(
      function () {
        const pickerCtrl = getFilePickerCtrl(editor);
        const msg = pickerCtrl.statusMessage();
        return msg && msg.length > 0;
      },
      100,
      1000
    );
  };

  const assertStatus = function (editor, level, message) {
    return function () {
      return new Promise(function (resolve) {
        const pickerCtrl = getFilePickerCtrl(editor);
        LegacyUnit.equal(pickerCtrl.statusLevel(), level);
        LegacyUnit.equal(pickerCtrl.statusMessage(), message);
        resolve(pickerCtrl);
      });
    };
  };

  const sequence = function (fs) {
    return new Promise(function (resolve) {
      const result = [];

      const next = function () {
        const f = fs.shift();

        if (f) {
          f().then(function (res) {
            result.push(res);
            next();
          });
        } else {
          resolve(result);
        }
      };

      next();
    });
  };

  suite.asyncTest('pick first anchor <top>', function (editor, done) {
    sequence([
      setContent(editor, ''),
      execCommand(editor, 'mceLink'),
      downOnPicker(editor),
      waitForMenu(editor),
      enterOnMenu(editor),
      assertValue(editor, '#top'),
      enterOnPicker(editor),
      assertContent(editor, '<p><a href="#top">&lt;top&gt;</a></p>')
    ]).then(function () {
      done();
    });
  });

  suite.asyncTest('pick second anchor <bottom>', function (editor, done) {
    sequence([
      setContent(editor, ''),
      execCommand(editor, 'mceLink'),
      downOnPicker(editor),
      waitForMenu(editor),
      downOnMenu(editor),
      enterOnMenu(editor),
      assertValue(editor, '#bottom'),
      enterOnPicker(editor),
      assertContent(editor, '<p><a href="#bottom">&lt;bottom&gt;</a></p>')
    ]).then(function () {
      done();
    });
  });

  suite.asyncTest('pick first header', function (editor, done) {
    sequence([
      setContent(editor, '<p>x</p><h1 id="h1">header</h1>'),
      setCaret(editor, 'p', 0),
      execCommand(editor, 'mceLink'),
      downOnPicker(editor),
      waitForMenu(editor),
      enterOnMenu(editor),
      assertValue(editor, '#h1'),
      enterOnPicker(editor),
      assertContent(editor, '<p><a href="#h1">header</a>x</p><h1 id="h1">header</h1>')
    ]).then(function () {
      done();
    });
  });

  suite.asyncTest('filepicker_validator_handler', function (editor, done) {
    sequence([
      setContent(editor, '<p>abc</p>'),
      setCaret(editor, 'p', 0),
      execCommand(editor, 'mceLink'),
      setPickerValue(editor, 'http://www.site.com'),
      waitForStatusChange(editor),
      assertStatus(editor, 'ok', 'Valid message'),
      enterOnPicker(editor)
    ]).then(function () {
      done();
    });
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    window.focus();
    editor.focus();
    FilePicker.clearHistory();
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    plugins: 'link',
    skin_url: '/project/js/tinymce/skins/lightgray',
    indent: false,
    filepicker_validator_handler (query, success) {
      window.setTimeout(function () {
        const valid = query.url.indexOf('fake') === -1;

        success({
          status: valid ? 'valid' : 'invalid',
          message: valid ? 'Valid message' : 'Invalid message'
        });
      }, 0);
    }
  }, success, failure);
});
