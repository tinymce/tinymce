define(
  'ephox.sugar.selection.query.Within',

  [
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.Selectors',
    'ephox.sugar.selection.core.SelectionDirection'
  ],

  function (Arr, Element, Node, SelectorFilter, Selectors, SelectionDirection) {
    // Adapted from: http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
    var inRange = function (tempRange, rng, element) {
      tempRange.selectNodeContents(element.dom());
      return tempRange.compareBoundaryPoints(rng.END_TO_START, rng) < 1 &&
        tempRange.compareBoundaryPoints(rng.START_TO_END, rng) > -1;
    };

    var withinContainer = function (win, container, rng, selector) {
      var tempRange = win.document.createRange();
      var self = Selectors.is(container, selector) ? [ container ] : [];
      var elements = self.concat(SelectorFilter.descendants(container, selector));
      return Arr.filter(elements, function (elem) {
        return inRange(tempRange, rng, elem);
      });
    };

    var find = function (win, relative, selector) {
      var directed = SelectionDirection.diagnose(win, relative);
      // Reverse the selection if it is RTL when doing the comparison
      var rng = SelectionDirection.asLtrRange(win, directed);
      
      var container = Element.fromDom(rng.commonAncestorContainer);
      // Note, this might need to change when we have to start looking for non elements.
      return Node.isElement(container) ? 
        withinContainer(win, container, rng, selector) : [];
    };

    return {
      find: find
    };
  }
);