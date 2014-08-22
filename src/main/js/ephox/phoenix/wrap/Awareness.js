define(
  'ephox.phoenix.wrap.Awareness',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    // Textnodes cannot be children of these tags
    var textBlacklist = [ 'table', 'tbody', 'tr', 'ul', 'ol' ];

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
        var isVisibleText = function (textNode) {
          var newLineChars = [ 13, 10 ]; // Bud? &#13; carriage return, & &#10; line feed
          return domUtils.isText(textNode) && Arr.forall(newLineChars, function (charCode) {
            return charCode !== domUtils.getText(textNode).charCodeAt(0);
          });
        };
        return isVisibleText(textNode) && validateParent(textNode, textBlacklist);
      };

      return {
        validateParent: validateParent,
        validateText: validateText
      };

    };
  }
);