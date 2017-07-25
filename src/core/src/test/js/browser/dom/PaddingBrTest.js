asynctest(
  'browser.tinymce.core.dom.PaddingBrTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Html',
    'tinymce.core.dom.Empty',
    'tinymce.core.dom.PaddingBr'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Element, Html, Empty, PaddingBr) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var sTestRemoveTrailingBr = function (label, inputHtml, expectedHtml) {
      return Step.sync(function () {
        var elm = Element.fromHtml(inputHtml);
        PaddingBr.removeTrailingBr(elm);
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
          var elm = Element.fromHtml('<p>a</p>');
          PaddingBr.fillWithPaddingBr(elm);
          Assertions.assertHtml('Should be padded with bogus br', '<p><br data-mce-bogus="1"></p>', Html.getOuter(elm));
        })
      ]))
    ], function () {
      success();
    }, failure);
  }
);
