import { Assertions, Chain, Guard, Pipeline, Log, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor, ApiChains, UiChains } from '@ephox/mcagar';
import { Body, Visibility } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce/themes.silver.ShowHideTest', (success, failure) => {
  Theme();

  const base_url = '/project/tinymce/js/tinymce';

  const cWaitForVisible = UiChains.cWaitForState(Visibility.isVisible);
  const cWaitForInvisible = (label: string, selector: string) => Chain.control(
    Chain.fromIsolatedChains([
      Chain.injectThunked(Body.body),
      Chain.exists([
        UiFinder.cNotExists(selector),
        Chain.fromIsolatedChains([
          UiFinder.cFindIn(selector),
          Chain.mapper(Visibility.isVisible),
          Assertions.cAssertEq(label, false)
        ])
      ])
    ]),
    Guard.tryUntil(label)
  );

  const cHide = Chain.op((editor: Editor) => editor.hide());
  const cShow = Chain.op((editor: Editor) => editor.show());

  const cOpenDialog = Chain.op((editor: Editor) => editor.windowManager.open({
    title: 'Dummy dialog',
    body: {
      type: 'panel',
      items: [
        {
          type: 'htmlpanel',
          html: 'Lorem ipsum'
        }
      ]
    },
    buttons: [
      {
        type: 'submit',
        text: 'Ok'
      }
    ]
  }));

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-6048', 'Inline editor should hide UI on editor hide', [
      McEditor.cFromSettings({ base_url, inline: true }),
      // Bring out the UI
      ApiChains.cFocus,
      cWaitForVisible('UI should be on the screen', '.tox-toolbar'),
      // Hide the editor
      cHide,
      cWaitForInvisible('UI should not be on the screen', '.tox-toolbar'),
      // Bring the editor back
      cShow,
      cWaitForVisible('UI should be back on the scren', '.tox-toolbar'),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-6048', 'Iframe editor should hide UI on editor hide', [
      McEditor.cFromSettings({ base_url }),
      cWaitForVisible('UI should be on the screen', '.tox-toolbar'),
      cHide,
      cWaitForInvisible('UI should not be on the screen', '.tox-toolbar'),
      cShow,
      cWaitForVisible('UI should be back on the screen', '.tox-toolbar'),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-6048', 'Inline editor should close dialogs on editor hide', [
      McEditor.cFromSettings({ base_url, inline: true }),
      // Bring out the UI
      ApiChains.cFocus,
      cOpenDialog,
      cWaitForVisible('Dialog should be on the screen', '.tox-dialog'),
      // Hide the editor
      cHide,
      cWaitForInvisible('Dialog should not be on the screen', '.tox-dialog'),
      // Bring the editor back
      cShow,
      cWaitForVisible('Dialog should be back on the scren', '.tox-dialog'),
      McEditor.cRemove
    ]),

    Log.chainsAsStep('TINY-6048', 'Iframe editor should close dialogs on editor hide', [
      McEditor.cFromSettings({ base_url }),
      // Bring out the UI
      cOpenDialog,
      cWaitForVisible('Dialog should be on the screen', '.tox-dialog'),
      // Hide the editor
      cHide,
      cWaitForInvisible('Dialog should not be on the screen', '.tox-dialog'),
      // Bring the editor back
      cShow,
      cWaitForVisible('Dialog should be back on the scren', '.tox-dialog'),
      McEditor.cRemove
    ])
  ], success, failure);
});
