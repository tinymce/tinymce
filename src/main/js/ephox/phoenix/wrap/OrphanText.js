define(
  'ephox.phoenix.wrap.OrphanText',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    // Textnodes cannot be children of these tags
    var textBlacklist = [ 'table', 'tbody', 'thead', 'tfoot', 'tr', 'ul', 'ol' ];

    return function (universe) {
      var domUtils = universe.property();
      var validateParent = function (node, blacklist) {
        return domUtils.parent(node).map(domUtils.name).map(function (name) {
          return !Arr.contains(blacklist, name);
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