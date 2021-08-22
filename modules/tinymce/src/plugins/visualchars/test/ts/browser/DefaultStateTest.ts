import { Keyboard, Keys, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyDom, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { assertNbspStruct, assertSpanStruct } from '../module/test/Utils';

describe('browser.tinymce.plugins.visualchars.DefaultStateTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce',
    visualchars_default_state: true
  }, [ Plugin, Theme ]);

  it('tests the default visualchars state', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;&nbsp;b</p>');

    // Need to trigger a keydown event to get the visual chars to show after calling set content
    Keyboard.activeKeydown(TinyDom.document(editor), Keys.space(), { });
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertSpanStruct));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to disappear', () => TinyAssertions.assertContentStructure(editor, assertNbspStruct));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertSpanStruct));
  });
});
