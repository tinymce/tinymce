import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Cell } from '@ephox/katamari';
import { Hierarchy, Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';
import { document, HTMLElement } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.DragDropOverridesTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    const fired = Cell(false);

    editor.on('dragend', function () {
      fired.set(true);
    });

    Pipeline.async({}, [
      Logger.t('drop draggable element outside of editor', GeneralSteps.sequence([
        tinyApis.sSetContent('<p contenteditable="false">a</p>'),
        Step.sync(() => {
          const target = Hierarchy.follow(Element.fromDom(editor.getBody()), [0]).getOrDie().dom() as HTMLElement;
          const rect = target.getBoundingClientRect();
          const button = 0, screenX = (rect.left + rect.width / 2), screenY = (rect.top + rect.height / 2);

          editor.fire('mousedown', { button, screenX, screenY, target });
          editor.fire('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, target });
          editor.dom.fire(document.body, 'mouseup');

          Assertions.assertEq('Should fire dragend event', true, fired.get());
        })
      ])),
    ], onSuccess, onFailure);
  }, {
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
