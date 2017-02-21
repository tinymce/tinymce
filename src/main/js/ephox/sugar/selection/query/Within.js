define(
  'ephox.sugar.selection.query.Within',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.Selectors',
    'ephox.sugar.selection.core.NativeRange',
    'ephox.sugar.selection.core.SelectionDirection'
  ],

  function (Arr, Element, Node, SelectorFilter, Selectors, NativeRange, SelectionDirection) {
    var withinContainer = function (win, ancestor, outerRange, selector) {
      var innerRange = NativeRange.create(win);
      var self = Selectors.is(ancestor, selector) ? [ ancestor ] : [];
      var elements = self.concat(SelectorFilter.descendants(ancestor, selector));
      return Arr.filter(elements, function (elem) {
        // Mutate the selection to save creating new ranges each time
        NativeRange.selectNodeContentsUsing(innerRange, elem);
        return NativeRange.isWithin(outerRange, innerRange);
      });
    };

    var find = function (win, relative, selector) {
      var directed = SelectionDirection.diagnose(win, relative);
      // Reverse the selection if it is RTL when doing the comparison
      var outerRange = SelectionDirection.asLtrRange(win, directed);
      
      var ancestor = Element.fromDom(outerRange.commonAncestorContainer);
      // Note, this might need to change when we have to start looking for non elements.
      return Node.isElement(ancestor) ? 
        withinContainer(win, ancestor, outerRange, selector) : [];
    };

    return {
      find: find
    };
  }
);