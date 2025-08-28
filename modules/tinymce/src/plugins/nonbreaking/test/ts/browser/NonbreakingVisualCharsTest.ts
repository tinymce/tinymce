import { ApproxStructure } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';

describe('browser.tinymce.plugins.nonbreaking.NonbreakingVisualCharsTest', () => {
  const hook = TinyHooks.bddSetup<Editor>({
    plugins: 'nonbreaking visualchars',
    toolbar: 'nonbreaking visualchars',
    base_url: '/project/tinymce/js/tinymce'
  }, [ NonbreakingPlugin, VisualCharsPlugin ]);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent('');
  });

  it('TINY-3647: Click on the nbsp button and assert nonbreaking space is inserted', () => {
    const editor = hook.editor();
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Nonbreaking space"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('span', {
                classes: [ arr.has('mce-nbsp-wrap') ],
                children: [
                  s.text(str.is(Unicode.nbsp))
                ]
              }),
              s.text(str.is(Unicode.zeroWidth))
            ]
          })
        ]
      });
    }));
  });

  it('TINY-3647: Enable VisualChars then click on the nbsp button and assert nonbreaking span is inserted', () => {
    const editor = hook.editor();
    // click visual chars
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Show invisible characters"]');
    // click nonbreaking
    TinyUiActions.clickOnToolbar(editor, 'button[aria-label="Nonbreaking space"]');
    TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: [
          s.element('p', {
            children: [
              s.element('span', {
                classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                children: [
                  s.text(str.is(Unicode.nbsp))
                ]
              }),
              s.text(str.is(Unicode.zeroWidth))
            ]
          })
        ]
      });
    }));
  });
});

