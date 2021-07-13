import { Assertions, RealKeys } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Focus, Insert, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('webdriver.tinymce.themes.silver.editor.TabbingTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    base_url: '/project/tinymce/js/tinymce',
  }, [ Theme ]);

  it('TINY-3707: Should focus on text editor when tabbing into it', async () => {
    const editor = hook.editor();
    const textInput = SugarElement.fromHtml('<input>') as SugarElement<HTMLElement>;
    const editorElement = SugarElement.fromDom(editor.getElement());
    Insert.before(editorElement, textInput);

    Focus.focus(textInput);
    await RealKeys.pSendKeysOn('input', [ RealKeys.text('\t') ]);
    Assertions.assertEq('Editor has focus', true, editor.hasFocus());
  });
});
