import { GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { Hierarchy, Element } from '@ephox/sugar';
import Theme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.dom.ControlSelectionTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

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
        tinyApis.sFocus,
        tinyApis.sSetContent('<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAAAAACH5BAAAAAAALAAAAAABAAEAAAICTAEAOw==" width="100" height="100"></p>'),
        sContextMenuClickInMiddleOf(editor, [0, 0]),
        tinyApis.sAssertSelection([0], 0, [0], 1)
      ]))
    ], onSuccess, onFailure);
  }, {
    add_unload_trigger: false,
    skin_url: '/project/js/tinymce/skins/lightgray',
    content_style: 'body.mce-content-body  { margin: 0 }'
  }, success, failure);
});
