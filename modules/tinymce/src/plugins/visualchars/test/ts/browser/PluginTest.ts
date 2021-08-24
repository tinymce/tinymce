import { ApproxStructure, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/visualchars/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import { assertSpanStruct, assertNbspStruct, assertStruct } from '../module/test/Utils';

describe('browser.tinymce.plugins.visualchars.PluginTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'visualchars',
    toolbar: 'visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Set content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', async () => {
    const editor = hook.editor();
    editor.setContent('<p>a&nbsp;&nbsp;b</p>');
    assert.lengthOf(editor.dom.select('span'), 0);
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertSpanStruct));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertNbspStruct));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertSpanStruct));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertNbspStruct));
    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to appear', () => TinyAssertions.assertContentStructure(editor, assertSpanStruct));
  });

  it('TINY-4507: Set content with HTML like content, click visual chars button and assert span char is present in whitespaces, click the button again and assert no span is present in the whitespace', async () => {
    const editor = hook.editor();
    editor.setContent('<p>&lt;img src=&quot;image.png&quot;&gt;&nbsp;</p>');

    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars', () => assertStruct(ApproxStructure.build((s, str) => [
      s.text(str.is('<img src="image.png">')),
      s.element('span', {})
    ])));

    TinyUiActions.clickOnToolbar(editor, 'button');
    await Waiter.pTryUntil('wait for visual chars to disappear', () => assertStruct(ApproxStructure.build((s, str) => [
      s.text(str.is('<img src="image.png">')),
      s.text(str.is(Unicode.nbsp))
    ])));
  });
});
