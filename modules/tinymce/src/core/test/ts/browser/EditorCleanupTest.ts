import { Assertions, Chain, Log, NamedChain, Pipeline } from '@ephox/agar';
import { Editor as McEditor } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock-client';
import { Attr, Element, Remove, Truncate } from '@ephox/sugar';
import { HTMLDivElement } from '@ephox/dom-globals';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';
import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';

UnitTest.asynctest('browser.tinymce.core.EditorCleanupTest', (success, failure) => {
  Theme();
  VisualBlocksPlugin();

  const cTestCleanup = (settings: RawEditorSettings, html: string = '<div></div>') => NamedChain.asChain([
    // spin the editor up and down, getting a reference to its target element inbetween
    NamedChain.write('editor', McEditor.cFromHtml(html, { base_url: '/project/tinymce/js/tinymce', ...settings })),
    NamedChain.direct('editor', Chain.mapper((editor: Editor) => Element.fromDom(editor.getElement())), 'element'),
    NamedChain.read('editor', Chain.op((editor: Editor) => editor.remove())),
    // first, remove the id of the element, as that's inserted from McEditor.cFromHtml and is out of our control
    NamedChain.read('element', Chain.op((element: Element<HTMLDivElement>) => Attr.remove(element, 'id'))),
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
    ])
  ], success, failure);
});
