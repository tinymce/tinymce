import { Assertions, Keys } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import AdvListPlugin from 'tinymce/plugins/advlist/Plugin';
import ListsPlugin from 'tinymce/plugins/lists/Plugin';

describe('browser.tinymce.plugins.advlist.ListStyleAliasTest', () => {
  const pClickOnSplitListBtnFor = async (editor: Editor, label: string) => {
    TinyUiActions.clickOnToolbar(editor, '[aria-label="' + label + '"] > .tox-tbtn + .tox-split-button__chevron');
    return TinyUiActions.pWaitForUi(editor, '.tox-menu.tox-selected-menu');
  };

  const clickListBtnFor = (editor: Editor, label: string, isSplitBtn: boolean) => {
    if (isSplitBtn) {
      TinyUiActions.clickOnToolbar(editor, `[aria-label="${label}"] > .tox-tbtn`);
    } else {
      TinyUiActions.clickOnToolbar(editor, `[aria-label="${label}"]`);
    }
  };

  const pClickAndAssertCheckedListStyleType = async (editor: Editor, styleTypeLabel: string) => {
    const menu = await pClickOnSplitListBtnFor(editor, 'Numbered list');

    Assertions.assertPresence('', {
      'div.tox-collection__item': 6,
      'div.tox-collection__item[aria-checked="false"]': 5,
      'div.tox-collection__item[aria-checked="true"]': 1,
      [`div.tox-collection__item[aria-checked="true"][aria-label="${styleTypeLabel}"]`]: 1,
    }, menu);
  };

  const pTestCheckedListStyleType = async (editor: Editor, styleTypeLabel: string, styleType: string) => {
    editor.setContent([
      styleType === '' ? '<ol>' : `<ol style="list-style-type: ${styleType};">`,
      '<li>abc</li>',
      '<li>def</li>',
      '</ol>'
    ].join(''));
    TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);

    await pClickAndAssertCheckedListStyleType(editor, styleTypeLabel);

    TinyUiActions.keyup(editor, Keys.escape());
  };

  context('default numbered list split button', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'advlist lists',
      toolbar: 'numlist bullist',
      base_url: '/project/tinymce/js/tinymce'
    }, [ AdvListPlugin, ListsPlugin ]);

    it('TINY-11515: no list collection items should be checked when not in a list', async () => {
      const editor = hook.editor();
      editor.setContent('<p>abc</p>');
      TinySelections.setCursor(editor, [ 0, 0 ], 0);

      const menu = await pClickOnSplitListBtnFor(editor, 'Numbered list');

      Assertions.assertPresence('', {
        'div.tox-collection__item': 6,
        'div.tox-collection__item[aria-checked="false"]': 6,
      }, menu);

      TinyUiActions.keyup(editor, Keys.escape());
    });

    it('TINY-11515: default list collection item should be checked when in a default list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Default', '');
    });

    it('TINY-11515: lower alpha list collection item should be checked when in a lower-alpha list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Lower Alpha', 'lower-alpha');
    });

    it('TINY-11515: lower alpha list collection item should be checked when in a lower-latin (alias) list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Lower Alpha', 'lower-latin');
    });

    it('TINY-11515: should be able to toggle a lower-latin (alias) list', async () => {
      const editor = hook.editor();
      editor.setContent([
        `<ol style="list-style-type: lower-latin;">`,
        '<li>abc</li>',
        '<li>def</li>',
        '</ol>'
      ].join(''));
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);

      clickListBtnFor(editor, 'Numbered list', true);

      TinyAssertions.assertContent(editor, [
        '<p>abc</p>\n',
        `<ol style="list-style-type: lower-latin;">\n`,
        '<li>def</li>\n',
        '</ol>'
      ].join(''));
    });

    it('TINY-11515: should be able to toggle a lower-latin (alias) nested list', async () => {
      const editor = hook.editor();
      editor.setContent([
        `<ol style="list-style-type: lower-latin;">`,
        '<li>abc',
        `<ol style="list-style-type: lower-latin;">`,
        '<li>123</li>',
        '</ol>',
        '</li>',
        '<li>def</li>',
        '</ol>'
      ].join(''));
      TinySelections.setCursor(editor, [ 0, 0, 1, 0 ], 1);

      await pClickAndAssertCheckedListStyleType(editor, 'Lower Alpha');
      clickListBtnFor(editor, 'Numbered list', true);

      TinyAssertions.assertContent(editor, [
        `<ol style="list-style-type: lower-latin;">\n`,
        '<li>abc</li>\n',
        '</ol>\n',
        '<p>123</p>\n',
        `<ol style="list-style-type: lower-latin;">\n`,
        '<li>def</li>\n',
        '</ol>'
      ].join(''));
    });

    it('TINY-11515: should be able to convert a lower-latin (alias) list to its equivalent list style', async () => {
      const editor = hook.editor();
      editor.setContent([
        `<ol style="list-style-type: lower-latin;">`,
        '<li>abc</li>',
        '<li>def</li>',
        '</ol>'
      ].join(''));
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);

      await pClickOnSplitListBtnFor(editor, 'Numbered list');
      TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[aria-label="Lower Alpha"]');

      TinyAssertions.assertContent(editor, [
        `<ol style="list-style-type: lower-alpha;">\n`,
        '<li>abc</li>\n',
        '<li>def</li>\n',
        '</ol>'
      ].join(''));
    });

    it('TINY-11515: should be able to convert a lower-latin (alias) list to another numbered list style', async () => {
      const editor = hook.editor();
      editor.setContent([
        `<ol style="list-style-type: lower-latin;">`,
        '<li>abc</li>',
        '<li>def</li>',
        '</ol>'
      ].join(''));
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);

      await pClickOnSplitListBtnFor(editor, 'Numbered list');
      TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[aria-label="Lower Greek"]');

      TinyAssertions.assertContent(editor, [
        `<ol style="list-style-type: lower-greek;">\n`,
        '<li>abc</li>\n',
        '<li>def</li>\n',
        '</ol>'
      ].join(''));
    });

    it('TINY-11515: should be able to convert a lower-latin (alias) list to a bullet list', async () => {
      const editor = hook.editor();
      editor.setContent([
        `<ol style="list-style-type: lower-latin;">`,
        '<li>abc</li>',
        '<li>def</li>',
        '</ol>'
      ].join(''));
      TinySelections.setCursor(editor, [ 0, 0, 0 ], 1);

      await pClickOnSplitListBtnFor(editor, 'Bullet list');
      TinyUiActions.clickOnUi(editor, 'div.tox-selected-menu[role="menu"] div[aria-label="Default"]');

      TinyAssertions.assertContent(editor, [
        `<ul>\n`,
        '<li>abc</li>\n',
        '<li>def</li>\n',
        '</ul>'
      ].join(''));
    });
  });

  context('numbered list split button with alias', () => {
    const hook = TinyHooks.bddSetupLight<Editor>({
      plugins: 'advlist lists',
      advlist_number_styles: 'default,lower-greek,lower-alpha,upper-alpha,lower-latin,upper-latin',
      toolbar: 'numlist bullist',
      base_url: '/project/tinymce/js/tinymce'
    }, [ AdvListPlugin, ListsPlugin ]);

    it('TINY-11515: lower alpha list collection item should be checked when in a lower-alpha list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Lower Alpha', 'lower-alpha');
    });

    it('TINY-11515: upper alpha list collection item should be checked when in a upper-alpha list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Upper Alpha', 'upper-alpha');
    });

    it('TINY-11515: lower latin list collection item should be checked when in a lower-latin (alias) list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Lower Latin', 'lower-latin');
    });

    it('TINY-11515: upper latin list collection item should be checked when in a upper-latin (alias) list', async () => {
      const editor = hook.editor();
      await pTestCheckedListStyleType(editor, 'Upper Latin', 'upper-latin');
    });
  });
});
