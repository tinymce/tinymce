import { Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import * as TrimNode from 'tinymce/core/dom/TrimNode';

UnitTest.asynctest('browser.tinymce.core.dom.TrimNodeTest', function (success, failure) {

  const dom = DOMUtils(document, {});

  const sTestTrim = function (inputHtml: string, expectedTrimmedHtml: string) {
    return Step.sync(function () {
      const elm = document.createElement('div');
      elm.innerHTML = inputHtml;
      TrimNode.trimNode(dom, elm.firstChild);

      const actual = elm.innerHTML;
      Assert.eq('is correct trimmed html', expectedTrimmedHtml, actual);
    });
  };

  const sTestTrimDocumentNode = Step.sync(function () {
    const expected = document.implementation.createHTMLDocument('test');
    const actual = TrimNode.trimNode(dom, expected);

    Assert.eq('Should return document as is', true, actual === expected);
  });

  const sTestTrimFragmentedTextNode = Step.sync(() => {
    const emptyTextNode = document.createTextNode(' ');
    const elm = document.createElement('div');
    elm.innerHTML = '<strong>abc</strong>abc';
    elm.insertBefore(emptyTextNode, elm.lastChild);
    elm.insertBefore(emptyTextNode.cloneNode(), elm.firstChild);

    const actual = TrimNode.trimNode(dom, elm);

    Assert.eq('Empty text node shouldn\'t be trimmed', ' <strong>abc</strong> abc', actual.innerHTML);
  });

  Pipeline.async({}, [
    sTestTrim('<p><span></span>x</p>', '<p>x</p>'),
    sTestTrim('<p><span>x</span>&nbsp;</p>', '<p><span>x</span>&nbsp;</p>'),
    sTestTrim('<p><span>x</span>&nbsp;<span>x</span></p>', '<p><span>x</span>&nbsp;<span>x</span></p>'),
    sTestTrim('<p><span data-mce-type="bookmark"></span> y</p>', '<p><span data-mce-type="bookmark"></span> y</p>'),
    sTestTrim('<p>a <span>b <span data-mce-type="bookmark"></span> c</span></p>', '<p>a <span>b <span data-mce-type="bookmark"></span> c</span></p>'),
    sTestTrim('<p><strong><span>x</span>&nbsp;</strong></p>', '<p><strong><span>x</span>&nbsp;</strong></p>'),
    sTestTrim('<p><a id="anchor"></a><span>x</span></p>', '<p><a id="anchor"></a><span>x</span></p>'),
    sTestTrim('<p><br data-mce-bogus="1"></p>', '<p><br data-mce-bogus="1"></p>'),
    sTestTrim('<p><strong>x</strong> <em>y</em></p>', '<p><strong>x</strong> <em>y</em></p>'),
    sTestTrim('<pre><strong>x</strong>\n<em>y</em></pre>', '<pre><strong>x</strong>\n<em>y</em></pre>'),
    sTestTrimFragmentedTextNode,
    sTestTrimDocumentNode
  ], function () {
    success();
  }, failure);
});
