import { Pipeline, RawAssertions, Step } from '@ephox/agar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import TrimNode from 'tinymce/core/dom/TrimNode';
import { UnitTest } from '@ephox/bedrock';
import { document } from '@ephox/dom-globals';

UnitTest.asynctest('browser.tinymce.core.dom.TrimNodeTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  const dom = DOMUtils(document, {});

  const sTestTrim = function (inputHtml, expectedTrimmedHtml) {
    return Step.sync(function () {
      const elm = document.createElement('div');
      elm.innerHTML = inputHtml;
      TrimNode.trimNode(dom, elm.firstChild);

      const actual = elm.innerHTML;
      RawAssertions.assertEq('is correct trimmed html', expectedTrimmedHtml, actual);
    });
  };

  const sTestTrimDocumentNode = Step.sync(function () {
    const expected = document.implementation.createHTMLDocument('test');
    const actual = TrimNode.trimNode(dom, expected);

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
});
