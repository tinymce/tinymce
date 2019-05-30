import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.WindowManagerTest', function (success, failure) {
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('OpenWindow/CloseWindow events', function (editor: Editor) {
    let openWindowArgs, closeWindowArgs;

    editor.on('CloseWindow', function (e) {
      closeWindowArgs = e;
    });

    editor.on('OpenWindow', function (e) {
      openWindowArgs = e;
      editor.windowManager.close();
    });

    editor.windowManager.open({
      title: 'Find and Replace',
      body: {
        type: 'panel',
        items: []
      },
      buttons: []
    });

    LegacyUnit.equal(openWindowArgs.type, 'openwindow');
    LegacyUnit.equal(closeWindowArgs.type, 'closewindow');

    editor.off('CloseWindow OpenWindow');
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
