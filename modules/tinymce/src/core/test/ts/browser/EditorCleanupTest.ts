import { Assertions, Chain, Log, NamedChain, Pipeline } from '@ephox/agar';
import { Editor as McEditor } from '@ephox/mcagar';
import { UnitTest } from '@ephox/bedrock-client';
import { Attr, Element, Truncate } from '@ephox/sugar';
import { HTMLDivElement } from '@ephox/dom-globals';

import Editor from 'tinymce/core/api/Editor';
import { RawEditorSettings } from 'tinymce/core/api/SettingsTypes';
import Theme from 'tinymce/themes/silver/Theme';
import VisualBlocksPlugin from 'tinymce/plugins/visualblocks/Plugin';

UnitTest.asynctest('browser.tinymce.core.EditorCleanupTest', (success, failure) => {
  Theme();
  VisualBlocksPlugin();

  const base_url = '/project/tinymce/js/tinymce';

  const cTestCleanup = (settings: RawEditorSettings, html: string = '<div></div>') => NamedChain.asChain([
    NamedChain.direct(NamedChain.inputName(), McEditor.cFromHtml(html, settings), 'editor'),
    NamedChain.direct('editor', Chain.mapper((editor: Editor) => Element.fromDom(editor.getElement())), 'element'),
    NamedChain.read('editor', Chain.op((editor: Editor) => editor.remove())),
    // first, remove the id of the element, as that's inserted from McEditor.cFromHtml and is out of our control
    NamedChain.read('element', Chain.op((element: Element<HTMLDivElement>) => Attr.remove(element, 'id'))),
    NamedChain.direct('element', Chain.mapper(Truncate.getHtml), 'raw-html'),
    NamedChain.read('raw-html', Assertions.cAssertHtml('all properties on the element should be cleaned up', html)),
    NamedChain.read('editor', McEditor.cRemove)
  ]);

  Pipeline.async({}, [
    Log.chainsAsStep('TINY-4001', 'Inline editor should clean up attributes', [
      cTestCleanup({ base_url, inline: true })
    ]),

    Log.chainsAsStep('TINY-4001', 'Iframe editor should clean up attributes', [
      cTestCleanup({ base_url })
    ]),

    Log.chainsAsStep('TINY-4001', 'Editor should clean up placeholder', [
      cTestCleanup({ base_url, placeholder: 'Some text' }),
      cTestCleanup({ base_url, placeholder: 'Some text' }, '<div placeholder="Testing"></div>')
    ]),

    Log.chainsAsStep('TINY-4001', 'Visual blocks plugin should not leave classes on target', [
      cTestCleanup({ base_url, plugins: 'visualblocks' })
    ])
  ], success, failure);
});
