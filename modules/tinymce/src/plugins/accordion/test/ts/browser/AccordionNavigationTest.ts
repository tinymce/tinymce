import { Keys, UiFinder } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { SugarBody, TextContent } from '@ephox/sugar';
import { TinyHooks, TinySelections, TinyAssertions, TinyContentActions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

describe('browser.tinymce.plugins.accordion.AccordionNavigationTest', () => {
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    },
    [ Plugin ]
  );

  beforeEach(() => {
    hook.editor().resetContent();
  });

  it('TINY-9827: should move cursor above the first child accordion on ArrowUp key pressing', () => {
    const editor = hook.editor();
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.up());
    TinyAssertions.assertContent(editor, `<p>&nbsp;</p>` + AccordionUtils.createAccordion());
    TinyAssertions.assertCursor(editor, [ 0 ], 0);
  });

  it('TINY-9827: should move cursor below the last child accordion on ArrowDown key pressing', () => {
    const editor = hook.editor();
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    TinyContentActions.keystroke(editor, Keys.down());
    TinyAssertions.assertContent(editor, AccordionUtils.createAccordion() + `<p>&nbsp;</p>`);
    TinyAssertions.assertCursor(editor, [ 1 ], 0);
  });

  it('TINY-10291: status bar should not represent accordion body div in element path', () => {
    const editor = hook.editor();
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 1, 0 ], 0);
    const pathElm = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__path').getOrDie();
    // In the absence of the data-mce-bogus attribute being set on the auxiliary accordion body div,
    // the status bar would display 'details › div › p'
    assert.equal(TextContent.get(pathElm), 'details › p');
    editor.execCommand('InsertAccordion');
    TinySelections.setCursor(editor, [ 0, 1, 0, 1, 0 ], 0);
    assert.equal(TextContent.get(pathElm), 'details › details › p');
  });
});
