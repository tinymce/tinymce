import { Assertions, Pipeline, Log, ApproxStructure } from '@ephox/agar';
import { TinyLoader, TinyApis } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';

UnitTest.asynctest('browser.tinymce.core.init.SilverEditorDirectionalityTest', (success, failure) => {
  Theme();

  EditorManager.addI18n('ar', {
    Bold: 'Bold test',
    _dir: 'rtl'
  });

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const editorContainer = Element.fromDom(editor.getContainer());

    Pipeline.async({},
      Log.steps('TBA', 'Test directionality of the editor UI when set to use a rtl language', [
        tinyApis.sFocus,
        Assertions.sAssertStructure(
          'Directionality of the editor UI should be `rtl` when using a rtl language',
          ApproxStructure.build((s, str, arr) => {
            return s.element('div', {
              classes: [ arr.has('tox-tinymce') ],
              attrs: { dir: str.is('rtl') }
            });
          }),
          editorContainer
        )
      ])
    , onSuccess, onFailure);
  }, {
    language: 'ar',
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
