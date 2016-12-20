define(
  'ephox.sand.api.Node',

  [
    'ephox.sand.util.Global'
  ],

  function (Global) {
    /*
     * MDN says (yes) for IE, but it's undefined on IE8
     */
    var node = function () {
      var f = Global.getOrDie('Node');
      return f;
    };

    /*
     * Most of numerosity doesn't alter the methods on the object.
     * We're making an exception for Node, because bitwise and is so easy to get wrong.
     *
     * Might be nice to ADT this at some point instead of having individual methods.
     */

    var compareDocumentPosition = function (a, b, match) {
      // Returns: 0 if e1 and e2 are the same node, or a bitmask comparing the positions
      // of nodes e1 and e2 in their documents. See the URL below for bitmask interpretation
      // https://developer.mozilla.org/en-US/docs/Web/API/Node/compareDocumentPosition
      return (a.compareDocumentPosition(b) & match) !== 0;
    };

    var documentPositionPreceding = function (a, b) {
      return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_PRECEDING);
    };

    var documentPositionContainedBy = function (a, b) {
      return compareDocumentPosition(a, b, node().DOCUMENT_POSITION_CONTAINED_BY);
    };

    return {
      documentPositionPreceding: documentPositionPreceding,
      documentPositionContainedBy: documentPositionContainedBy
    };
  }
);