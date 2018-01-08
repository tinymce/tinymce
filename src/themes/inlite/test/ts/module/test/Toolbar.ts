import { TinyDom } from '@ephox/mcagar';
import { Chain } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Mouse } from '@ephox/agar';

var dialogRoot = TinyDom.fromDom(document.body);

var cWaitForToolbar = Chain.fromChainsWith(dialogRoot, [
  UiFinder.cWaitForState('Did not find inline toolbar', '.mce-tinymce-inline', function (elm) {
    return elm.dom().style.display === "";
  })
]);

var sWaitForToolbar = function () {
  return Chain.asStep({}, [
    cWaitForToolbar
  ]);
};

var cClickButton = function (ariaLabel) {
  return Chain.fromChains([
    UiFinder.cFindIn('div[aria-label="' + ariaLabel + '"]'),
    Mouse.cTrueClick
  ]);
};

var sClickButton = function (ariaLabel) {
  return Chain.asStep({}, [
    cWaitForToolbar,
    cClickButton(ariaLabel)
  ]);
};

export default <any> {
  cWaitForToolbar: cWaitForToolbar,
  sWaitForToolbar: sWaitForToolbar,
  cClickButton: cClickButton,
  sClickButton: sClickButton
};