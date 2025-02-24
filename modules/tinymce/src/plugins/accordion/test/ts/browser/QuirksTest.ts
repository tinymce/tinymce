import { describe, it } from '@ephox/bedrock-client';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/accordion/Plugin';

import * as AccordionUtils from '../module/AccordionUtils';

describe('browser.tinymce.plugins.accordion.QuirksTest', () => {
  const browser = PlatformDetection.detect().browser;
  const hook = TinyHooks.bddSetup<Editor>(
    {
      plugins: 'accordion',
      base_url: '/project/tinymce/js/tinymce',
      indent: false
    },
    [ Plugin ]
  );
  it('TINY-10177: should override the selection to the beginning of `summary` after clicking on it.', () => {
    const editor = hook.editor();
    editor.setContent('<p>Hello</p> ' + AccordionUtils.createAccordion());
    if (browser.isSafari()) {
    // set selection before the `summary`
      TinySelections.setCursor(editor, [ 1 ], 0);
    } else {
    // set selection at the beginning of the `summary`
      TinySelections.setCursor(editor, [ 1, 0 ], 0);
    }
    const event = { target: editor.dom.select('summary')[0] } as unknown as MouseEvent;
    editor.dispatch('click', event );
    TinyAssertions.assertCursor(editor, [ 1, 0 ], 0);
  });
});
