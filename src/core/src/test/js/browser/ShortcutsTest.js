asynctest(
  'browser.tinymce.core.ShortcutsTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.mcagar.api.LegacyUnit',
    'ephox.mcagar.api.TinyLoader',
    'tinymce.core.Env',
    'tinymce.core.util.Tools',
    'tinymce.themes.modern.Theme'
  ],
  function (Pipeline, LegacyUnit, TinyLoader, Env, Tools, Theme) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var suite = LegacyUnit.createSuite();

    Theme();

    suite.test('Shortcuts formats', function (editor) {
      var assertShortcut = function (shortcut, args, assertState) {
        var called = false;

        editor.shortcuts.add(shortcut, '', function () {
          called = true;
        });

        args = Tools.extend({
          ctrlKey: false,
          altKey: false,
          shiftKey: false,
          metaKey: false
        }, args);

        editor.fire('keydown', args);

        if (assertState) {
          LegacyUnit.equal(called, true, 'Shortcut wasn\'t called: ' + shortcut);
        } else {
          LegacyUnit.equal(called, false, 'Shortcut was called when it shouldn\'t have been: ' + shortcut);
        }
      };

      assertShortcut('ctrl+d', { ctrlKey: true, keyCode: 68 }, true);
      assertShortcut('ctrl+d', { altKey: true, keyCode: 68 }, false);

      if (Env.mac) {
        assertShortcut('meta+d', { metaKey: true, keyCode: 68 }, true);
        assertShortcut('access+d', { ctrlKey: true, altKey: true, keyCode: 68 }, true);
        assertShortcut('meta+d', { ctrlKey: true, keyCode: 68 }, false);
        assertShortcut('access+d', { shiftKey: true, altKey: true, keyCode: 68 }, false);
      } else {
        assertShortcut('meta+d', { ctrlKey: true, keyCode: 68 }, true);
        assertShortcut('access+d', { shiftKey: true, altKey: true, keyCode: 68 }, true);
        assertShortcut('meta+d', { metaKey: true, keyCode: 68 }, false);
        assertShortcut('access+d', { ctrlKey: true, altKey: true, keyCode: 68 }, false);
      }

      assertShortcut('ctrl+shift+d', { ctrlKey: true, shiftKey: true, keyCode: 68 }, true);
      assertShortcut('ctrl+shift+alt+d', { ctrlKey: true, shiftKey: true, altKey: true, keyCode: 68 }, true);
      assertShortcut('ctrl+221', { ctrlKey: true, keyCode: 221 }, true);
    });

    suite.test('Remove', function (editor) {
      var called = false, eventArgs;

      eventArgs = {
        ctrlKey: true,
        keyCode: 68,
        altKey: false,
        shiftKey: false,
        metaKey: false
      };

      editor.shortcuts.add('ctrl+d', '', function () {
        called = true;
      });

      editor.fire('keydown', eventArgs);
      LegacyUnit.equal(called, true, 'Shortcut wasn\'t called when it should have been.');

      called = false;
      editor.shortcuts.remove('ctrl+d');
      editor.fire('keydown', eventArgs);
      LegacyUnit.equal(called, false, 'Shortcut was called when it shouldn\'t.');
    });

    TinyLoader.setup(function (editor, onSuccess, onFailure) {
      Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
    }, {
      add_unload_trigger: false,
      disable_nodechange: true,
      indent: false,
      entities: 'raw',
      skin_url: '/project/src/skins/lightgray/dist/lightgray'
    }, success, failure);
  }
);
