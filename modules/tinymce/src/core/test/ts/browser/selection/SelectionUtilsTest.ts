import { Assertions, Chain, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import * as SelectionUtils from 'tinymce/core/selection/SelectionUtils';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.selection.SelectionUtilsTest', (success, failure) => {
  const viewBlock = ViewBlock();

  const cSetHtml = (html) => {
    return Chain.op(() => {
      viewBlock.update(html);
    });
  };

  const cHasAllContentsSelected = (startPath, startOffset, endPath, endOffset) => {
    return Chain.mapper((viewBlock: any) => {
      const sc = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), startPath).getOrDie();
      const ec = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), endPath).getOrDie();
      const rng = document.createRange();

      rng.setStart(sc.dom, startOffset);
      rng.setEnd(ec.dom, endOffset);

      return SelectionUtils.hasAllContentsSelected(SugarElement.fromDom(viewBlock.get()), rng);
    });
  };

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('All text is selected in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>a</p>'),
      cHasAllContentsSelected([ 0, 0 ], 0, [ 0, 0 ], 1),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('All text is selected in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>ab</p>'),
      cHasAllContentsSelected([ 0, 0 ], 0, [ 0, 0 ], 2),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('All text is selected in paragraph and sub element', Chain.asStep(viewBlock, [
      cSetHtml('<p>a<b>b</b></p>'),
      cHasAllContentsSelected([ 0, 0 ], 0, [ 0, 1, 0 ], 1),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('All text is selected in paragraph and with traling br', Chain.asStep(viewBlock, [
      cSetHtml('<p>a<br></p>'),
      cHasAllContentsSelected([ 0, 0 ], 0, [ 0, 0 ], 1),
      Assertions.cAssertEq('Should be true since all contents is selected', true)
    ])),
    Logger.t('Collapsed range in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>a</p>'),
      cHasAllContentsSelected([ 0, 0 ], 0, [ 0, 0 ], 0),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ])),
    Logger.t('Partial text selection in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>ab</p>'),
      cHasAllContentsSelected([ 0, 0 ], 0, [ 0, 0 ], 1),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ])),
    Logger.t('Partial text selection in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>ab</p>'),
      cHasAllContentsSelected([ 0, 0 ], 1, [ 0, 0 ], 2),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ])),
    Logger.t('Partial mixed selection in paragraph', Chain.asStep(viewBlock, [
      cSetHtml('<p>a<b>bc</b></p>'),
      cHasAllContentsSelected([ 0, 0 ], 1, [ 0, 1, 0 ], 1),
      Assertions.cAssertEq('Should be false since only some contents is selected', false)
    ]))
  ], () => {
    viewBlock.detach();
    success();
  }, failure);
});
