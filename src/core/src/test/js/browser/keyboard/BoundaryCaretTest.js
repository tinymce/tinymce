asynctest(
  'browser.tinymce.core.keyboard.BoundaryCaretTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.BoundaryCaret',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.keyboard.InlineUtils',
    'tinymce.core.text.Zwsp'
  ],
  function (
    Assertions, GeneralSteps, Logger, Pipeline, Step, Cell, Fun, Hierarchy, Element, Selectors, CaretPosition, BoundaryCaret, BoundaryLocation, InlineUtils,
    Zwsp
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var ZWSP = Zwsp.ZWSP;

    var isInlineTarget = function (elm) {
      return Selectors.is(Element.fromDom(elm), 'a[href],code');
    };

    var createLocation = function (elm, elementPath, offset) {
      var container = Hierarchy.follow(elm, elementPath);
      var pos = new CaretPosition(container.getOrDie().dom(), offset);
      var location = BoundaryLocation.readLocation(isInlineTarget, elm.dom(), pos);
      return location;
    };

    var sTestRenderCaret = function (html, elementPath, offset, expectedHtml, expectedPath, expectedOffset) {
      return Step.sync(function () {
        var elm = Element.fromHtml('<div>' + html + '</div>');
        var location = createLocation(elm, elementPath, offset);
        var caret = Cell(null);

        Assertions.assertEq('Should be a valid location: ' + html, true, location.isSome());

        var pos = BoundaryCaret.renderCaret(caret, location.getOrDie()).getOrDie();
        Assertions.assertHtml('Should be equal html', expectedHtml, elm.dom().innerHTML);

        var container = Hierarchy.follow(elm, expectedPath);
        Assertions.assertDomEq('Should be equal nodes', container.getOrDie(), Element.fromDom(pos.container()));
      });
    };

    Pipeline.async({}, [
      Logger.t('sTestRenderCaret', GeneralSteps.sequence([
        sTestRenderCaret('<p><a href="#">a</a></p>', [0], 0, '<p>' + ZWSP + '<a href="#">a</a></p>', [0, 0], 1),
        sTestRenderCaret('<p><a href="#">a</a></p>', [0, 0, 0], 0, '<p><a href="#">' + ZWSP + 'a</a></p>', [0, 0, 0], 1),
        sTestRenderCaret('<p><a href="#">a</a></p>', [0, 0, 0], 1, '<p><a href="#">a' + ZWSP + '</a></p>', [0, 0, 0], 1),
        sTestRenderCaret('<p><a href="#">a</a></p>', [0], 1, '<p><a href="#">a</a>' + ZWSP + '</p>', [0, 1], 1),
        sTestRenderCaret('<p><img src="#"><a href="#">a</a></p>', [0], 1, '<p><img src="#">' + ZWSP + '<a href="#">a</a></p>', [0, 1], 0),
        sTestRenderCaret('<p><a href="#"><img src="#">a</a></p>', [0, 0], 0, '<p><a href="#">' + ZWSP + '<img src="#">a</a></p>', [0, 0, 0], 1),
        sTestRenderCaret('<p><a href="#">a<img src="#"></a></p>', [0, 0], 2, '<p><a href="#">a<img src="#">' + ZWSP + '</a></p>', [0, 0, 2], 1),
        sTestRenderCaret('<p><a href="#">a</a><img src="#"></p>', [0], 1, '<p><a href="#">a</a>' + ZWSP + '<img src="#"></p>', [0, 1], 1)
      ]))
    ], function () {
      success();
    }, failure);
  }
);