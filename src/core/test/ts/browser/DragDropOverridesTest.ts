import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.DragDropOverridesTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Theme();

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Drop draggable element outside of editor', GeneralSteps.sequence([
        tinyApis.sSetContent('<p contenteditable="false">a</p>'),
        Step.sync(function () {
          let fired = false;
          editor.on('dragend', function () {
            fired = true;
          });
          const target = Hierarchy.follow(Element.fromDom(editor.getBody()), [0]).getOrDie().dom();
          const rect = target.getBoundingClientRect();
          const button = 0, screenX = (rect.left + rect.width / 2), screenY = (rect.top + rect.height / 2);
          editor.fire('mousedown', { button, screenX, screenY, target });
          editor.fire('mousemove', { button, screenX: screenX + 20, screenY: screenY + 20, target });
          editor.dom.fire(document.body, 'mouseup');
          Assertions.assertEq('Should fire dragend event', true, fired);
        })
      ])),
    ], onSuccess, onFailure);
  }, {
    indent: false,
    skin_url: '/project/js/tinymce/skins/lightgray'
  }, success, failure);
});
