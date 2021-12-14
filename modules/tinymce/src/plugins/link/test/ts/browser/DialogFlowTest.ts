import { ApproxStructure, Assertions, FocusTools, Keys, StructAssert, UiControls, UiFinder } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { Attribute, SugarBody, SugarDocument } from '@ephox/sugar';
import { TinyDom, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.DialogFlowTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  const pAssertInputValue = async (editor: Editor, expected: string, group: string) => {
    const input = await TestLinkUi.pFindInDialog<HTMLInputElement>(editor, 'label:contains("' + group + '") + input');
    const value = UiControls.getValue(input);
    assert.equal(value, expected, 'Checking input value');
  };

  const pAssertUrlStructure = async (editor: Editor, expected: ApproxStructure.Builder<StructAssert>) => {
    const input = await TestLinkUi.pFindInDialog(editor, 'label:contains("URL") + .tox-form__controls-h-stack input');
    Assertions.assertStructure(
      'Checking content of url input',
      ApproxStructure.build(expected),
      input
    );
  };

  const pTestChangingUrlValueWith = async (editor: Editor, chooseItem: () => void) => {
    editor.setContent('<h1>Header One</h1><h2 id="existing-id">Header2</h2>');
    await TestLinkUi.pOpenLinkDialog(editor);
    TinyUiActions.keydown(editor, Keys.down());
    await UiFinder.pWaitForVisible('Waiting for dropdown', SugarBody.body(), '.tox-menu');
    chooseItem();
    await pAssertUrlStructure(editor, (s, str, _arr) => s.element('input', {
      value: str.startsWith('#h_')
    }));
    await pAssertInputValue(editor, 'Header One', 'Text to display');
    await TestLinkUi.pAssertContentPresence(editor, {
      'h1[id]': 0,
      'h2[id]': 1
    });
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'h1[id]': 1
    });

    // Check that the h1's id value is referred to by a link containing dog
    const editorBody = TinyDom.body(editor);
    const h1ID = UiFinder.findIn(editorBody, 'h1').map((h1) => Attribute.get(h1, 'id')).getOrDie();
    UiFinder.exists(editorBody, `a[href="#${h1ID}"]:contains("Header One")`);
  };

  it('TBA: Switching anchor changes the href and text', async () => {
    const editor = hook.editor();
    editor.setContent('<p><a name="anchor1"></a>Our Anchor1</p><p><a name="anchor2"></a>Our Anchor2</p>');

    await TestLinkUi.pOpenLinkDialog(editor);
    await TestLinkUi.pSetListBoxItem(editor, 'Anchor', 'anchor2');
    TestLinkUi.assertDialogContents({
      href: '#anchor2',
      text: 'anchor2',
      title: '',
      anchor: '#anchor2',
      target: ''
    });

    await TestLinkUi.pSetListBoxItem(editor, 'Anchor', 'anchor1');
    TestLinkUi.assertDialogContents({
      href: '#anchor1',
      text: 'anchor1',
      title: '',
      anchor: '#anchor1',
      target: ''
    });

    // Change the text ...so text won't change, but href will still
    await TestLinkUi.pSetInputFieldValue(editor, 'Text to display', 'Other text');
    await TestLinkUi.pSetListBoxItem(editor, 'Anchor', 'anchor2');
    TestLinkUi.assertDialogContents({
      href: '#anchor2',
      text: 'Other text',
      title: '',
      anchor: '#anchor2',
      target: ''
    });

    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      'a[href]': 1,
      'a[href="#anchor2"]:contains("Other text")': 1
    });
  });

  it('TBA: Change urlinput value with keyboard', async () => {
    const editor = hook.editor();
    await pTestChangingUrlValueWith(editor, () => TinyUiActions.keydown(editor, Keys.enter()));
  });

  it('TBA: Change urlinput value with mouse', async () => {
    const editor = hook.editor();
    await pTestChangingUrlValueWith(editor, () => TinyUiActions.clickOnUi(editor, '.tox-collection__item'));
  });

  it('TBA: Change urlinput value manually', async () => {
    const editor = hook.editor();
    editor.setContent('<h1>Something</h2>');
    TinySelections.setSelection(editor, [ 0, 0 ], ''.length, [ 0, 0 ], 'Something'.length);
    await TestLinkUi.pOpenLinkDialog(editor);

    FocusTools.setActiveValue(SugarDocument.getDocument(), 'http://www.tiny.cloud');
    TestLinkUi.assertDialogContents({
      href: 'http://www.tiny.cloud',
      text: 'Something',
      title: '',
      target: ''
    });
    await TestLinkUi.pClickSave(editor);
    await TestLinkUi.pAssertContentPresence(editor, {
      a: 1
    });
  });
});
