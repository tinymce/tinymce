import { Assertions, Chain, Log, NamedChain, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Editor as McEditor } from '@ephox/mcagar';
import { Attribute, Remove, SugarElement, Truncate } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorCleanupTest', (success, failure) => {
  Theme();
  VisualBlocksPlugin();

  const cAssertPageLinkPresence = (url: string, exists: boolean) => Chain.op(() => {
    const links = document.head.querySelectorAll(`link[href="${url}"]`);
    Assert.eq(`Should have link with url="${url}"`, exists, links.length > 0);
  });

  const cTestCleanup = (settings: RawEditorSettings, html: string = '<div></div>', additionalChains: Array<Chain<any, any>> = []) => NamedChain.asChain([
    // spin the editor up and down, getting a reference to its target element in between
    NamedChain.write('editor', McEditor.cFromHtml(html, { base_url: '/project/tinymce/js/tinymce', ...settings })),
    NamedChain.direct('editor', Chain.mapper((editor: Editor) => SugarElement.fromDom(editor.getElement())), 'element'),
    // Run any additional chains
    ...Arr.map(additionalChains, (chain) => NamedChain.read('editor', chain)),
    NamedChain.read('editor', Chain.op((editor: Editor) => editor.remove())),
    // first, remove the id of the element, as that's inserted from McEditor.cFromHtml and is out of our control
    NamedChain.read('element', Chain.op((element: SugarElement<HTMLDivElement>) => Attribute.remove(element, 'id'))),
    // assert that the html of the element is correct
    NamedChain.direct('element', Chain.mapper(Truncate.getHtml), 'raw-html'),
    NamedChain.read('raw-html', Assertions.cAssertHtml('all properties on the element should be cleaned up', html)),
    // remove the element
    NamedChain.read('element', Chain.op(Remove.remove))
  ]);

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-4001', 'Inline editor should clean up attributes', [
      cTestCleanup({ inline: true })
    ]),

    Log.chainsAsStep('TINY-4001', 'Iframe editor should clean up attributes', [
      cTestCleanup({ })
    ]),

    Log.chainsAsStep('TINY-4001', 'Editor should replace existing attributes on teardown', [
      cTestCleanup({ }, '<div classname="these are some classes"></div>'),
      cTestCleanup({ }, '<div style="position: absolute;"></div>'),
      cTestCleanup({ }, '<div data-someattribute="7"></div>'),
      cTestCleanup({ }, '<textarea name="foo"></textarea>')
    ]),

    Log.chainsAsStep('TINY-4001', 'Editor should clean up placeholder', [
      cTestCleanup({ placeholder: 'Some text' }),
      cTestCleanup({ placeholder: 'Some text' }, '<div placeholder="Testing"></div>')
    ]),

    Log.chainsAsStep('TINY-4001', 'Visual blocks plugin should not leave classes on target', [
      cTestCleanup({ plugins: 'visualblocks' })
    ]),

    Log.chainsAsStep('TINY-3926', 'Styles loaded via StyleSheetLoader or editor.dom.loadCss() are cleaned up', [
      cTestCleanup({ inline: true }, '<div></div>', [
        Chain.op<Editor>((editor) => editor.dom.loadCSS('/project/tinymce/js/tinymce/skins/ui/dark/skin.css'))
      ]),
      // Loaded via StyleSheetLoader
      cAssertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/content/default/content.inline.css', false),
      cAssertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/oxide/skin.css', false),
      // Loaded via DOMUtils as per above
      cAssertPageLinkPresence('/project/tinymce/js/tinymce/skins/ui/dark/skin.css', false)
    ])
  ], success, failure);
});
