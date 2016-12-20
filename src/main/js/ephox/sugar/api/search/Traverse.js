define(
  'ephox.sugar.api.search.Traverse',

  [
    'ephox.katamari.api.Type',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Struct',
    'ephox.sugar.alien.Recurse',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element'
  ],

  function (Type, Arr, Fun, Option, Struct, Recurse, Compare, Element) {
    // The document associated with the current element
    var owner = function (element) {
      return Element.fromDom(element.dom().ownerDocument);
    };

    var documentElement = function (element) {
      // TODO: Avoid unnecessary wrap/unwrap here
      var doc = owner(element);
      return Element.fromDom(doc.dom().documentElement);
    };

    // The window element associated with the element
    var defaultView = function (element) {
      var el = element.dom();
      var defaultView = el.ownerDocument.defaultView;
      return Element.fromDom(defaultView);
    };

    var parent = function (element) {
      var dom = element.dom();
      return Option.from(dom.parentNode).map(Element.fromDom);
    };

    var findIndex = function (element) {
      return parent(element).bind(function (p) {
        // TODO: Refactor out children so we can avoid the constant unwrapping
        var kin = children(p);
        return Arr.findIndex(kin, function (elem) {
          return Compare.eq(element, elem);
        });
      });
    };

    var parents = function (element, isRoot) {
      var stop = Type.isFunction(isRoot) ? isRoot : Fun.constant(false);

      // This is used a *lot* so it needs to be performant, not recursive
      var dom = element.dom();
      var ret = [];

      while (dom.parentNode !== null && dom.parentNode !== undefined) {
        var rawParent = dom.parentNode;
        var parent = Element.fromDom(rawParent);
        ret.push(parent);

        if (stop(parent) === true) break;
        else dom = rawParent;
      }
      return ret;
    };

    var siblings = function (element) {
      // TODO: Refactor out children so we can just not add self instead of filtering afterwards
      var filterSelf = function (elements) {
        return Arr.filter(elements, function (x) {
          return !Compare.eq(element, x);
        });
      };

      return parent(element).map(children).map(filterSelf).getOr([]);
    };

    var offsetParent = function (element) {
      var dom = element.dom();
      return Option.from(dom.offsetParent).map(Element.fromDom);
    };

    var prevSibling = function (element) {
      var dom = element.dom();
      return Option.from(dom.previousSibling).map(Element.fromDom);
    };

    var nextSibling = function (element) {
      var dom = element.dom();
      return Option.from(dom.nextSibling).map(Element.fromDom);
    };

    var prevSiblings = function (element) {
      // This one needs to be reversed, so they're still in DOM order
      return Arr.reverse(Recurse.toArray(element, prevSibling));
    };

    var nextSiblings = function (element) {
      return Recurse.toArray(element, nextSibling);
    };

    var children = function (element) {
      var dom = element.dom();
      return Arr.map(dom.childNodes, Element.fromDom);
    };

    var child = function (element, index) {
      var children = element.dom().childNodes;
      return Option.from(children[index]).map(Element.fromDom);
    };

    var firstChild = function (element) {
      return child(element, 0);
    };

    var lastChild = function (element) {
      return child(element, element.dom().childNodes.length - 1);
    };

    var spot = Struct.immutable('element', 'offset');
    var leaf = function (element, offset) {
      var cs = children(element);
      return cs.length > 0 && offset < cs.length ? spot(cs[offset], 0) : spot(element, offset);
    };

    return {
      owner: owner,
      defaultView: defaultView,
      documentElement: documentElement,
      parent: parent,
      findIndex: findIndex,
      parents: parents,
      siblings: siblings,
      prevSibling: prevSibling,
      offsetParent: offsetParent,
      prevSiblings: prevSiblings,
      nextSibling: nextSibling,
      nextSiblings: nextSiblings,
      children: children,
      child: child,
      firstChild: firstChild,
      lastChild: lastChild,
      leaf: leaf
    };
  }
);
