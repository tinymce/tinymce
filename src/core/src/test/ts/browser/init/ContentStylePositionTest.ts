import { Assertions } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { TinyLoader } from '@ephox/mcagar';
import { Compare } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Node } from '@ephox/sugar';
import ModernTheme from 'tinymce/themes/modern/Theme';
import { UnitTest } from '@ephox/refute';

UnitTest.asynctest('browser.tinymce.core.init.ContentStylePositionTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  ModernTheme();

  var contentStyle = '.class {color: blue;}';

  TinyLoader.setup(function (editor, onSuccess, onFailure) {

    Pipeline.async({}, [
      Step.sync(function () {
        var headStuff = editor.getDoc().head.querySelectorAll('link, style');
        var linkIndex = Arr.findIndex(headStuff, function (elm) {
          return Node.name(Element.fromDom(elm)) === 'link';
        }).getOrDie('could not find link elemnt');
        var styleIndex = Arr.findIndex(headStuff, function (elm) {
          return elm.innerText === contentStyle;
        }).getOrDie('could not find content style tag');

        Assertions.assertEq('style tag should be after link tag', linkIndex < styleIndex, true);
      })
    ], onSuccess, onFailure);
  }, {
    content_style: contentStyle,
    skin_url: '/project/src/skins/lightgray/dist/lightgray'
  }, success, failure);
});

