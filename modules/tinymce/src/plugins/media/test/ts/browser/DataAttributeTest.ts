import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.DataAttributeTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    media_url_resolver: (data: { url: string }, resolve: (response: { html: string }) => void) => {
      resolve({ html: '<div data-ephox-embed-iri="' + data.url + '" style="max-width: 300px; max-height: 150px"></div>' });
    },
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const pTestEmbedContentFromUrlWithAttribute = async (editor: Editor, url: string, content: string) => {
    editor.setContent('');
    await Utils.pOpenDialog(editor);
    await Utils.pPasteSourceValue(editor, url);
    // We can't assert the DOM because tab panels don't render hidden tabs, so we check the data model
    await Utils.pAssertEmbedData(editor, content);
    await Utils.pSubmitAndReopen(editor);
    await Utils.pAssertSourceValue(editor, url);
    TinyUiActions.closeDialog(editor);
  };

  const pTestEmbedContentFromUrl2 = async (editor: Editor, url: string, url2: string, content: string, content2: string) => {
    editor.setContent('');
    await Utils.pOpenDialog(editor);
    await Utils.pPasteSourceValue(editor, url);
    await Utils.pAssertEmbedData(editor, content);
    await Utils.pSubmitAndReopen(editor);
    await Utils.pAssertSourceValue(editor, url);
    await Utils.pPasteSourceValue(editor, url2);
    await Utils.pAssertEmbedData(editor, content2);
    TinyUiActions.closeDialog(editor);
  };

  it('TBA: Test embedded content from url with attribute', async () => {
    const editor = hook.editor();
    await pTestEmbedContentFromUrlWithAttribute(editor, 'a',
      '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>'
    );
    await pTestEmbedContentFromUrl2(editor, 'a', 'b',
      '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>',
      '<div data-ephox-embed-iri="b" style="max-width: 300px; max-height: 150px"></div>'
    );
    await Utils.pTestEmbedContentFromUrl(editor, 'a',
      '<div data-ephox-embed-iri="a" style="max-width: 300px; max-height: 150px"></div>'
    );
    await Utils.pAssertSizeRecalcConstrained(editor);
    await Utils.pAssertSizeRecalcUnconstrained(editor);
    await Utils.pAssertSizeRecalcConstrainedReopen(editor);
  });
});
