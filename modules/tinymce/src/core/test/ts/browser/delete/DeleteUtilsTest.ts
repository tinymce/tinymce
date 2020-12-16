import { Assertions, Chain, GeneralSteps, Logger, Pipeline } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { Hierarchy, SugarElement } from '@ephox/sugar';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as DeleteUtils from 'tinymce/core/delete/DeleteUtils';
import ViewBlock from '../../module/test/ViewBlock';

UnitTest.asynctest('browser.tinymce.core.delete.DeleteUtilsTest', (success, failure) => {
  const viewBlock = ViewBlock();

  const cSetHtml = (html) => {
    return Chain.op(() => {
      viewBlock.update(html);
    });
  };

  const cGetParentTextBlock = (elementPath) => {
    return Chain.mapper((viewBlock: any) => {
      const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
      return DeleteUtils.getParentBlock(SugarElement.fromDom(viewBlock.get()), element);
    });
  };

  const cAssertBlock = (elementPath) => {
    return Chain.op((actualBlock: Optional<any>) => {
      const expectedBlock = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
      Assertions.assertDomEq('Should be the expected block element', expectedBlock, actualBlock.getOrDie());
    });
  };

  const cWillDeleteLastPositionInElement = (forward, caretPath, caretOffset, elementPath) => {
    return Chain.injectThunked(() => {
      const element = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), elementPath).getOrDie();
      const caretNode = Hierarchy.follow(SugarElement.fromDom(viewBlock.get()), caretPath).getOrDie();

      return DeleteUtils.willDeleteLastPositionInElement(forward, CaretPosition(caretNode.dom, caretOffset), element.dom);
    });
  };

  const cAssertNone = Chain.op((actualBlock: Optional<any>) => {
    Assertions.assertEq('Should be the none but got some', true, actualBlock.isNone());
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('getParentTextBlock', GeneralSteps.sequence([
      Logger.t('Should be the paragraph block', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cGetParentTextBlock([ 0, 0 ]),
        cAssertBlock([ 0 ])
      ])),
      Logger.t('Should be the paragraph block inside the div', Chain.asStep(viewBlock, [
        cSetHtml('<div><p>a</p></div>'),
        cGetParentTextBlock([ 0, 0, 0 ]),
        cAssertBlock([ 0, 0 ])
      ])),
      Logger.t('Should be none in inline elements', Chain.asStep(viewBlock, [
        cSetHtml('<span>a</span>'),
        cGetParentTextBlock([ 0, 0 ]),
        cAssertNone
      ])),
      Logger.t('Should be none text nodes', Chain.asStep(viewBlock, [
        cSetHtml('a'),
        cGetParentTextBlock([ 0 ]),
        cAssertNone
      ])),
      Logger.t('Should be none on root element', Chain.asStep(viewBlock, [
        cSetHtml(''),
        cGetParentTextBlock([]),
        cAssertNone
      ])),
      Logger.t('Will delete last position', GeneralSteps.sequence([
        Logger.t('Should delete element since caret is before last character', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cWillDeleteLastPositionInElement(true, [ 0, 0 ], 0, [ 0 ]),
          Assertions.cAssertEq('Should be true', true)
        ])),
        Logger.t('Should delete element since caret is after last character', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cWillDeleteLastPositionInElement(false, [ 0, 0 ], 1, [ 0 ]),
          Assertions.cAssertEq('Should be true', true)
        ])),
        Logger.t('Should not delete element since caret is after last character', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cWillDeleteLastPositionInElement(true, [ 0, 0 ], 1, [ 0 ]),
          Assertions.cAssertEq('Should be false', false)
        ])),
        Logger.t('Should not delete element since caret is before last character', Chain.asStep(viewBlock, [
          cSetHtml('<p>a</p>'),
          cWillDeleteLastPositionInElement(false, [ 0, 0 ], 0, [ 0 ]),
          Assertions.cAssertEq('Should be false', false)
        ])),
        Logger.t('Should not delete element since caret is not before last character', Chain.asStep(viewBlock, [
          cSetHtml('<p>ab</p>'),
          cWillDeleteLastPositionInElement(true, [ 0, 0 ], 1, [ 0 ]),
          Assertions.cAssertEq('Should be false', false)
        ])),
        Logger.t('Should not delete element since caret is not after last character', Chain.asStep(viewBlock, [
          cSetHtml('<p>ab</p>'),
          cWillDeleteLastPositionInElement(false, [ 0, 0 ], 1, [ 0 ]),
          Assertions.cAssertEq('Should be false', false)
        ])),
        Logger.t('Should delete element since the element is empty', Chain.asStep(viewBlock, [
          cSetHtml('<p></p>'),
          cWillDeleteLastPositionInElement(true, [ 0 ], 0, [ 0 ]),
          Assertions.cAssertEq('Should be false', true)
        ])),
        Logger.t('Should delete element since the element is empty', Chain.asStep(viewBlock, [
          cSetHtml('<p></p>'),
          cWillDeleteLastPositionInElement(false, [ 0 ], 0, [ 0 ]),
          Assertions.cAssertEq('Should be false', true)
        ]))
      ]))
    ]))
  ], () => {
    viewBlock.detach();
    success();
  }, failure);
});
