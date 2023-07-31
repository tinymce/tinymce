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
          const realLoadAll = ed.ui.styleSheetLoader.loadAll;
          ed.ui.styleSheetLoader.loadAll = (urls: string[]): Promise<string[]> => {
            const result = realLoadAll.call(ed.ui.styleSheetLoader, urls);
            ed.ui.styleSheetLoader.loadAll = realLoadAll;
            return new Promise((resolve, reject) => {
              const rejectTimeout = setTimeout(() => {
                reject('the progress state is not showed');
                Assert.fail('the progress state is not showed');
              }, loadTime);

              ed.on('ProgressState', ({ state }) => {
                if (state) {
                  clearTimeout(rejectTimeout);
                  resolve(result);
                }
              });
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
