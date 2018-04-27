import { Fun } from '@ephox/katamari';
import { NodeFilter } from '@ephox/sand';
import { PlatformDetection } from '@ephox/sand';
import Element from './Element';
import { document } from '@ephox/dom-globals';

var regularGetNodes = function (texas) {
  var ret = [];
  while (texas.nextNode() !== null) ret.push(Element.fromDom(texas.currentNode));
  return ret;
};

var ieGetNodes = function (texas) {
  // IE throws an error on nextNode() when there are zero nodes available, and any attempts I made to detect this
  // just resulted in throwing away valid cases
  try {
    return regularGetNodes(texas);
  } catch (e) {
    return [];
  }
};

// I hate needing platform detection in Sugar, but the alternative is to always try/catch which will swallow coding errors as well
var browser = PlatformDetection.detect().browser;
var getNodes = browser.isIE() || browser.isEdge() ? ieGetNodes : regularGetNodes;

// Weird, but oh well
var noFilter = Fun.constant(Fun.constant(true));

var find = function (node, filterOpt) {

  var vmlFilter = filterOpt.fold(noFilter, function (filter) {
    return function (comment) {
      return filter(comment.nodeValue);
    };
  });

  // the standard wants an object, IE wants a function. But everything is an object, so let's be sneaky
  // http://www.bennadel.com/blog/2607-finding-html-comment-nodes-in-the-dom-using-treewalker.htm
  vmlFilter.acceptNode = vmlFilter;

  var texas = document.createTreeWalker(node.dom(), NodeFilter().SHOW_COMMENT, vmlFilter, false);

  return getNodes(texas);
};

export default <any> {
  find: find
};