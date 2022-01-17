import { ApproxStructure, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { TinyAssertions, TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.DimensionsFalseEmbedTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    media_dimensions: false,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const struct = ApproxStructure.build((s, str, arr) => {
    return s.element('body', {
      children: [
        s.element('p', {
          children: [
            s.element('span', {
              attrs: {
                'data-mce-object': str.is('iframe')
              },
              children: [
                s.element('iframe', {
                  attrs: {
                    width: str.is('200'),
                    height: str.is('100')
                  }
                }),
                s.element('span', {
                  classes: [ arr.has('mce-shim') ]
                })
              ]
            })
          ]
        }),
        s.theRest()
      ]
    });
  });

  it('TBA: Open dialog, assert dimensions fields are not present while media_dimensions is false', async () => {
    const editor = hook.editor();
    const dialog = await Utils.pOpenDialog(editor);
    UiFinder.exists(dialog, Utils.selectors.source);
    UiFinder.notExists(dialog, Utils.selectors.width);
    UiFinder.notExists(dialog, Utils.selectors.height);
    TinyUiActions.submitDialog(editor);
    await Waiter.pTryUntil(
      'Wait for dialog to close',
      () => UiFinder.notExists(SugarBody.body(), 'div[aria-label="Insert/edit media"][role="dialog"]')
    );
  });

  it('TINY-950: Open dialog, set text area content, close dialog and assert content structure', async () => {
    const editor = hook.editor();
    await Utils.pOpenDialog(editor);
    await Utils.pPasteTextareaValue(
      editor,
      '<iframe width="200" height="100" src="a" ' +
      ' frameborder="0" allowfullscreen></iframe>'
    );
    TinyUiActions.submitDialog(editor);
    await Waiter.pTryUntil(
      'content was not expected structure',
      () => TinyAssertions.assertContentStructure(editor, struct)
    );
  });
});
