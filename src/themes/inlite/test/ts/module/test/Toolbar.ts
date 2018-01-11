import { TinyDom } from '@ephox/mcagar';
import { Chain } from '@ephox/agar';
import { UiFinder } from '@ephox/agar';
import { Mouse } from '@ephox/agar';

const dialogRoot = TinyDom.fromDom(document.body);

const cWaitForToolbar = Chain.fromChainsWith(dialogRoot, [
  UiFinder.cWaitForState('Did not find inline toolbar', '.mce-tinymce-inline', function (elm) {
    return elm.dom().style.display === '';
  })
]);

const sWaitForToolbar = function () {
  return Chain.asStep({}, [
    cWaitForToolbar
  ]);
};

const cClickButton = function (ariaLabel) {
  return Chain.fromChains([
    UiFinder.cFindIn('div[aria-label="' + ariaLabel + '"]'),
    Mouse.cTrueClick
  ]);
};

const sClickButton = function (ariaLabel) {
  return Chain.asStep({}, [
    cWaitForToolbar,
    cClickButton(ariaLabel)
  ]);
};

export default {
  cWaitForToolbar,
  sWaitForToolbar,
  cClickButton,
  sClickButton
};