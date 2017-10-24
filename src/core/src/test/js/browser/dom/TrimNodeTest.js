asynctest(
  'browser.tinymce.core.dom.TrimNodeTest',
  [
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.dom.TrimNode'
  ],
  function (Pipeline, RawAssertions, Step, document, DOMUtils, TrimNode) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var dom = new DOMUtils(document, {});

    var sTestTrim = function (inputHtml, expectedTrimmedHtml) {
      return Step.sync(function () {
        var elm = document.createElement('div');
        elm.innerHTML = inputHtml;
        TrimNode.trimNode(dom, elm.firstChild);

        var actual = elm.innerHTML;
        RawAssertions.assertEq('is correct trimmed html', expectedTrimmedHtml, actual);
      });
    };

    var sTestTrimDocumentNode = Step.sync(function () {
      var expected = document.implementation.createHTMLDocument('test');
      var actual = TrimNode.trimNode(dom, expected);

      RawAssertions.assertEq('Should return document as is', true, actual === expected);
    });

    Pipeline.async({}, [
      sTestTrim('<p><span></span>x</p>', '<p>x</p>'),
      sTestTrim('<p><span>x</span>&nbsp;</p>', '<p><span>x</span>&nbsp;</p>'),
      sTestTrim('<p><span>x</span>&nbsp;<span>x</span></p>', '<p><span>x</span>&nbsp;<span>x</span></p>'),
      sTestTrim('<p><span data-mce-type="bookmark"></span> y</p>', '<p><span data-mce-type="bookmark"></span> y</p>'),
      sTestTrim('<p>a <span>b <span data-mce-type="bookmark"></span> c</span></p>', '<p>a <span>b <span data-mce-type="bookmark"></span> c</span></p>'),
      sTestTrimDocumentNode
    ], function () {
      success();
    }, failure);
  }
);