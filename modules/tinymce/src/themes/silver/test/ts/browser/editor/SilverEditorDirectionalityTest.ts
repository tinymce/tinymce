import { ApproxStructure, Assertions, Chain, Log, NamedChain, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { McEditor } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('Editor (Silver) directionality test', (success, failure) => {
  Theme();

  EditorManager.addI18n('ar', {
    Bold: 'Bold test',
    _dir: 'rtl'
  });

  const cGetEditorContainer = Chain.mapper((editor: Editor) => SugarElement.fromDom(editor.getContainer()));

  const cSetContent = (content: string) => Chain.mapper((editor: any) => {
    return editor.editorCommands.execCommand('mceSetContent', false, content);
  });

  const makeStep = (config, label, editorStructure) => Chain.asStep({}, [
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

  Pipeline.async({}, [
    Log.step('TBA', 'Test directionality of the editor UI when set to use a rtl language', makeStep(
      {
        theme: 'silver',
        language: 'ar',
        base_url: '/project/tinymce/js/tinymce'
      },
      'Directionality of the editor UI should be `rtl` when using a rtl language',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        attrs: { dir: str.is('rtl') }
      }))
    )),

    Log.step('TBA', 'Test directionality of the editor UI when set to use a language without directionality', makeStep(
      {
        theme: 'silver',
        language: 'en',
        base_url: '/project/tinymce/js/tinymce'
      },
      'Directionality of the editor UI should not be set when using a language without directionality',
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce') ],
        attrs: { dir: str.none() }
      }))
    ))
  ], success, failure);
});
