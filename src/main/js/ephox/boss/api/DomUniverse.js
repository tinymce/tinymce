define(
  'ephox.boss.api.DomUniverse',

  [
    'ephox.boss.common.TagBoundaries',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Css',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.InsertAll',
    'ephox.sugar.api.Node',
    'ephox.sugar.api.PredicateFilter',
    'ephox.sugar.api.PredicateFind',
    'ephox.sugar.api.Remove',
    'ephox.sugar.api.SelectorFilter',
    'ephox.sugar.api.SelectorFind',
    'ephox.sugar.api.Text',
    'ephox.sugar.api.Traverse'
  ],

  function (TagBoundaries, Arr, Fun, Attr, Compare, Css, Element, Insert, InsertAll, Node, PredicateFilter, PredicateFind, Remove, SelectorFilter, SelectorFind, Text, Traverse) {
    return function () {
      var clone = function (element) {
        return Element.fromDom(element.dom().cloneNode(false));
      };

      var isBoundary = function (element) {
        if (!Node.isElement(element)) return false;
        if (Node.name(element) === 'body') return true;
        var display = Css.get(element, 'display');
        // When the read display value is empty, we need to check the node name.
        return display !== undefined && display.length > 0 ?
          Arr.contains(['block', 'table-cell', 'table-row', 'table', 'list-item'], display) :
          Arr.contains(TagBoundaries, Node.name(element));
      };

      var isEmptyTag = function (element) {
        if (!Node.isElement(element)) return false;
        return Arr.contains(['br', 'img', 'hr'], Node.name(element));
      };

      var comparePosition = function (element, other) {
        return element.dom().compareDocumentPosition(other.dom());
      };

      return {
        up: Fun.constant({
          selector: SelectorFind.ancestor,
          closest: SelectorFind.closest,
          predicate: PredicateFind.ancestor,
          all: Traverse.parents
        }),
        down: Fun.constant({
          selector: SelectorFilter.descendants,
          predicate: PredicateFilter.descendants
        }),
        styles: Fun.constant({
          get: Css.get,
          set: Css.set,
          remove: Css.remove
        }),
        attrs: Fun.constant({
          get: Attr.get,
          set: Attr.set,
          remove: Attr.remove
        }),
        insert: Fun.constant({
          before: Insert.before,
          after: Insert.after,
          afterAll: InsertAll.after,
          append: Insert.append,
          appendAll: InsertAll.append,
          prepend: Insert.prepend,
          wrap: Insert.wrap
        }),
        remove: Fun.constant({
          unwrap: Remove.unwrap,
          detach: Remove.detach,
          remove: Remove.remove
        }),
        create: Fun.constant({
          nu: Element.fromTag,
          clone: clone,
          text: Element.fromText
        }),
        query: Fun.constant({
          comparePosition: comparePosition,
          prevSibling: Traverse.prevSibling,
          nextSibling: Traverse.nextSibling
        }),
        property: Fun.constant({
          children: Traverse.children,
          name: Node.name,
          parent: Traverse.parent,
          isText: Node.isText,
          isElement: Node.isElement,
          getText: Text.get,
          setText: Text.set,
          isBoundary: isBoundary,
          isEmptyTag: isEmptyTag
        }),
        eq: Compare.eq,
        is: Compare.is
      };
    };
  }
);
