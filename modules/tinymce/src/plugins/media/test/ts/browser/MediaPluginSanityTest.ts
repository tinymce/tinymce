import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks, TinyUiActions } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

import * as Utils from '../module/test/Utils';

describe('browser.tinymce.plugins.media.MediaPluginSanityTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin, Theme ]);

  it('TBA: Embed content, open dialog, set size and assert constrained and unconstrained size recalculation', async () => {
    const editor = hook.editor();
    editor.setContent('');
    await Utils.pTestEmbedContentFromUrl(editor,
      'www.youtube.com/watch?v=b3XFjWInBog',
      '<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
    );
    await Utils.pTestEmbedContentFromUrl(editor,
      'http://www.youtube.com/watch?v=b3XFjWInBog',
      '<iframe src="http://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
    );
    await Utils.pTestEmbedContentFromUrl(editor,
      'https://www.youtube.com/watch?v=b3XFjWInBog',
      '<iframe src="https://www.youtube.com/embed/b3XFjWInBog" width="560" height="314" allowFullscreen="1"></iframe>'
    );
    await Utils.pTestEmbedContentFromUrl(editor,
      'https://www.youtube.com/watch?v=cOTbVN2qZBY&t=30s&index=2&list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT',
      '<iframe src="https://www.youtube.com/embed/cOTbVN2qZBY?t=30s&amp;index=2&amp;list=PLfQW7NTMsSA1dTqk1dMEanFLovB4-C0FT" width="560" height="314" allowFullscreen="1"></iframe>'
    );
    await Utils.pTestEmbedContentFromUrl(editor,
      'https://www.google.com',
      '<video width="300" height="150" controls="controls">\n<source src="https://www.google.com" />\n</video>'
    );
    await Utils.pAssertSizeRecalcConstrained(editor);
    await Utils.pAssertSizeRecalcUnconstrained(editor);
    await Utils.pAssertSizeRecalcConstrainedReopen(editor);
  });

  it(`TBA: Test changing source, width and height doesn't delete other values`, async () => {
    const editor = hook.editor();
    editor.setContent('');
    await Utils.pOpenDialog(editor);
    await Utils.pSetHeightAndWidth(editor, '300', '300');
    await Utils.pAssertHeightAndWidth(editor, '300', '300');
    await Utils.pChangeHeightValue(editor, '');
    await Utils.pAssertHeightAndWidth(editor, '', '300');
    await Utils.pPasteSourceValue(editor, 'https://youtu.be/G60llMJepZI');
    await Utils.pAssertHeightAndWidth(editor, '314', '300');
    TinyUiActions.closeDialog(editor);
  });

  it('TINY-4857: Test embed with XSS attack sanitized', async () => {
    const editor = hook.editor();
    await Utils.pOpenDialog(editor);
    await Utils.pPasteTextareaValue(editor, '<video controls="controls" width="300" height="150"><source src="a" onerror="alert(1)" /></video>');
    TinyUiActions.submitDialog(editor);
    await Utils.pAssertEditorContent(editor, '<p><video controls="controls" width="300" height="150"><source src="a" /></video></p>');
  });
});
