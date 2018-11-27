import { LegacyUnit } from '@ephox/mcagar';
import { Pipeline } from '@ephox/agar';
import * as Dimensions from 'tinymce/core/dom/Dimensions';
import ViewBlock from '../../module/test/ViewBlock';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.core.dom.DimensionsTest', (success, failure) => {
  const suite = LegacyUnit.createSuite();
  const viewBlock = ViewBlock();

  const setupHtml = function (html) {
    viewBlock.update(html);
    return viewBlock.get();
  };

  suite.test('getClientRects', function () {
    const viewElm = setupHtml('abc<span>123</span>');

    LegacyUnit.strictEqual(Dimensions.getClientRects([viewElm.firstChild]).length, 1);
    LegacyUnit.strictEqual(Dimensions.getClientRects([viewElm.lastChild]).length, 1);
    LegacyUnit.equalDom(Dimensions.getClientRects([viewElm.firstChild])[0].node, viewElm.firstChild);
    LegacyUnit.strictEqual(Dimensions.getClientRects([viewElm.firstChild])[0].left > 3, true);
    LegacyUnit.strictEqual(Dimensions.getClientRects([viewElm.lastChild])[0].left > 3, true);
  });

  suite.test('getClientRects from array', function () {
    const viewElm = setupHtml('<b>a</b><b>b</b>');
    const clientRects = Dimensions.getClientRects(Arr.from(viewElm.childNodes));

    LegacyUnit.strictEqual(clientRects.length, 2);
    LegacyUnit.equalDom(clientRects[0].node, viewElm.childNodes[0]);
    LegacyUnit.equalDom(clientRects[1].node, viewElm.childNodes[1]);
  });

  viewBlock.attach();
  Pipeline.async({}, suite.toSteps({}), function () {
    viewBlock.detach();
    success();
  }, failure);
});
