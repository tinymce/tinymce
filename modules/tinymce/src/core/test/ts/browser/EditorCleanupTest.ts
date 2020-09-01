import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Attribute, Remove, SugarElement, Truncate } from '@ephox/sugar';

import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

const assertPageLinkPresence = (url: string, exists: boolean): void => {
  const links = document.head.querySelectorAll(`link[href="${url}"]`);
  Assert.eq(`Should have link with url="${url}"`, exists, links.length > 0);
};

const testCleanup = async (comment: string, settings: RawEditorSettings, html: string = '<div></div>', fn: (editor) => void = Fun.noop) => {
  // spin the editor up and down, getting a reference to its target element in between
  const editor = await McEditor.pFromHtml(html, { base_url: '/project/tinymce/js/tinymce', ...settings });
  const element = SugarElement.fromDom(editor.getElement());
  // Run any additional chains
  fn(editor);
  editor.remove();
  // first, remove the id of the element, as that's inserted from McEditor.cFromHtml and is out of our control
  Attribute.remove(element, 'id');
  // assert that the html of the element is correct
  Assert.eq(comment + ' all properties on the element should be cleaned up', html, Truncate.getHtml(element))
  // remove the element
  Remove.remove(element);
};

UnitTest.promiseTest('browser.tinymce.core.EditorCleanupTest', async () => {
  Theme();
  VisualBlocksPlugin();

  await testCleanup('TINY-4001: Inline editor should clean up attributes', { inline: true });

  await testCleanup('TINY-4001: Iframe editor should clean up attributes', {});

  await testCleanup('TINY-4001: Editor should replace existing attributes on teardown: classname', {}, '<div classname="these are some classes"></div>');
  await testCleanup('TINY-4001: Editor should replace existing attributes on teardown: absolute', {}, '<div style="position: absolute;"></div>');
  await testCleanup('TINY-4001: Editor should replace existing attributes on teardown: data', {}, '<div data-someattribute="7"></div>');
  await testCleanup('TINY-4001: Editor should replace existing attributes on teardown: textarea', {}, '<textarea name="foo"></textarea>');

  await testCleanup('TINY-4001: Editor should clean up placeholder 1', { placeholder: 'Some text' });
  await testCleanup('TINY-4001: Editor should clean up placeholder 2', { placeholder: 'Some text' }, '<div placeholder="Testing"></div>')

  await testCleanup('TINY-4001: Visual blocks plugin should not leave classes on target', { plugins: 'visualblocks' })

  await testCleanup(
    'TINY-3926: Styles loaded via StyleSheetLoader or editor.dom.loadCss() are cleaned up',
    { inline: true },
    '<div></div>',
    (editor) => {
      editor.dom.loadCSS('/project/tinymce/js/tinymce/skins/ui/dark/skin.css')
  });

  // Loaded via StyleSheetLoader
  assertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/content/default/content.inline.css', false);
  assertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/oxide/skin.css', false);
  // Loaded via DOMUtils as per above
  assertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/dark/skin.css', false);
});
