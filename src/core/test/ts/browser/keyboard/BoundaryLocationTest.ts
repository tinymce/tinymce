import { Assertions, GeneralSteps, Logger, Pipeline, Step } from '@ephox/agar';
import { Fun } from '@ephox/katamari';
import { Hierarchy, Element, SelectorFind, Selectors } from '@ephox/sugar';
import CaretPosition from 'tinymce/core/caret/CaretPosition';
import BoundaryLocation from 'tinymce/core/keyboard/BoundaryLocation';
import ViewBlock from '../../module/test/ViewBlock';
import Zwsp from 'tinymce/core/text/Zwsp';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('browser.tinymce.core.keyboard.BoundaryLocationTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];
  const ZWSP = Zwsp.ZWSP;
  const viewBlock = ViewBlock();

  const isInlineTarget = function (elm) {
    return Selectors.is(Element.fromDom(elm), 'a[href],code');
  };

  const createViewElement = function (html) {
    viewBlock.update(html);
    return Element.fromDom(viewBlock.get());
  };

  const createLocation = function (elm, elementPath, offset) {
    const container = Hierarchy.follow(elm, elementPath);
    const pos = CaretPosition(container.getOrDie().dom(), offset);
    const location = BoundaryLocation.readLocation(isInlineTarget, elm.dom(), pos);
    return location;
  };

  const createPosition = function (elm, elementPath, offset) {
    const container = Hierarchy.follow(elm, elementPath);
    return CaretPosition(container.getOrDie().dom(), offset);
  };

  const locationName = function (location) {
    return location.fold(
      Fun.constant('before'),
      Fun.constant('start'),
      Fun.constant('end'),
      Fun.constant('after')
    );
  };

  const locationElement = function (location) {
    return Element.fromDom(location.fold(
      Fun.identity,
      Fun.identity,
      Fun.identity,
      Fun.identity
    ));
  };

  const sTestValidLocation = function (html, elementPath, offset, expectedLocationName, expectedInline) {
    return Step.sync(function () {
      const elm = createViewElement(html);
      const location = createLocation(elm, elementPath, offset);
      Assertions.assertEq('Should be a valid location: ' + html, true, location.isSome());
      Assertions.assertEq('Should be expected location', expectedLocationName, locationName(location.getOrDie()));
      Assertions.assertDomEq('Should be expected element', SelectorFind.descendant(elm, expectedInline).getOrDie(), locationElement(location.getOrDie()));
    });
  };

  const sTestInvalidLocation = function (html, elementPath, offset) {
    return Step.sync(function () {
      const elm = createViewElement(html);
      const location = createLocation(elm, elementPath, offset);
      Assertions.assertEq('Should not be a valid location: ' + html, true, location.isNone());
    });
  };

  const sTestFindLocation = function (forward, html, elementPath, offset, expectedLocationName, expectedInline) {
    return Step.sync(function () {
      const elm = createViewElement(html);
      const position = createPosition(elm, elementPath, offset);
      const location = BoundaryLocation.findLocation(forward, isInlineTarget, elm.dom(), position);

      Assertions.assertDomEq('Should be expected element', SelectorFind.descendant(elm, expectedInline).getOrDie(), locationElement(location.getOrDie()));
      Assertions.assertEq('Should be a valid location: ' + html, true, location.isSome());
      Assertions.assertEq('Should be expected location', expectedLocationName, locationName(location.getOrDie()));
    });
  };

  const sTestFindLocationInvalid = function (forward, html, elementPath, offset) {
    return Step.sync(function () {
      const elm = createViewElement(html);
      const position = createPosition(elm, elementPath, offset);
      const location = BoundaryLocation.findLocation(forward, isInlineTarget, elm.dom(), position);
      Assertions.assertEq('Should not be a valid location: ' + html, true, location.isNone());
    });
  };

  const sTestPrevLocation = Fun.curry(sTestFindLocation, false);
  const sTestNextLocation = Fun.curry(sTestFindLocation, true);
  const sTestPrevLocationInvalid = Fun.curry(sTestFindLocationInvalid, false);
  const sTestNextLocationInvalid = Fun.curry(sTestFindLocationInvalid, true);

  const sTestValidLocations = Logger.t('sTestValidLocations', GeneralSteps.sequence([
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

  const sTestValidZwspLocations = Logger.t('sTestValidZwspLocations', GeneralSteps.sequence([
    sTestValidLocation('<p>' + ZWSP + '<a href="a">a</a></p>', [0, 0], 0, 'before', 'a'),
    sTestValidLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [0, 0, 0], 1, 'start', 'a'),
    sTestValidLocation('<p><a href="a">a' + ZWSP + '</a></p>', [0, 0, 0], 1, 'end', 'a'),
    sTestValidLocation('<p><a href="a">a</a>' + ZWSP + '</p>', [0, 1], 1, 'after', 'a')
  ]));

  const sTestInvalidLocations = Logger.t('sTestInvalidLocations', GeneralSteps.sequence([
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

  const sTestPrevLocations = Logger.t('sTestPrevLocations', GeneralSteps.sequence([
    sTestPrevLocation('<p><a href="a">a</a>b</p>', [0, 1], 1, 'after', 'a'),
    sTestPrevLocation('<p><a href="a">a</a></p>', [0], 1, 'end', 'a'),
    sTestPrevLocation('<p><a href="a">a</a></p>', [0, 0, 0], 1, 'start', 'a'),
    sTestPrevLocation('<p><a href="a">a</a></p>', [0, 0, 0], 0, 'before', 'a'),
    sTestPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [0], 1, 'end', 'a'),
    sTestPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 1, 'start', 'a'),
    sTestPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 0, 'before', 'a')
  ]));

  const sTestPrevLocationsBetweenInlines = Logger.t('sTestPrevLocationsBetweenInlines', GeneralSteps.sequence([
    sTestPrevLocation('<p><a href="a">a</a><a href="b">b</a></p>', [0, 1, 0], 0, 'before', 'a:nth-child(2)')
  ]));

  const sTestPrevLocationsBetweenBlocks = Logger.t('sTestPrevLocationsBetweenBlocks', GeneralSteps.sequence([
    sTestPrevLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [1], 0, 'end', 'p:nth-child(1) a'),
    sTestPrevLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [1, 0, 0], 0, 'before', 'p:nth-child(2) a'),
    sTestPrevLocation('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [1, 0, 0], 0, 'before', 'p:nth-child(2) a'),
    sTestPrevLocation('<p><a href="a">a</a><br /></p><p><a href="c">c</a></p>', [1], 0, 'after', 'p:nth-child(1) a'),
    sTestPrevLocationInvalid('<p><a href="a">a</a></p><p>b<a href="c">c</a></p>', [1, 0], 1),
    sTestPrevLocationInvalid('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [1], 0)
  ]));

  const sTestPrevZwspLocations = Logger.t('sTestPrevLocations', GeneralSteps.sequence([
    sTestPrevLocation('<p><a href="a">a</a>' + ZWSP + 'b</p>', [0, 1], 2, 'after', 'a'),
    sTestPrevLocation('<p><a href="a">a</a>' + ZWSP + '</p>', [0, 1], 1, 'end', 'a'),
    sTestPrevLocation('<p><a href="a">a' + ZWSP + '</a></p>', [0, 0, 0], 1, 'start', 'a'),
    sTestPrevLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [0, 0, 0], 1, 'before', 'a')
  ]));

  const sTestNextLocations = Logger.t('sTestNextLocations', GeneralSteps.sequence([
    sTestNextLocation('<p>a<a href="a">b</a></p>', [0, 0], 0, 'before', 'a'),
    sTestNextLocation('<p><a href="a">a</a></p>', [0], 0, 'start', 'a'),
    sTestNextLocation('<p><a href="a">a</a></p>', [0, 0, 0], 0, 'end', 'a'),
    sTestNextLocation('<p><a href="a">a</a></p>', [0, 0, 0], 1, 'after', 'a'),
    sTestNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [0], 0, 'start', 'a'),
    sTestNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 0, 'end', 'a'),
    sTestNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [0, 0], 1, 'after', 'a')
  ]));

  const sTestNextLocationsBetweenInlines = Logger.t('sTestNextLocationsBetweenInlines', GeneralSteps.sequence([
    sTestNextLocation('<p><a href="a">a</a><a href="a">b</a></p>', [0, 0, 0], 1, 'after', 'a:nth-child(1)')
  ]));

  const sTestNextLocationsBetweenBlocks = Logger.t('sTestNextLocationsBetweenBlocks', GeneralSteps.sequence([
    sTestNextLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [0], 1, 'start', 'p:nth-child(2) a'),
    sTestNextLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [0, 0, 0], 1, 'after', 'p:nth-child(1) a'),
    sTestNextLocationInvalid('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [0, 1], 0),
    sTestNextLocationInvalid('<p><a href="a">a</a></p><p>b<a href="c">c</a></p>', [0], 1)
  ]));

  const sTestNextZwspLocations = Logger.t('sTestNextZwspLocations', GeneralSteps.sequence([
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
});
