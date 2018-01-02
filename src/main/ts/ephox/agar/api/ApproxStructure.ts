import { Arr } from '@ephox/katamari';
import { Obj } from '@ephox/katamari';
import { Node } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Css } from '@ephox/sugar';
import { Attr } from '@ephox/sugar';
import { Classes } from '@ephox/sugar';
import { Traverse } from '@ephox/sugar';
import ApproxComparisons from '../assertions/ApproxComparisons';
import ApproxStructures from '../assertions/ApproxStructures';

var build = function (f) {
  var strApi = {
    is: ApproxComparisons.is,
    startsWith: ApproxComparisons.startsWith,
    none: ApproxComparisons.none
  };

  var arrApi = {
    not: ApproxComparisons.not,
    has: ApproxComparisons.has,
    hasPrefix: ApproxComparisons.hasPrefix
  };

  return f(
    {
      element: ApproxStructures.element,
      text: ApproxStructures.text,
      anything: ApproxStructures.anything
    },
    strApi,
    arrApi
  );
};

var getAttrsExcept = function (node, exclude) {
  return Obj.bifilter(Attr.clone(node), function (value, key) {
    return !Arr.contains(exclude, key);
  }).t;
};

var toAssertableObj = function (obj) {
  return Obj.map(obj, function (value) {
    return ApproxComparisons.is(value);
  });
};

var toAssertableArr = function (arr) {
  return Arr.map(arr, function (value) {
    return ApproxComparisons.has(value);
  });
};

var fromElement = function (node) {
  if (Node.isElement(node)) {
    return ApproxStructures.element(Node.name(node), {
      children: Arr.map(Traverse.children(node), fromElement),
      attrs: toAssertableObj(getAttrsExcept(node, ['style', 'class'])),
      styles: toAssertableObj(Css.getAllRaw(node)),
      classes: toAssertableArr(Classes.get(node))
    });
  } else {
    return ApproxStructures.text(ApproxComparisons.is(Node.value(node)));
  }
};

var fromHtml = function (html) {
  return fromElement(Element.fromHtml(html));
};

export default {
  build: build,
  fromHtml: fromHtml,
  fromElement: fromElement
};