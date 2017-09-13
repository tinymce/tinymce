asynctest(
  'browser.tinymce.ui.FilePickerTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'global!window',
    'tinymce.core.InsertContent',
    'tinymce.core.util.Promise',
    'tinymce.core.util.VK',
    'tinymce.plugins.link.Plugin',
    'tinymce.themes.modern.Theme',
    'tinymce.ui.FilePicker'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, window, InsertContent, Promise, VK, LinkPlugin, Theme, FilePicker) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();
    LinkPlugin();

    var getFilePickerCtrl = function (editor) {
      var win = editor.windowManager.getWindows()[0];
      return win ? win.find('filepicker')[0] : null;
    };

    var keydownOnCtrl = function (pickerCtrl, keyCode) {
      return new Promise(function (resolve) {
        pickerCtrl.fire('keydown', { target: pickerCtrl.getEl('inp'), keyCode: keyCode });
        resolve(pickerCtrl);
      });
    };

    var downOnMenu = function (editor) {
      return function () {
        return keydownOnCtrl(getFilePickerCtrl(editor).menu, VK.DOWN);
      };
    };

    var enterOnMenu = function (editor) {
      return function () {
        return keydownOnCtrl(getFilePickerCtrl(editor).menu, VK.ENTER);
      };
    };

    var downOnPicker = function (editor) {
      return function () {
        return keydownOnCtrl(getFilePickerCtrl(editor), VK.DOWN);
      };
    };

    var enterOnPicker = function (editor) {
      return function () {
        return keydownOnCtrl(getFilePickerCtrl(editor), VK.ENTER);
      };
    };

    var setContent = function (editor, content) {
      return function () {
        return new Promise(function (resolve) {
          editor.setContent(content);
          resolve(true);
        });
      };
    };

    var execCommand = function (editor, cmd) {
      return function () {
        return new Promise(function (resolve) {
          editor.execCommand(cmd);
          resolve(true);
        });
      };
    };

    var assertContent = function (editor, exceptedContent) {
      return function () {
        return new Promise(function (resolve) {
          LegacyUnit.equal(editor.getContent(), exceptedContent, 'Should have the expected content');
          resolve(true);
        });
      };
    };

    var waitFor = function (predicate, poll, timeout) {
      return function () {
        var start = new Date().getTime();

        return new Promise(function (resolve, reject) {
          var check = function () {
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

    var waitForMenu = function (editor) {
      return waitFor(
        function () {
          var pickerCtrl = getFilePickerCtrl(editor);
          return pickerCtrl && pickerCtrl.menu;
        },
        100,
        1000
      );
    };

    var setCaret = function (editor, selector, index) {
      return function () {
        return new Promise(function (resolve) {
          LegacyUnit.setSelection(editor, selector, index);
          resolve(true);
        });
      };
    };

    var assertValue = function (editor, expectedValue) {
      return function () {
        return new Promise(function (resolve) {
          var pickerCtrl = getFilePickerCtrl(editor);
          LegacyUnit.equal(pickerCtrl.value(), expectedValue, 'Should have the correct file picker value');
          resolve(pickerCtrl);
        });
      };
    };

    var setPickerValue = function (editor, value) {
      return function () {
        return new Promise(function (resolve) {
          var pickerCtrl = getFilePickerCtrl(editor);
          pickerCtrl.value(value);
          resolve(pickerCtrl);
        });
      };
    };

    var waitForStatusChange = function (editor) {
      return waitFor(
        function () {
          var pickerCtrl = getFilePickerCtrl(editor);
          var msg = pickerCtrl.statusMessage();
          return msg && msg.length > 0;
        },
        100,
        1000
      );
    };

    var assertStatus = function (editor, level, message) {
      return function () {
        return new Promise(function (resolve) {
          var pickerCtrl = getFilePickerCtrl(editor);
          LegacyUnit.equal(pickerCtrl.statusLevel(), level);
          LegacyUnit.equal(pickerCtrl.statusMessage(), message);
          resolve(pickerCtrl);
        });
      };
    };

    var sequence = function (fs) {
      return new Promise(function (resolve) {
        var result = [];

        var next = function () {
          var f = fs.shift();

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
      skin_url: '/project/src/skins/lightgray/dist/lightgray',
      indent: false,
      filepicker_validator_handler: function (query, success) {
        window.setTimeout(function () {
          var valid = query.url.indexOf('fake') === -1;

          success({
            status: valid ? 'valid' : 'invalid',
            message: valid ? 'Valid message' : 'Invalid message'
          });
        }, 0);
      }
    }, success, failure);
  }
);
