import { context, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/media/Plugin';

describe('browser.tinymce.plugins.media.core.MediaAlignmentTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    plugins: [ 'media' ],
    toolbar: 'media',
    base_url: '/project/tinymce/js/tinymce'
  }, [ Plugin ]);

  const testCommand = (cmd: string) => (inputHtml: string, expectedHtml: string) => {
    const editor = hook.editor();

    editor.setContent(inputHtml);
    TinySelections.select(editor, '.mce-preview-object,[data-ephox-embed-iri]', []);
    editor.execCommand(cmd);

    TinyAssertions.assertContent(editor, expectedHtml);
  };

  const testAlignLeft = testCommand('JustifyLeft');
  const testAlignCenter = testCommand('JustifyCenter');
  const testAlignRight = testCommand('JustifyRight');

  context('apply alignment to video elements', () => {
    it('TINY-8687: align video element without styles to the left', () => testAlignLeft(
      '<p><video src="about:blank" width="300" height="250"></video></p>',
      '<p><video style="float: left;" src="about:blank" width="300" height="250"></video></p>'
    ));

    it('TINY-8687: align video element without styles to the center', () => testAlignCenter(
      '<p><video src="about:blank" width="300" height="250"></video></p>',
      '<p><video style="display: table; margin-left: auto; margin-right: auto;" src="about:blank" width="300" height="250"></video></p>'
    ));

    it('TINY-8687: align video element without styles to the right', () => testAlignRight(
      '<p><video src="about:blank" width="300" height="250"></video></p>',
      '<p><video style="float: right;" src="about:blank" width="300" height="250"></video></p>'
    ));

    it('TINY-8687: aligning a video element with styles to the left should retain existing styles', () => testAlignLeft(
      '<p><video style="color: red;" src="about:blank" width="300" height="250"></video></p>',
      '<p><video style="color: red; float: left;" src="about:blank" width="300" height="250"></video></p>'
    ));
  });

  context('apply alignment to ephox embed elements', () => {
    it('TINY-8687: align ephox embed element without styles to the left', () => testAlignLeft(
      '<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>',
      '<div style="float: left;" contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>'
    ));

    it('TINY-8687: align ephox embed element without styles to the center', () => testAlignCenter(
      '<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>',
      '<div style="margin-left: auto; margin-right: auto;" contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>'
    ));

    it('TINY-8687: align ephox embed element without styles to the right', () => testAlignRight(
      '<div contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>',
      '<div style="float: right;" contenteditable="false" data-ephox-embed-iri="embed-iri"><iframe src="about:blank"></iframe></div>'
    ));
  });

  context('remove alignment from video', () => {
    it('TINY-8687: remove align left from video element without styles', () => testAlignLeft(
      '<p><video style="float: left;" src="about:blank" width="300" height="250"></video></p>',
      '<p><video src="about:blank" width="300" height="250"></video></p>'
    ));

    it('TINY-8687: remove align center from video element without styles', () => testAlignCenter(
      '<p><video style="display: table; margin-left: auto; margin-right: auto;" src="about:blank" width="300" height="250"></video></p>',
      '<p><video src="about:blank" width="300" height="250"></video></p>'
    ));

    it('TINY-8687: remove align right from video element without styles', () => testAlignRight(
      '<p><video style="float: right;" src="about:blank" width="300" height="250"></video></p>',
      '<p><video src="about:blank" width="300" height="250"></video></p>'
    ));

    it('TINY-8687: removing alignment left from a video element with styles should retain the existing styles', () => testAlignLeft(
      '<p><video style="color: red; float: left;" src="about:blank" width="300" height="250"></video></p>',
      '<p><video style="color: red;" src="about:blank" width="300" height="250"></video></p>'
    ));
  });
});

