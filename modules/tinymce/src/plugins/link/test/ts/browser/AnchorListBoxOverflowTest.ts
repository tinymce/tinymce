import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Assert, describe, it } from '@ephox/bedrock-client';
import { Strings } from '@ephox/katamari';
import { Css, Height, SugarBody, Traverse, Width } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.AnchorListBoxOverflowTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ], true);

  const longId = Strings.repeat('a', 200);

  const pOpenAnchorsListBox = async (editor: Editor) => {
    editor.setContent(`<p><a id="${longId}"></a>Some text</p>`);
    await TestLinkUi.pOpenLinkDialog(editor);
    const listBox = await TestLinkUi.pFindTargetByLabelInDialog<HTMLButtonElement>(editor, 'Anchors');
    Mouse.click(listBox);
    const menu = await UiFinder.pWaitForVisible<HTMLElement>('Wait for anchors menu to open', SugarBody.body(), '.tox-menu.tox-collection--list');
    return { listBox, menu };
  };

  it('TINYMCE-14261: Anchors menu should not be wider than the listbox when an anchor has a long id', async () => {
    const editor = hook.editor();
    const { listBox, menu } = await pOpenAnchorsListBox(editor);
    const label = UiFinder.findIn<HTMLElement>(menu, `.tox-collection__item-label:contains(${longId})`).getOrDie();

    Assert.eq('Menu should be no wider than the listbox', true, Width.get(menu) <= Width.get(listBox));
    Assert.eq('Long anchor label should stay within the menu', true, Width.get(label) <= Width.get(menu));
    Assert.eq('Long anchor label should wrap onto more than one line', true, Height.get(label) > parseFloat(Css.get(label, 'line-height')));

    Mouse.click(listBox);
    await Waiter.pTryUntil('Wait for anchors menu to close', () => UiFinder.notExists(SugarBody.body(), '.tox-menu.tox-collection--list'));
    await TestLinkUi.pClickCancel(editor);
  });

  it('TINYMCE-14261: Selecting an anchor with a long id should not make the dialog body scroll horizontally', async () => {
    const editor = hook.editor();
    const { listBox, menu } = await pOpenAnchorsListBox(editor);
    const label = UiFinder.findIn(menu, `.tox-collection__item-label:contains(${longId})`).getOrDie();
    Mouse.click(Traverse.parent(label).getOrDie('Failed to find menu item'));

    const body = await TestLinkUi.pFindInDialog<HTMLElement>(editor, '.tox-dialog__body-content');
    const selectedLabel = await UiFinder.pWaitFor<HTMLElement>('Wait for the selected anchor to be shown', listBox, `.tox-listbox__select-label:contains(${longId})`);
    Assert.eq('Dialog body should not scroll horizontally', true, body.dom.scrollWidth <= body.dom.clientWidth);
    Assert.eq('Selected label should be truncated within the listbox', true, selectedLabel.dom.scrollWidth > selectedLabel.dom.clientWidth);
    Assert.eq('Selected label should be truncated with an ellipsis', 'ellipsis', Css.get(selectedLabel, 'text-overflow'));

    await TestLinkUi.pClickCancel(editor);
  });
});
