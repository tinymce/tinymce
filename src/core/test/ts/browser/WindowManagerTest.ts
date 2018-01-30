import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.WindowManagerTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('OpenWindow/CloseWindow events', function (editor) {
    let openWindowArgs, closeWindowArgs;

    editor.on('CloseWindow', function (e) {
      closeWindowArgs = e;
    });

    editor.on('OpenWindow', function (e) {
      openWindowArgs = e;
      e.win.close();
    });

    editor.windowManager.alert('test');

    LegacyUnit.equal(openWindowArgs.type, 'openwindow');
    LegacyUnit.equal(closeWindowArgs.type, 'closewindow');
    LegacyUnit.equal(editor.windowManager.getWindows().length, 0);

    editor.off('CloseWindow OpenWindow');
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
