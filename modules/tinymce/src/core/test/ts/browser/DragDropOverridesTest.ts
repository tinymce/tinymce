import { Assertions, Chain, DragnDrop, GeneralSteps, Log, Logger, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Blob, document, File } from '@ephox/dom-globals';
import { Cell } from '@ephox/katamari';
import { ApiChains, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Body, Element, Hierarchy, Node } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.DragDropOverridesTest', (success, failure) => {
  Theme();

  const createFile = (name: string, lastModified: number, blob: Blob): File => {
    const newBlob: any = new Blob([ blob ], { type: blob.type });

    newBlob.name = name;
    newBlob.lastModified = lastModified;

    return Object.freeze(newBlob);
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const fired = Cell(false);

    editor.on('dragend', () => {
      fired.set(true);
    });

    Pipeline.async({}, [
      Logger.t('drop draggable element outside of editor', GeneralSteps.sequence([
        tinyApis.sSetContent('<p contenteditable="false">a</p>'),
        Step.sync(() => {
          const target = Hierarchy.follow(Element.fromDom(editor.getBody()), [ 0 ]).filter(Node.isElement).getOrDie().dom();
          const rect = target.getBoundingClientRect();
          const button = 0, screenX = (rect.left + rect.width / 2), screenY = (rect.top + rect.height / 2);

          editor.fire('mousedown', { button, screenX, screenY, target });
          editor.fire('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, target });
          editor.dom.fire(document.body, 'mouseup');

          Assertions.assertEq('Should fire dragend event', true, fired.get());
        })
      ])),
      Log.chainsAsStep('TINY-6027', 'Drag unsupported file into the editor/UI is prevented', [
        Chain.inject(editor),
        ApiChains.cSetContent('<p>Content</p>'),
        Chain.fromIsolatedChainsWith(Element.fromDom(editor.getBody()), [
          DragnDrop.cDropFiles([
            createFile('test.txt', 123, new Blob([ 'content' ], { type: 'text/plain' }))
          ]),
          DragnDrop.cDropItems([
            { data: 'Some content', type: 'text/plain' }
          ], false)
        ]),
        Chain.fromIsolatedChainsWith(Body.body(), [
          UiFinder.cFindIn('.tox-toolbar__primary'),
          DragnDrop.cDropFiles([
            createFile('test.js', 123, new Blob([ 'var a = "content";' ], { type: 'application/javascript' }))
          ])
        ])
      ])
    ], onSuccess, onFailure);
  }, {
    indent: false,
    menubar: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
