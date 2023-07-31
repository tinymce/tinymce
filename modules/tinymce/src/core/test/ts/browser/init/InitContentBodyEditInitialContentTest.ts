import { UiFinder } from '@ephox/agar';
import { Assert, describe, it } from '@ephox/bedrock-client';
import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.core.init.InitContentBodyEditInitialContentTest', () => {
  it('TINY-10008: if CSS loading takes too long a loader should be applied to the editor', async () => {
    const initialContent = '<p>Initial Content</p>';
    const loadTime = 2000;
    const editor = await McEditor.pFromHtml<Editor>(`<textarea>${initialContent}</textarea>`, {
      base_url: '/project/tinymce/js/tinymce',
      setup: (ed: Editor) => {
        ed.on('PreInit', () => {
          ed.ui.styleSheetLoader.loadAll = (_urls: string[]): Promise<string[]> => {
            return new Promise((resolve, reject) => {
              let resolved = false;
              ed.on('ProgressState', ({ state }) => {
                if (state) {
                  resolved = true;
                  resolve([]);
                }
              });
              setTimeout(() => {
                reject('the progress state is not showed');
                if (!resolved) {
                  Assert.fail('the progress state is not showed');
                }
              }, loadTime);
            });
          };
        });
      }
    });

    assert(editor.getContent(), initialContent);
    await UiFinder.pWaitForHidden('Wait for throbber to hide', SugarBody.body(), '.tox-throbber');
    McEditor.remove(editor);
  });
});
