import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.WindowManagerTest', (success, failure) => {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  suite.test('OpenWindow/CloseWindow events', (editor) => {
    let openWindowArgs, closeWindowArgs;

    editor.on('CloseWindow', (e) => {
      closeWindowArgs = e;
    });

    editor.on('OpenWindow', (e) => {
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

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    disable_nodechange: true,
    indent: false,
    entities: 'raw',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
