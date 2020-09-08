import { Chain, Log, NamedChain, Pipeline, Assertions, ApproxStructure, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';
import { SugarElement, SugarBody, Insert, Focus, Remove } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import Editor from 'tinymce/core/api/Editor';

UnitTest.asynctest('Toolbar persist test', (success, failure) => {
  Theme();

  const cWaitForEditorVisibility = (message: string, visible: boolean) => Waiter.cTryUntil(message, Chain.op((editor: Editor) => {
    Assertions.assertStructure(
      message,
      ApproxStructure.build((s, str, arr) => s.element('div', {
        classes: [ arr.has('tox-tinymce-inline') ],
        attrs: {
          style: str.contains('display: ' + (visible ? 'flex' : 'none'))
        }
      })),
      SugarElement.fromDom(editor.getContainer())
    );
  }));

  const cShowEditor = Chain.fromChains([
    Chain.op((editor: Editor) => editor.theme.inline.ui.show()),
    cWaitForEditorVisibility('Wait for editor to be shown', true)
  ]);

  const cHideEditor = Chain.fromChains([
    Chain.op((editor: Editor) => editor.theme.inline.ui.hide()),
    cWaitForEditorVisibility('Wait for editor to be hidden', false)
  ]);

  const cFocusEditor = Chain.fromChains([
    Chain.op((editor: Editor) => editor.focus()),
    cWaitForEditorVisibility('Wait for editor to be shown', true)
  ]);

  const cUnfocusEditors = Chain.op((_) => {
    const div = SugarElement.fromTag('input');
    Insert.append(SugarBody.body(), div);
    Focus.focus(div);
    Remove.remove(div);
  });

  const settings = {
    theme: 'silver',
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  };

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-4847', 'Test toolbar_persist', [
      NamedChain.asChain([
        NamedChain.write('editor1', McEditor.cFromSettings({ ...settings, toolbar_persist: true })),
        NamedChain.write('editor2', McEditor.cFromSettings({ ...settings, toolbar_persist: false })),

        NamedChain.read('editor2', cFocusEditor),

        NamedChain.read('editor1', cWaitForEditorVisibility('Inline editor 1 should be shown', true)),
        NamedChain.read('editor2', cWaitForEditorVisibility('Inline editor 2 should be shown', true)),

        cUnfocusEditors,

        NamedChain.read('editor1', cWaitForEditorVisibility('Inline editor 1 should be shown', true)),
        NamedChain.read('editor2', cWaitForEditorVisibility('Inline editor 2 should be hidden', false)),

        NamedChain.read('editor1', cHideEditor),

        NamedChain.read('editor1', cWaitForEditorVisibility('Inline editor 1 should be hidden', false)),
        NamedChain.read('editor2', cWaitForEditorVisibility('Inline editor 2 should be hidden', false)),

        NamedChain.read('editor1', cShowEditor),

        NamedChain.read('editor1', cWaitForEditorVisibility('Inline editor 1 should be shown', true)),
        NamedChain.read('editor2', cWaitForEditorVisibility('Inline editor 2 should be hidden', false)),

        NamedChain.read('editor1', McEditor.cRemove),
        NamedChain.read('editor2', McEditor.cRemove)
      ])
    ])
  ], success, failure);
});
