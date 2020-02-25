import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Element, Html } from '@ephox/sugar';
import * as PaddingBr from 'tinymce/core/dom/PaddingBr';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.asynctest('browser.tinymce.core.dom.PaddingBrTest', function (success, failure) {

  const sTestRemoveTrailingBr = function (label, inputHtml, expectedHtml) {
    return Step.sync(function () {
      const elm = Element.fromHtml(inputHtml);
      PaddingBr.removeTrailingBr(elm);
      Assertions.assertHtml(label, expectedHtml, Html.getOuter(elm));
    });
  };

  const sTestTrimBlockTrailingBr = function (label, inputHtml, expectedHtml) {
    return Step.sync(function () {
      const elm = Element.fromHtml(inputHtml);
      PaddingBr.trimBlockTrailingBr(elm);
      Assertions.assertHtml(label, expectedHtml, Html.getOuter(elm));
    });
  };

  Pipeline.async({}, [
    Logger.t('removeTrailingBrs', GeneralSteps.sequence([
      sTestRemoveTrailingBr('Should be untouched since it has no brs', '<p>a</p>', '<p>a</p>'),
      sTestRemoveTrailingBr('Should be untouched since the br not at the edge of the tree', '<p>a<br>b</p>', '<p>a<br>b</p>'),
      sTestRemoveTrailingBr('Should be untouched since the br not at the edge of the tree', '<p><b>a<br></b>b</p>', '<p><b>a<br></b>b</p>'),
      sTestRemoveTrailingBr('Should remove trailing br 1', '<p>a<br></p>', '<p>a</p>'),
      sTestRemoveTrailingBr('Should remove trailing br 2', '<p><b>a<br></b></p>', '<p><b>a</b></p>'),
      sTestRemoveTrailingBr('Should remove trailing br 3', '<p><i><b>a<br></b></i></p>', '<p><i><b>a</b></i></p>'),
      sTestRemoveTrailingBr('Should remove trailing br 4', '<p><b>a</b><br></p>', '<p><b>a</b></p>'),
      sTestRemoveTrailingBr('Should be untouched since there is more than one br', '<p>a<br><br></p>', '<p>a<br><br></p>'),
      sTestRemoveTrailingBr('Should be untouched since there is more than one br', '<p><b>a<br></b><br></p>', '<p><b>a<br></b><br></p>')
    ])),
    Logger.t('fillWithPaddingBr', GeneralSteps.sequence([
      Step.sync(function () {
        const elm = Element.fromHtml('<p>a</p>');
        PaddingBr.fillWithPaddingBr(elm);
        Assertions.assertHtml('Should be padded with bogus br', '<p><br data-mce-bogus="1"></p>', Html.getOuter(elm));
      })
    ])),
    Logger.t('isPaddedElement', Step.sync(function () {
      Assertions.assertEq('Should not be padded', false, PaddingBr.isPaddedElement(Element.fromHtml('<p>a</p>')));
      Assertions.assertEq('Should not be padded', false, PaddingBr.isPaddedElement(Element.fromHtml('<p>\u00a0\u00a0</p>')));
      Assertions.assertEq('Should not be padded', false, PaddingBr.isPaddedElement(Element.fromHtml('<p><br><br></p>')));
      Assertions.assertEq('Should not be padded', false, PaddingBr.isPaddedElement(Element.fromHtml('<p></p>')));
      Assertions.assertEq('Should be padded nbsp', true, PaddingBr.isPaddedElement(Element.fromHtml('<p>\u00a0</p>')));
      Assertions.assertEq('Should be padded br', true, PaddingBr.isPaddedElement(Element.fromHtml('<p><br></p>')));
    })),
    Logger.t('trimPaddingBrs', GeneralSteps.sequence([
      sTestTrimBlockTrailingBr('Should be untouched since it has no brs', '<div></div>', '<div></div>'),
      sTestTrimBlockTrailingBr('Should be untouched since it has no brs', '<div><p>a</p></div>', '<div><p>a</p></div>'),
      sTestTrimBlockTrailingBr('Should be without br since it is after a block', '<div><p>a</p><br></div>', '<div><p>a</p></div>'),
      sTestTrimBlockTrailingBr('Should be untouched since it is multiple brs', '<div><p>a</p><br><br></div>', '<div><p>a</p><br><br></div>'),
      sTestTrimBlockTrailingBr('Should be untouched since it is br after a inline', '<div><b>a</b><br></div>', '<div><b>a</b><br></div>'),
      sTestTrimBlockTrailingBr('Should be untouched since it is br after inlide inline', '<span><b>a</b><br></span>', '<span><b>a</b><br></span>')
    ]))
  ], function () {
    success();
  }, failure);
});
