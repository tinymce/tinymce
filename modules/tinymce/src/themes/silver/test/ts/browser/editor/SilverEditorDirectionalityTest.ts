import { Assertions, Pipeline, Log, ApproxStructure, NamedChain, Chain } from '@ephox/agar';
import { Editor as McEditor } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock-client';
import { Element } from '@ephox/sugar';
import EditorManager from 'tinymce/core/api/EditorManager';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('Editor (Silver) directionality test', (success, failure) => {
  Theme();

  EditorManager.addI18n('ar', {
    Bold: 'Bold test',
    _dir: 'rtl'
  });

  const cGetEditorContainer = Chain.mapper((editor: Editor) => Element.fromDom(editor.getContainer()));

  const cSetContent = (content: string) => Chain.mapper(function (editor: any) {
    return editor.editorCommands.execCommand('mceSetContent', false, content);
  });

  const makeStep = (config, label, editorStructure) => {
    return Chain.asStep({}, [
      McEditor.cFromSettings(config),
      NamedChain.asChain([
        NamedChain.direct(NamedChain.inputName(), Chain.identity, 'editor'),
        NamedChain.direct('editor', cSetContent('<p>Hello world!</p>'), ''),
        NamedChain.direct('editor', cGetEditorContainer, 'editorContainer'),
        NamedChain.direct('editorContainer', Assertions.cAssertStructure(
          label,
          editorStructure
        ), 'assertion'),
        NamedChain.output('editor')
      ]),
      McEditor.cRemove
    ]);
  };

  Pipeline.async({}, [
    Log.step('TBA', 'Test directionality of the editor UI when set to use a rtl language', makeStep(
      {
        theme: 'silver',
        language: 'ar',
        base_url: '/project/tinymce/js/tinymce'
      },
      'Directionality of the editor UI should be `rtl` when using a rtl language',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-tinymce') ],
          attrs: { dir: str.is('rtl') }
        });
      })
    )),

    Log.step('TBA', 'Test directionality of the editor UI when set to use a language without directionality', makeStep(
      {
        theme: 'silver',
        language: 'en',
        base_url: '/project/tinymce/js/tinymce'
      },
      'Directionality of the editor UI should not be set when using a language without directionality',
      ApproxStructure.build((s, str, arr) => {
        return s.element('div', {
          classes: [ arr.has('tox-tinymce') ],
          attrs: { dir: str.none() }
        });
      })
    ))
  ], success, failure);
});
