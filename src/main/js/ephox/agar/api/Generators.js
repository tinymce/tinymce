define(
  'ephox.agar.api.Generators',

  [
    'ephox.agar.alien.Truncate',
    'ephox.agar.arbitrary.GenSelection',
    'ephox.agar.arbitrary.TagDecorator',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.properties.Html',
    'ephox.wrap-jsverify.Jsc'
  ],

  function (Truncate, GenSelection, TagDecorator, Hierarchy, Html, Jsc) {
    var selection = function (container, exclusions) {
      return GenSelection.selection(container, exclusions);
    };

    var describeSelection = function (root, generated) {
      return Hierarchy.path(root, generated.start()).bind(function (startPath) {
        return Hierarchy.path(root, generated.finish()).map(function (finishPath) {
          return {
            selection: {
              startElement: Truncate.getHtml(generated.start()),
              startElementFull: Html.getOuter(generated.start()),
              startPath: startPath,
              startOffset: generated.soffset(),
              finishElement: Truncate.getHtml(generated.finish()),
              finishElementFull: Html.getOuter(generated.finish()),
              finishPath: finishPath,
              finishOffset: generated.foffset()
            }
          };
        });
      }).getOr(generated);
    };

    var chooseOne = function (choices) {
      return TagDecorator.gOne(choices);
    };

    var enforce = function (attrs) {
      return TagDecorator.gEnforce(attrs);
    };

    var hexDigit = Jsc.elements('0123456789abcdef'.split(''));

    var hexColor = Jsc.tuple([
      hexDigit,
      hexDigit,
      hexDigit,
      hexDigit,
      hexDigit,
      hexDigit
    ]).generator.map(function (digits) {
      return [ '#' ].concat(digits).join('');
    });

    return {
      selection: selection,
      describeSelection: describeSelection,
      chooseOne: chooseOne,
      enforce: enforce,
      hexColor: hexColor
    };
  }
);