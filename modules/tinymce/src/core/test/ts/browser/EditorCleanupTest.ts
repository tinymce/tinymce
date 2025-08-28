import { before, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Attribute, Remove, Truncate } from '@ephox/sugar';
import { McEditor, TinyDom } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorOptions } from 'tinymce/core/api/OptionTypes';
import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';

describe('browser.tinymce.core.EditorCleanupTest', () => {
  before(() => {
    VisualBlocksPlugin();
  });

  const assertPageLinkPresence = (url: string, exists: boolean): void => {
    const links = document.head.querySelectorAll(`link[href="${url}"]`);
    assert.equal(links.length > 0, exists, `Should have link with url="${url}"`);
  };

  const testCleanup = (comment: string, settings: RawEditorOptions, html: string = '<div></div>', fn: (editor: Editor) => void = Fun.noop) => {
    it(comment, async () => {
      // spin the editor up and down, getting a reference to its target element in between
      const editor = await McEditor.pFromHtml<Editor>(html, { base_url: '/project/tinymce/js/tinymce', ...settings });
      const element = TinyDom.targetElement(editor);
      // Run any additional chains
      fn(editor);
      editor.remove();
      // first, remove the id of the element, as that's inserted from McEditor.cFromHtml and is out of our control
      Attribute.remove(element, 'id');
      // assert that the html of the element is correct
      assert.equal(Truncate.getHtml(element), html, comment + ' all properties on the element should be cleaned up');
      // remove the element
      Remove.remove(element);
    });
  };

  testCleanup('TINY-4001: Inline editor should clean up attributes', { inline: true });

  testCleanup('TINY-4001: Iframe editor should clean up attributes', {});

  testCleanup('TINY-4001: Editor should replace existing attributes on teardown: classname', {}, '<div classname="these are some classes"></div>');
  testCleanup('TINY-4001: Editor should replace existing attributes on teardown: absolute', {}, '<div style="position: absolute;"></div>');
  testCleanup('TINY-4001: Editor should replace existing attributes on teardown: data', {}, '<div data-someattribute="7"></div>');
  testCleanup('TINY-4001: Editor should replace existing attributes on teardown: textarea', {}, '<textarea name="foo"></textarea>');

  testCleanup('TINY-4001: Editor should clean up placeholder 1', { placeholder: 'Some text' });
  testCleanup('TINY-4001: Editor should clean up placeholder 2', { placeholder: 'Some text' }, '<div placeholder="Testing"></div>');

  testCleanup('TINY-4001: Visual blocks plugin should not leave classes on target', { plugins: 'visualblocks' });

  testCleanup(
    'TINY-3926: Styles loaded via StyleSheetLoader or editor.dom.loadCss() are cleaned up',
    { inline: true },
    '<div></div>',
    (editor) => {
      editor.dom.loadCSS('/project/tinymce/js/tinymce/skins/ui/dark/skin.css');
    });

  // Loaded via StyleSheetLoader
  assertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/content/default/content.inline.css', false);
  assertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/oxide/skin.css', false);
  // Loaded via DOMUtils as per above
  assertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/dark/skin.css', false);
});
