import { Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import * as Levels from 'tinymce/core/undo/Levels';
import { UndoLevelType } from 'tinymce/core/undo/UndoManagerTypes';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.undo.ForcedRootBlockTest', function (success, failure) {
  const suite = LegacyUnit.createSuite<Editor>();

  Theme();

  suite.test('createFromEditor forced_root_block: false', function (editor) {
    editor.getBody().innerHTML = '<strong>a</strong> <span>b</span>';

    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<strong>a</strong> <span>b</span>',
      fragments: null,
      type: UndoLevelType.Complete
    });
  });

  suite.test('createFromEditor forced_root_block: false', function (editor) {
    editor.getBody().innerHTML = '<iframe src="about:blank"></iframe> <strong>a</strong> <span>b</span>';

    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '',
      fragments: [
        '<iframe src="about:blank"></iframe>',
        ' ',
        '<strong>a</strong>',
        ' ',
        '<span>b</span>'
      ],
      type: UndoLevelType.Fragmented
    });
  });

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    Pipeline.async({}, suite.toSteps(editor), onSuccess, onFailure);
  }, {
    selector: 'textarea',
    add_unload_trigger: false,
    disable_nodechange: true,
    entities: 'raw',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
