define(
  'ephox.agar.api.ApproxStructure',

  [
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Obj',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.properties.Classes',
    'ephox.sugar.api.search.Traverse',
    'ephox.agar.assertions.ApproxComparisons',
    'ephox.agar.assertions.ApproxStructures'
  ],

  function (Fun, Arr, Obj, Node, Element, Attr, Classes, Traverse, ApproxComparisons, ApproxStructures) {
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

    var getCss = function (node) {
      var css = {};
      var dom = node.dom();
      var i, ruleName;

      if (dom.style) {
        for (i = 0; i < dom.style.length; i++) {
          ruleName = dom.style.item(i);
          css[ruleName] = dom.style[ruleName];
        }
      }
      return css;
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
          styles: toAssertableObj(getCss(node)),
          classes: toAssertableArr(Classes.get(node))
        });
      } else {
        return ApproxStructures.text(ApproxComparisons.is(Node.value(node)));
      }
    };

    var fromHtml = function (html) {
      return fromElement(Element.fromHtml(html));
    };

    return {
      build: build,
      fromHtml: fromHtml,
      fromElement: fromElement
    };
  }
);