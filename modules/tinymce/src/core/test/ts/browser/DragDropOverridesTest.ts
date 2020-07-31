import { Assertions, Chain, DragnDrop, GeneralSteps, Log, Logger, Mouse, Pipeline, Step, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Cell } from '@ephox/katamari';
import { ApiChains, TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, SugarBody, SugarElement, SugarNode } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.DragDropOverridesTest', (success, failure) => {
  Theme();

  const createFile = (name: string, lastModified: number, blob: Blob): File => {
    const newBlob: any = new Blob([ blob ], { type: blob.type });

    newBlob.name = name;
    newBlob.lastModified = lastModified;

    return Object.freeze(newBlob);
  };

  const cAssertNotification = (message: string) => Chain.fromIsolatedChainsWith(SugarBody.body(), [
    UiFinder.cWaitForVisible('Wait for notification to appear', '.tox-notification'),
    Assertions.cAssertPresence('Verify message content', {
      ['.tox-notification__body:contains(' + message + ')']: 1
    }),
    Mouse.cClickOn('.tox-notification__dismiss')
  ]);

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
          const target = Hierarchy.follow(SugarElement.fromDom(editor.getBody()), [ 0 ]).filter(SugarNode.isElement).getOrDie().dom;
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
        Chain.wait(100), // Wait a small amount of time to ensure the events have been bound
        ApiChains.cSetContent('<p>Content</p>'),
        Chain.fromIsolatedChainsWith(SugarElement.fromDom(editor.getBody()), [
          DragnDrop.cDropFiles([
            createFile('test.txt', 123, new Blob([ 'content' ], { type: 'text/plain' }))
          ]),
          cAssertNotification('Dropped file type is not supported'),
          DragnDrop.cDropItems([
            { data: 'Some content', type: 'text/plain' }
          ], false)
        ]),
        Chain.fromIsolatedChainsWith(SugarBody.body(), [
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
