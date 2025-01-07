import { ApproxStructure, FocusTools, Waiter } from '@ephox/agar';
import { describe, it, before, after } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { SugarDocument } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/link/Plugin';

import { TestLinkUi } from '../module/TestLinkUi';

describe('browser.tinymce.plugins.link.AttributesPostprocess', () => {
  const newRel = Fun.constant('noopener noreferrer');
  const attrsOverride = (attrs: any) => {
    attrs.rel = newRel();
  };
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: 'link',
    toolbar: 'link',
    link_attributes_postprocess: attrsOverride,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  before(() => {
    TestLinkUi.clearHistory();
  });

  after(() => {
    TestLinkUi.clearHistory();
  });

  it('TINY-11707: The link_attributes_postprocess can be used to override link attributes', async () => {
    const editor = hook.editor();
    editor.setContent('<p>Something</p>');
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
    await Waiter.pTryUntil('Waiting for content to have correct structure', () => {
      TinyAssertions.assertContentStructure(editor, ApproxStructure.build((s, str, _arr) => {
        return s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('a', {
                  attrs: {
                    rel: str.is(newRel())
                  }
                })
              ]
            })
          ]
        });
      }));
    });
  });
});
