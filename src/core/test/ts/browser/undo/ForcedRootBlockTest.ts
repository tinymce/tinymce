import { Pipeline } from '@ephox/agar';
import { LegacyUnit, TinyLoader } from '@ephox/mcagar';
import Levels from 'tinymce/core/undo/Levels';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.undo.ForcedRootBlockTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const suite = LegacyUnit.createSuite();

  Theme();

  suite.test('createFromEditor forced_root_block: false', function (editor) {
    editor.getBody().innerHTML = '<strong>a</strong> <span>b</span>';

    LegacyUnit.deepEqual(Levels.createFromEditor(editor), {
      beforeBookmark: null,
      bookmark: null,
      content: '<strong>a</strong> <span>b</span>',
      fragments: null,
      type: 'complete'
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
      type: 'fragmented'
    });
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
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
