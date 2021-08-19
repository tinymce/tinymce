import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { LegacyUnit } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import * as Dimensions from 'tinymce/core/dom/Dimensions';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.dom.DimensionsTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const setupHtml = (html: string) => {
    viewBlock.update(html);
    return viewBlock.get();
  };

  it('getClientRects', () => {
    const viewElm = setupHtml('abc<span>123</span>');

    assert.lengthOf(Dimensions.getClientRects([ viewElm.firstChild ]), 1);
    assert.lengthOf(Dimensions.getClientRects([ viewElm.lastChild ]), 1);
    LegacyUnit.equalDom(Dimensions.getClientRects([ viewElm.firstChild ])[0].node, viewElm.firstChild);
    assert.isAbove(Dimensions.getClientRects([ viewElm.firstChild ])[0].left, 3);
    assert.isAbove(Dimensions.getClientRects([ viewElm.lastChild ])[0].left, 3);
  });

  it('getClientRects from array', () => {
    const viewElm = setupHtml('<b>a</b><b>b</b>');
    const clientRects = Dimensions.getClientRects(Arr.from(viewElm.childNodes));

    assert.lengthOf(clientRects, 2);
    LegacyUnit.equalDom(clientRects[0].node, viewElm.childNodes[0]);
    LegacyUnit.equalDom(clientRects[1].node, viewElm.childNodes[1]);
  });
});
