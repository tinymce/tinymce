import { Assertions, Chain, Log, NamedChain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.init.InitContentBodyDirectionalityTest', (success, failure) => {
  Theme();

  EditorManager.addI18n('ar', {
    Bold: 'Bold test',
    _dir: 'rtl'
  });

  const cGetBodyDir = Chain.mapper((editor: any) => editor.getBody().dir);

  const cSetContent = (content: string) => Chain.mapper(function (editor: Editor) {
    return editor.editorCommands.execCommand('mceSetContent', false, content);
  });

  const makeStep = (config, label, expected) => Chain.asStep({}, [
    McEditor.cFromSettings(config),
    NamedChain.asChain([
      NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
      NamedChain.direct('editor', cSetContent('<p>Hello world!</p>'), ''),
      NamedChain.direct('editor', cGetBodyDir, 'editorBodyDirectionality'),
      NamedChain.direct('editorBodyDirectionality', Assertions.cAssertEq(label, expected), 'assertion'),
      NamedChain.output('editor')
    ]),
    McEditor.cRemove
  ]);

  Pipeline.async({}, [
    Log.step('TBA', 'Test default directionality of the editor when set to use a rtl language', makeStep(
      {
        base_url: '/project/tinymce/js/tinymce',
        language: 'ar'
      },
      'Directionality should be set to `rtl` by default if the editor is set to a rtl language',
      'rtl'
    )),

    Log.step('TBA', 'Test directionality of the editor when set using the config option while localized using a rtl language', makeStep(
      {
        base_url: '/project/tinymce/js/tinymce',
        language: 'ar',
        directionality: 'ltr'
      },
      'Directionality should be set to `ltr` as per the config option setting',
      'ltr'
    )),

    Log.step('TBA', 'Test directionality of editor when using a language with no directionality set', makeStep(
      {
        base_url: '/project/tinymce/js/tinymce',
        language: 'en'
      },
      'Directionality should not be set if the editor language does not have a directionality',
      ''
    ))
  ], success, failure);
});
