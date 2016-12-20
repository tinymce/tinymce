define(
  'ephox.sugar.api.dom.Compare',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.sand.api.Node',
    'ephox.sand.api.PlatformDetection',
    'ephox.sugar.api.search.Selectors'
  ],

  function (Arr, Fun, Node, PlatformDetection, Selectors) {

    var eq = function (e1, e2) {
      return e1.dom() === e2.dom();
    };

    var isEqualNode = function (e1, e2) {
      return e1.dom().isEqualNode(e2.dom());
    };

    var member = function (element, elements) {
      return Arr.exists(elements, Fun.curry(eq, element));
    };

    // DOM contains() method returns true if e1===e2, we define our contains() to return false (a node does not contain itself).
    var regularContains = function (e1, e2) {
      var d1 = e1.dom(), d2 = e2.dom();
      return d1 === d2 ? false : d1.contains(d2);
    };

    var ieContains = function (e1, e2) {
      // IE only implements the contains() method for Element nodes.
      // It fails for Text nodes, so implement it using compareDocumentPosition()
      // https://connect.microsoft.com/IE/feedback/details/780874/node-contains-is-incorrect
      // Note that compareDocumentPosition returns CONTAINED_BY if 'e2 *is_contained_by* e1':
      // Also, compareDocumentPosition defines a node containing itself as false.
      return Node.documentPositionContainedBy(e1.dom(), e2.dom());
    };

    var browser = PlatformDetection.detect().browser;

    // Returns: true if node e1 contains e2, otherwise false.
    // (returns false if e1===e2: A node does not contain itself).
    var contains = browser.isIE() ? ieContains : regularContains;

    return {
      eq: eq,
      isEqualNode: isEqualNode,
      member: member,
      contains: contains,

      // Only used by DomUniverse. Remove (or should Selectors.is move here?)
      is: Selectors.is
    };
  }
);
