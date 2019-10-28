import { Assertions, Chain, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Hierarchy, Element } from '@ephox/sugar';
import DOMUtils from 'tinymce/core/api/dom/DOMUtils';
import NormalizeRange from 'tinymce/core/selection/NormalizeRange';
import ViewBlock from '../../module/test/ViewBlock';
import Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock-client';
import { document } from '@ephox/dom-globals';
import { Option } from '@ephox/katamari';

UnitTest.asynctest('browser.tinymce.core.selection.NormalizeRangeTest', function (success, failure) {
  const viewBlock = ViewBlock();

  const assertRange = function (root, range, startPath, startOffset, endPath, endOffset) {
    const sc = Hierarchy.follow(Element.fromDom(root), startPath).getOrDie();
    const ec = Hierarchy.follow(Element.fromDom(root), endPath).getOrDie();
    const actualRange = range.getOrDie('Should be some');

    Assertions.assertDomEq('Should be expected start container', sc, Element.fromDom(actualRange.startContainer));
    Assertions.assertEq('Should be expected start offset', startOffset, actualRange.startOffset);
    Assertions.assertDomEq('Should be expected end container', ec, Element.fromDom(actualRange.endContainer));
    Assertions.assertEq('Should be expected end offset', endOffset, actualRange.endOffset);
  };

  const cSetHtml = function (html) {
    return Chain.op(function () {
      viewBlock.update(html);
    });
  };

  const cNormalizeRange = function (startPath, startOffset, endPath, endOffset) {
    return Chain.mapper(function (viewBlock: any) {
      const sc = Hierarchy.follow(Element.fromDom(viewBlock.get()), startPath).getOrDie();
      const ec = Hierarchy.follow(Element.fromDom(viewBlock.get()), endPath).getOrDie();
      const rng = document.createRange();

      rng.setStart(sc.dom(), startOffset);
      rng.setEnd(ec.dom(), endOffset);

      return NormalizeRange.normalize(DOMUtils(document, { root_element: viewBlock.get() }), rng);
    });
  };

  const cAssertRange = function (startPath, startOffset, endPath, endOffset) {
    return Chain.op(function (range) {
      assertRange(viewBlock.get(), range, startPath, startOffset, endPath, endOffset);
    });
  };

  const cAssertRangeNone = Chain.op(function (range: Option<any>) {
    Assertions.assertEq('Should be none', true, range.isNone());
  });

  viewBlock.attach();
  Pipeline.async({}, [
    Logger.t('Non normalize non collapsed selections', GeneralSteps.sequence([
      Logger.t('Should not normalize on indexed selected at root level', Chain.asStep(viewBlock, [
        cSetHtml('<input>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize if selection is around a caret container', Chain.asStep(viewBlock, [
        cSetHtml('<p data-mce-caret="before">b</p>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize if selection ends after table', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><table><tr><td>b</td></tr></table>'),
        cNormalizeRange([0, 0], 0, [], 2),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into pre', Chain.asStep(viewBlock, [
        cSetHtml('<pre>a</pre>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into code', Chain.asStep(viewBlock, [
        cSetHtml('<code>a</code>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize to before/after table', Chain.asStep(viewBlock, [
        cSetHtml('<table><tr><td>a</td></tr></table>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRangeNone
      ]))
    ])),

    Logger.t('Non normalize caret positions', GeneralSteps.sequence([
      Logger.t('Should not normalize on a caret at start of text node', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cNormalizeRange([0, 0], 0, [0, 0], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret at middle of text node', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cNormalizeRange([0, 0], 1, [0, 0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret at end of text node', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cNormalizeRange([0, 0], 1, [0, 0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret before input', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p>'),
        cNormalizeRange([0], 0, [0], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret between inputs', Chain.asStep(viewBlock, [
        cSetHtml('<p><input><input></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret after input', Chain.asStep(viewBlock, [
        cSetHtml('<p><input></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret after image', Chain.asStep(viewBlock, [
        cSetHtml('<p><img src="about: blank"></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize on a caret before image', Chain.asStep(viewBlock, [
        cSetHtml('<p><img src="about: blank"></p>'),
        cNormalizeRange([0], 0, [0], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize before br', Chain.asStep(viewBlock, [
        cSetHtml('<p><br></p>'),
        cNormalizeRange([0], 0, [0], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into previous block with format', Chain.asStep(viewBlock, [
        cSetHtml('<div><p><b>a</b></p>b</p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into previous format inline with input', Chain.asStep(viewBlock, [
        cSetHtml('<p><b><input></b>b</p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into previous cef inline', Chain.asStep(viewBlock, [
        cSetHtml('<p><b contenteditable="false">a</b>b</p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into cef block', Chain.asStep(viewBlock, [
        cSetHtml('<p contenteditable="false">a</p>'),
        cNormalizeRange([], 0, [], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into previous anchor inline', Chain.asStep(viewBlock, [
        cSetHtml('<p><a href="#">a</a>b</p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize out of a caret container', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b><span data-mce-caret="before">b</span></p>'),
        cNormalizeRange([0, 1, 0], 0, [0, 1, 0], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize out of a caret container', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b>' + Zwsp.ZWSP + '</p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize when caret is at start of text node', Chain.asStep(viewBlock, [
        cSetHtml('a'),
        cNormalizeRange([0], 0, [0], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize when caret is at end of text node', Chain.asStep(viewBlock, [
        cSetHtml('a'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize when caret is at middle of text node', Chain.asStep(viewBlock, [
        cSetHtml('ab'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize when caret is before text node', Chain.asStep(viewBlock, [
        cSetHtml('a'),
        cNormalizeRange([], 0, [], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize when caret is after text node', Chain.asStep(viewBlock, [
        cSetHtml('a'),
        cNormalizeRange([], 1, [], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into inline elements if target inline pos is a br', Chain.asStep(viewBlock, [
        cSetHtml('<p><i><b><br /></b></i><br /></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize from after double br', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br /><br /></p>'),
        cNormalizeRange([0], 3, [0], 3),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into first text node', Chain.asStep(viewBlock, [
        cSetHtml('a<b>b</b>c'),
        cNormalizeRange([], 0, [], 0),
        cAssertRangeNone
      ])),
      Logger.t('Should not normalize into last text node', Chain.asStep(viewBlock, [
        cSetHtml('a<b>b</b>c'),
        cNormalizeRange([], 3, [], 3),
        cAssertRangeNone
      ]))
    ])),

    Logger.t('Normalize caret positions', GeneralSteps.sequence([
      Logger.t('Should normalize caret and lean left from text node into previous inline element text node', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b>b</p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRange([0, 0, 0], 1, [0, 0, 0], 1)
      ])),
      Logger.t('Should normalize caret and lean left from text node into previous text node', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<b>b</b></p>'),
        cNormalizeRange([0, 1, 0], 0, [0, 1, 0], 0),
        cAssertRange([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Should normalize caret and lean left from inline element text node into previous inline element text node', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b><i>b</i></p>'),
        cNormalizeRange([0, 1, 0], 0, [0, 1, 0], 0),
        cAssertRange([0, 0, 0], 1, [0, 0, 0], 1)
      ])),
      Logger.t('Should normalize caret and lean left from before br in inline element into previous inline element text node', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b><i><br></i></p>'),
        cNormalizeRange([0, 1], 0, [0, 1], 0),
        cAssertRange([0, 0, 0], 1, [0, 0, 0], 1)
      ])),
      Logger.t('Should normalize on a caret between blocks', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p>'),
        cNormalizeRange([], 1, [], 1),
        cAssertRange([1, 0], 0, [1, 0], 0)
      ])),
      Logger.t('Should normalize from after br to before br', Chain.asStep(viewBlock, [
        cSetHtml('<p><br /></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRange([0], 0, [0], 0)
      ])),
      Logger.t('Should normalize from after br to before br', Chain.asStep(viewBlock, [
        cSetHtml('<p>a<br /></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRange([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Should normalize before paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cNormalizeRange([], 0, [], 0),
        cAssertRange([0, 0], 0, [0, 0], 0)
      ])),
      Logger.t('Should normalize after paragraph', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cNormalizeRange([], 1, [], 1),
        cAssertRange([0, 0], 1, [0, 0], 1)
      ])),
      Logger.t('Should normalize into caret container', Chain.asStep(viewBlock, [
        cSetHtml('<p><span id="_mce_caret">' + Zwsp.ZWSP + '</span><br /></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRange([0, 0, 0], 1, [0, 0, 0], 1)
      ])),
      Logger.t('Should normalize into empty inline element before', Chain.asStep(viewBlock, [
        cSetHtml('<p><i><b></b></i><br /></p>'),
        cNormalizeRange([0], 1, [0], 1),
        cAssertRange([0, 0, 0], 0, [0, 0, 0], 0)
      ]))
    ])),

    Logger.t('Normalize expanded selections', GeneralSteps.sequence([
      Logger.t('Should normalize to before/after image', Chain.asStep(viewBlock, [
        cSetHtml('<p><img src="about:blank "></p>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRange([0], 0, [0], 1)
      ])),
      Logger.t('Should normalize to text node in p', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p>'),
        cNormalizeRange([], 0, [], 1),
        cAssertRange([0, 0], 0, [0, 0], 1)
      ])),
      Logger.t('Should normalize to text node in middle p', Chain.asStep(viewBlock, [
        cSetHtml('<p>a</p><p>b</p><p>c</p>'),
        cNormalizeRange([], 1, [], 2),
        cAssertRange([1, 0], 0, [1, 0], 1)
      ])),
      Logger.t('Should normalize start from end of inline to start of next inline element', Chain.asStep(viewBlock, [
        cSetHtml('<p><b>a</b><i>b</i></p>'),
        cNormalizeRange([0, 0, 0], 1, [0, 1, 0], 1),
        cAssertRange([0, 1, 0], 0, [0, 1, 0], 1)
      ]))
    ])),

    Logger.t('Normalize on document', Step.sync(function () {
      const doc = document.implementation.createHTMLDocument('');
      const rng = document.createRange();
      const dom = DOMUtils(doc, { root_element: doc.body });

      doc.body.innerHTML = '<p>a</p>';

      rng.setStart(document, 0);
      rng.setEnd(document, 0);

      const normRng = NormalizeRange.normalize(dom, rng);
      assertRange(doc.body, normRng, [0, 0], 0, [0, 0], 0);
    }))
  ], function () {
    viewBlock.detach();
    success();
  }, failure);
});
