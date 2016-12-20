define(
  'ephox.agar.arbitrary.ArbNodes',

  [
    'ephox.agar.alien.Truncate',
    'ephox.sugar.api.node.Comment',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.node.Text',
    'ephox.wrap-jsverify.Jsc',
    'global!document'
  ],

  function (Truncate, Comment, Element, Node, Text, Jsc, document) {
    var createTag = function (name) {
      var partial = name.split('-');
      var tag = partial.length > 0  ? partial[0] : name;
      return Element.fromTag(tag);
    };

    var comment = Jsc.string.smap(
      function (s) {
        var raw = document.createComment(s);
        return Element.fromDom(raw);
      },
      Comment.get,
      function (c) {
        return 'Comment[' + Comment.get(c) + ']';
      }
    );

    var elementOfArb = function (arb) {
      return arb.smap(createTag, Node.name, Truncate.getHtml);
    };

    var elementOf = function (tag) {
      return createTag(tag);
    };

    var textOfArb = function (arb) {
      return arb.smap(Element.fromText, Text.get, Text.get);
    };

    var textOf = function (s) {
      return Element.fromText(s);
    };

    return {
      elementOfArb: elementOfArb,
      elementOf: elementOf,
      comment: comment,
      textOf: textOf,
      textOfArb: textOfArb
    };
  }
);