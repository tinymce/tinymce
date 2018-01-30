import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import Tools from 'tinymce/core/api/util/Tools';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.ShortcutsTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('Shortcuts formats', function (editor) {
    const assertShortcut = function (shortcut, args, assertState) {
      let called = false;

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
    let called = false, eventArgs;

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
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
