import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/silver/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.dom.ControlSelectionTest', function (success, failure) {
  // TODO FIXME DISABLED-TEST TINY-2786
  // Disable reason: Context menu is not popuplated, works in normal tinymce
  success();
  return;

  Theme();

  const sContextMenuClickInMiddleOf = function (editor, elementPath) {
    return Step.sync(function () {
      const element = Hierarchy.follow(Element.fromDom(editor.getBody()), elementPath).getOrDie().dom();
      const rect = element.getBoundingClientRect();
      const clientX = (rect.left + rect.width / 2), clientY = (rect.top + rect.height / 2);
      editor.fire('mousedown', { target: element, clientX, clientY, button: 2 });
      editor.fire('mouseup', { target: element, clientX, clientY, button: 2 });
      editor.fire('contextmenu', { target: element, clientX, clientY });
    });
  };

  TinyLoader.setup(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Logger.t('Select image by context menu clicking on it', GeneralSteps.sequence([
        Step.wait(1000),
        Step.label('Focus editor', tinyApis.sFocus),
        Step.wait(1000),
        Step.label('Set editor content to a paragraph with a image within', tinyApis.sSetContent('<p><img src="http://www.google.com/google.jpg" width="100" height="100"></p>')),
        Step.wait(3000),
        Step.label('Context menu click on the image', sContextMenuClickInMiddleOf(editor, [0, 0])),
        Step.wait(1000),
        Step.label('Check that the image is selected', tinyApis.sAssertSelection([0], 0, [0], 1)),
        Step.wait(1000)
      ]))
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    base_url: '/project/js/tinymce',
    content_style: 'body.mce-content-body  { margin: 0 }'
  }, success, failure);
});
