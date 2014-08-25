define(
  'ephox.phoenix.wrap.Awareness',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    // Textnodes cannot be children of these tags
    var textBlacklist = [ 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol' ];

    return function (universe) {
      var domUtils = universe.property();
      var validateParent = function (node, blacklist) {
        return domUtils.parent(node).map(function (parent) {
          return Arr.forall(blacklist, function (tag) {
            return tag !== domUtils.name(parent);
          });
        }).getOr(false);
      };

      var validateText = function (textNode) {
        return domUtils.isText(textNode) && validateParent(textNode, textBlacklist);
      };

      return {
        validateText: validateText
      };
    };
  }
);