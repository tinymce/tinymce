asynctest(
  'browser.tinymce.core.keyboard.BoundaryLocationTest',
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.GeneralSteps',
    'ephox.agar.api.Logger',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.Step',
    'ephox.katamari.api.Fun',
    'ephox.sugar.api.dom.Hierarchy',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.search.Selectors',
    'tinymce.core.caret.CaretPosition',
    'tinymce.core.keyboard.BoundaryLocation',
    'tinymce.core.test.ViewBlock',
    'tinymce.core.text.Zwsp'
  ],
  function (Assertions, GeneralSteps, Logger, Pipeline, Step, Fun, Hierarchy, Element, SelectorFind, Selectors, CaretPosition, BoundaryLocation, ViewBlock, Zwsp) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
    var ZWSP = Zwsp.ZWSP;
    var viewBlock = ViewBlock();

    var isInlineTarget = function (elm) {
      return Selectors.is(Element.fromDom(elm), 'a[href],code');
    };

    var createViewElement = function (html) {
      viewBlock.update(html);
      return Element.fromDom(viewBlock.get());
    };

    var createLocation = function (elm, elementPath, offset) {
      var container = Hierarchy.follow(elm, elementPath);
      var pos = new CaretPosition(container.getOrDie().dom(), offset);
      var location = BoundaryLocation.readLocation(isInlineTarget, elm.dom(), pos);
      return location;
    };

    var createPosition = function (elm, elementPath, offset) {
      var container = Hierarchy.follow(elm, elementPath);
      return new CaretPosition(container.getOrDie().dom(), offset);
    };

    var locationName = function (location) {
      return location.fold(
        Fun.constant('before'),
        Fun.constant('start'),
        Fun.constant('end'),
        Fun.constant('after')
      );
    };

    var locationElement = function (location) {
      return Element.fromDom(location.fold(
        Fun.identity,
        Fun.identity,
        Fun.identity,
        Fun.identity
      ));
    };

    var sTestValidLocation = function (html, elementPath, offset, expectedLocationName, expectedInline) {
      return Step.sync(function () {
        var elm = createViewElement(html);
        var location = createLocation(elm, elementPath, offset);
        Assertions.assertEq('Should be a valid location: ' + html, true, location.isSome());
        Assertions.assertEq('Should be expected location', expectedLocationName, locationName(location.getOrDie()));
        Assertions.assertDomEq('Should be expected element', SelectorFind.descendant(elm, expectedInline).getOrDie(), locationElement(location.getOrDie()));
      });
    };

    var sTestInvalidLocation = function (html, elementPath, offset) {
      return Step.sync(function () {
        var elm = createViewElement(html);
        var location = createLocation(elm, elementPath, offset);
        Assertions.assertEq('Should not be a valid location: ' + html, true, location.isNone());
      });
    };

    var sTestFindLocation = function (forward, html, elementPath, offset, expectedLocationName, expectedInline) {
      return Step.sync(function () {
        var elm = createViewElement(html);
        var position = createPosition(elm, elementPath, offset);
        var location = BoundaryLocation.findLocation(forward, isInlineTarget, elm.dom(), position);

        Assertions.assertDomEq('Should be expected element', SelectorFind.descendant(elm, expectedInline).getOrDie(), locationElement(location.getOrDie()));
        Assertions.assertEq('Should be a valid location: ' + html, true, location.isSome());
        Assertions.assertEq('Should be expected location', expectedLocationName, locationName(location.getOrDie()));
      });
    };

    var sTestFindLocationInvalid = function (forward, html, elementPath, offset) {
      return Step.sync(function () {
        var elm = createViewElement(html);
        var position = createPosition(elm, elementPath, offset);
        var location = BoundaryLocation.findLocation(forward, isInlineTarget, elm.dom(), position);
        Assertions.assertEq('Should not be a valid location: ' + html, true, location.isNone());
      });
    };

    var sTestPrevLocation = Fun.curry(sTestFindLocation, false);
    var sTestNextLocation = Fun.curry(sTestFindLocation, true);
    var sTestPrevLocationInvalid = Fun.curry(sTestFindLocationInvalid, false);
    var sTestNextLocationInvalid = Fun.curry(sTestFindLocationInvalid, true);

    var sTestValidLocations = Logger.t('sTestValidLocations', GeneralSteps.sequence([
      Logger.t('anchor locations', GeneralSteps.sequence([
        sTestValidLocation('<p><a href="a">a</a></p>', [0], 0, 'before', 'a'),
        sTestValidLocation('<p><a href="a">a</a></p>', [0, 0, 0], 0, 'start', 'a'),
        sTestValidLocation('<p><a href="a">a</a></p>', [0, 0, 0], 1, 'end', 'a'),
        sTestValidLocation('<p><a href="a">a</a></p>', [0], 1, 'after', 'a'),
        sTestValidLocation('<p>a<a href="a">a</a></p>', [0, 0], 1, 'before', 'a'),
        sTestValidLocation('<p><a href="a">a</a>a</p>', [0, 1], 0, 'after', 'a'),
        sTestValidLocation('<p><a href="a">ab</a></p>', [0, 0, 0], 0, 'start', 'a'),
        sTestValidLocation('<p><a href="a">ab</a></p>', [0, 0, 0], 2, 'end', 'a'),
        sTestValidLocation('<p><img src="a"><a href="a">a</a></p>', [0], 1, 'before', 'a'),
        sTestValidLocation('<p><a href="a"><img src="a"></a></p>', [0, 0], 0, 'start', 'a'),
        sTestValidLocation('<p><a href="a"><img src="a"></a></p>', [0, 0], 1, 'end', 'a'),
        sTestValidLocation('<p><a href="a">a</a><img src="a"></p>', [0], 1, 'after', 'a'),
        sTestValidLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [0], 1, 'after', 'a'),
        sTestValidLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [1], 0, 'before', 'p:nth-child(2) a')
      ])),

      Logger.t('code locations', GeneralSteps.sequence([
        sTestValidLocation('<p><code>a</code></p>', [0], 0, 'before', 'code'),
        sTestValidLocation('<p><code>a</code></p>', [0, 0], 0, 'start', 'code'),
        sTestValidLocation('<p><code>a</code></p>', [0, 0], 1, 'end', 'code'),
        sTestValidLocation('<p><code>a</code></p>', [0], 1, 'after', 'code')
      ])),

      Logger.t('anchor + code locations', GeneralSteps.sequence([
        sTestValidLocation('<p><a href="#"><code>a</code></a></p>', [0], 0, 'before', 'a'),
        sTestValidLocation('<p><a href="#"><code>a</code></a></p>', [0, 0, 0], 0, 'start', 'a'),
        sTestValidLocation('<p><a href="#"><code>a</code></a></p>', [0, 0, 0], 1, 'end', 'a'),
        sTestValidLocation('<p><a href="#"><code>a</code></a></p>', [0], 1, 'after', 'a')
      ]))
    ]));

    var sTestValidZwspLocations = Logger.t('sTestValidZwspLocations', GeneralSteps.sequence([
      sTestValidLocation('<p>' + ZWSP + '<a href="a">a</a></p>', [0, 0], 0, 'before', 'a'),
      sTestValidLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [0, 0, 0], 1, 'start', 'a'),
      sTestValidLocation('<p><a href="a">a' + ZWSP + '</a></p>', [0, 0, 0], 1, 'end', 'a'),
      sTestValidLocation('<p><a href="a">a</a>' + ZWSP + '</p>', [0, 1], 1, 'after', 'a')
    ]));

    var sTestInvalidLocations = Logger.t('sTestInvalidLocations', GeneralSteps.sequence([
      sTestInvalidLocation('<p>a</p>', [0, 0], 0),
      sTestInvalidLocation('<p><b>a</b></p>', [0], 0),
      sTestInvalidLocation('<p><b>a</b></p>', [0], 1),
      sTestInvalidLocation('<p>a<a href="a">a</a>b</p>', [0, 0], 0),
      sTestInvalidLocation('<p>a<a href="a">a</a>b</p>', [0, 2], 1),
      sTestInvalidLocation('<p><img src="a"><a href="a">a</a></p>', [0], 0),
      sTestInvalidLocation('<p><a href="a">a</a><img src="a"></p>', [0], 2),
      sTestInvalidLocation('<p><a href="a"><img src="a"><img src="a"></a><img src="a"></p>', [0, 0], 1),
      sTestInvalidLocation('<p dir="rtl"><a href="a">a</a></p>', [0, 0, 0], 0),
      sTestInvalidLocation('<p><a href="a">\u05D4</a></p>', [0, 0, 0], 0),

      Logger.t('anchor + code locations', GeneralSteps.sequence([
        sTestInvalidLocation('<p><a href="#">a<code>b</code>c</a></p>', [0, 0, 0], 1),
        sTestInvalidLocation('<p><a href="#">a<code>b</code>c</a></p>', [0, 0, 2], 0)
      ])),

      Logger.t('format caret parent', GeneralSteps.sequence([
        sTestInvalidLocation('<p><span id="_mce_caret">a</span></p>', [0, 0, 0], 0),
        sTestInvalidLocation('<p><span id="_mce_caret"><code>a</code></span></p>', [0, 0, 0, 0], 0)
      ]))
    ]));

    var sTestPrevLocations = Logger.t('sTestPrevLocations', GeneralSteps.sequence([
      sTestPrevLocation('<p><a href="a">a</a>b</p>', [0, 1], 1, 'after', 'a'),
      sTestPrevLocation('<p><a href="a">a</a></p>', [0], 1, 'end', 'a'),
      sTestPrevLocation('<p><a href="a">a</a></p>', [0, 0, 0], 1, 'start', 'a'),
      sTestPrevLocation('<p><a href="a">a</a></p>', [0, 0, 0], 0, 'before', 'a'),
      sTestPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [0], 1, 'end', 'a'),
      sTestPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 1, 'start', 'a'),
      sTestPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 0, 'before', 'a')
    ]));

    var sTestPrevLocationsBetweenInlines = Logger.t('sTestPrevLocationsBetweenInlines', GeneralSteps.sequence([
      sTestPrevLocation('<p><a href="a">a</a><a href="b">b</a></p>', [0, 1, 0], 0, 'before', 'a:nth-child(2)')
    ]));

    var sTestPrevLocationsBetweenBlocks = Logger.t('sTestPrevLocationsBetweenBlocks', GeneralSteps.sequence([
      sTestPrevLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [1], 0, 'end', 'p:nth-child(1) a'),
      sTestPrevLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [1, 0, 0], 0, 'before', 'p:nth-child(2) a'),
      sTestPrevLocation('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [1, 0, 0], 0, 'before', 'p:nth-child(2) a'),
      sTestPrevLocation('<p><a href="a">a</a><br /></p><p><a href="c">c</a></p>', [1], 0, 'after', 'p:nth-child(1) a'),
      sTestPrevLocationInvalid('<p><a href="a">a</a></p><p>b<a href="c">c</a></p>', [1, 0], 1),
      sTestPrevLocationInvalid('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [1], 0)
    ]));

    var sTestPrevZwspLocations = Logger.t('sTestPrevLocations', GeneralSteps.sequence([
      sTestPrevLocation('<p><a href="a">a</a>' + ZWSP + 'b</p>', [0, 1], 2, 'after', 'a'),
      sTestPrevLocation('<p><a href="a">a</a>' + ZWSP + '</p>', [0, 1], 1, 'end', 'a'),
      sTestPrevLocation('<p><a href="a">a' + ZWSP + '</a></p>', [0, 0, 0], 1, 'start', 'a'),
      sTestPrevLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [0, 0, 0], 1, 'before', 'a')
    ]));

    var sTestNextLocations = Logger.t('sTestNextLocations', GeneralSteps.sequence([
      sTestNextLocation('<p>a<a href="a">b</a></p>', [0, 0], 0, 'before', 'a'),
      sTestNextLocation('<p><a href="a">a</a></p>', [0], 0, 'start', 'a'),
      sTestNextLocation('<p><a href="a">a</a></p>', [0, 0, 0], 0, 'end', 'a'),
      sTestNextLocation('<p><a href="a">a</a></p>', [0, 0, 0], 1, 'after', 'a'),
      sTestNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [0], 0, 'start', 'a'),
      sTestNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 0, 'end', 'a'),
      sTestNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 1, 'after', 'a')
    ]));

    var sTestNextLocationsBetweenInlines = Logger.t('sTestNextLocationsBetweenInlines', GeneralSteps.sequence([
      sTestNextLocation('<p><a href="a">a</a><a href="a">b</a></p>', [0, 0, 0], 1, 'after', 'a:nth-child(1)')
    ]));

    var sTestNextLocationsBetweenBlocks = Logger.t('sTestNextLocationsBetweenBlocks', GeneralSteps.sequence([
      sTestNextLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [0], 1, 'start', 'p:nth-child(2) a'),
      sTestNextLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [0, 0, 0], 1, 'after', 'p:nth-child(1) a'),
      sTestNextLocationInvalid('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [0, 1], 0),
      sTestNextLocationInvalid('<p><a href="a">a</a></p><p>b<a href="c">c</a></p>', [0], 1)
    ]));

    var sTestNextZwspLocations = Logger.t('sTestNextZwspLocations', GeneralSteps.sequence([
      sTestNextLocation('<p>a' + ZWSP + '<a href="a">b</a></p>', [0, 0], 0, 'before', 'a'),
      sTestNextLocation('<p>' + ZWSP + '<a href="a">a</a></p>', [0], 0, 'start', 'a'),
      sTestNextLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [0, 0, 0], 1, 'end', 'a'),
      sTestNextLocation('<p><a href="a">a' + ZWSP + '</a></p>', [0, 0, 0], 1, 'after', 'a')
    ]));

    viewBlock.attach();
    Pipeline.async({}, [
      sTestValidLocations,
      sTestValidZwspLocations,
      sTestInvalidLocations,
      sTestPrevLocations,
      sTestPrevLocationsBetweenInlines,
      sTestPrevLocationsBetweenBlocks,
      sTestPrevZwspLocations,
      sTestNextLocations,
      sTestNextLocationsBetweenInlines,
      sTestNextLocationsBetweenBlocks,
      sTestNextZwspLocations
    ], function () {
      viewBlock.detach();
      success();
    }, failure);
  }
);