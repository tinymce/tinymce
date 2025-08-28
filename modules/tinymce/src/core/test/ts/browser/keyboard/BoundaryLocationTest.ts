import { Assertions } from '@ephox/agar';
import { context, describe, it } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';
import { Hierarchy, SelectorFind, Selectors, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import CaretPosition from 'tinymce/core/caret/CaretPosition';
import * as BoundaryLocation from 'tinymce/core/keyboard/BoundaryLocation';
import { ZWSP } from 'tinymce/core/text/Zwsp';

import * as ViewBlock from '../../module/test/ViewBlock';

describe('browser.tinymce.core.keyboard.BoundaryLocationTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  const isInlineTarget = (elm: Node) => {
    return Selectors.is(SugarElement.fromDom(elm), 'a[href],code');
  };

  const createViewElement = (html: string) => {
    viewBlock.update(html);
    return SugarElement.fromDom(viewBlock.get());
  };

  const createLocation = (elm: SugarElement<Node>, elementPath: number[], offset: number) => {
    const container = Hierarchy.follow(elm, elementPath);
    const pos = CaretPosition(container.getOrDie().dom, offset);
    const location = BoundaryLocation.readLocation(isInlineTarget, elm.dom, pos);
    return location;
  };

  const createPosition = (elm: SugarElement<Element>, elementPath: number[], offset: number) => {
    const container = Hierarchy.follow(elm, elementPath);
    return CaretPosition(container.getOrDie().dom, offset);
  };

  const locationName = (location: BoundaryLocation.LocationAdt) => {
    return location.fold(
      Fun.constant('before'),
      Fun.constant('start'),
      Fun.constant('end'),
      Fun.constant('after')
    );
  };

  const locationElement = (location: BoundaryLocation.LocationAdt) => {
    return SugarElement.fromDom(location.fold(
      Fun.identity,
      Fun.identity,
      Fun.identity,
      Fun.identity
    ));
  };

  const testValidLocation = (html: string, elementPath: number[], offset: number, expectedLocationName: string, expectedInline: string) => {
    const elm = createViewElement(html);
    const location = createLocation(elm, elementPath, offset);
    assert.isTrue(location.isSome(), 'Should be a valid location: ' + html);
    assert.equal(locationName(location.getOrDie()), expectedLocationName, 'Should be expected location');
    Assertions.assertDomEq('Should be expected element', SelectorFind.descendant(elm, expectedInline).getOrDie(), locationElement(location.getOrDie()));
  };

  const testInvalidLocation = (html: string, elementPath: number[], offset: number) => {
    const elm = createViewElement(html);
    const location = createLocation(elm, elementPath, offset);
    assert.isTrue(location.isNone(), 'Should not be a valid location: ' + html);
  };

  const testFindLocation = (forward: boolean, html: string, elementPath: number[], offset: number, expectedLocationName: string, expectedInline: string) => {
    const elm = createViewElement(html);
    const position = createPosition(elm, elementPath, offset);
    const location = BoundaryLocation.findLocation(forward, isInlineTarget, elm.dom, position);

    Assertions.assertDomEq('Should be expected element', SelectorFind.descendant(elm, expectedInline).getOrDie(), locationElement(location.getOrDie()));
    assert.isTrue(location.isSome(), 'Should be a valid location: ' + html);
    assert.equal(locationName(location.getOrDie()), expectedLocationName, 'Should be expected location');
  };

  const testFindLocationInvalid = (forward: boolean, html: string, elementPath: number[], offset: number) => {
    const elm = createViewElement(html);
    const position = createPosition(elm, elementPath, offset);
    const location = BoundaryLocation.findLocation(forward, isInlineTarget, elm.dom, position);
    assert.isTrue(location.isNone(), 'Should not be a valid location: ' + html);
  };

  const testPrevLocation = Fun.curry(testFindLocation, false);
  const testNextLocation = Fun.curry(testFindLocation, true);
  const testPrevLocationInvalid = Fun.curry(testFindLocationInvalid, false);
  const testNextLocationInvalid = Fun.curry(testFindLocationInvalid, true);

  context('Valid locations', () => {
    it('anchor locations', () => {
      testValidLocation('<p><a href="a">a</a></p>', [ 0 ], 0, 'before', 'a');
      testValidLocation('<p><a href="a">a</a></p>', [ 0, 0, 0 ], 0, 'start', 'a');
      testValidLocation('<p><a href="a">a</a></p>', [ 0, 0, 0 ], 1, 'end', 'a');
      testValidLocation('<p><a href="a">a</a></p>', [ 0 ], 1, 'after', 'a');
      testValidLocation('<p>a<a href="a">a</a></p>', [ 0, 0 ], 1, 'before', 'a');
      testValidLocation('<p><a href="a">a</a>a</p>', [ 0, 1 ], 0, 'after', 'a');
      testValidLocation('<p><a href="a">ab</a></p>', [ 0, 0, 0 ], 0, 'start', 'a');
      testValidLocation('<p><a href="a">ab</a></p>', [ 0, 0, 0 ], 2, 'end', 'a');
      testValidLocation('<p><img src="a"><a href="a">a</a></p>', [ 0 ], 1, 'before', 'a');
      testValidLocation('<p><a href="a"><img src="a"></a></p>', [ 0, 0 ], 0, 'start', 'a');
      testValidLocation('<p><a href="a"><img src="a"></a></p>', [ 0, 0 ], 1, 'end', 'a');
      testValidLocation('<p><a href="a">a</a><img src="a"></p>', [ 0 ], 1, 'after', 'a');
      testValidLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [ 0 ], 1, 'after', 'a');
      testValidLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [ 1 ], 0, 'before', 'p:nth-child(2) a');
    });

    it('code locations', () => {
      testValidLocation('<p><code>a</code></p>', [ 0 ], 0, 'before', 'code');
      testValidLocation('<p><code>a</code></p>', [ 0, 0 ], 0, 'start', 'code');
      testValidLocation('<p><code>a</code></p>', [ 0, 0 ], 1, 'end', 'code');
      testValidLocation('<p><code>a</code></p>', [ 0 ], 1, 'after', 'code');
    });

    it('anchor + code locations', () => {
      testValidLocation('<p><a href="#"><code>a</code></a></p>', [ 0 ], 0, 'before', 'a');
      testValidLocation('<p><a href="#"><code>a</code></a></p>', [ 0, 0, 0 ], 0, 'start', 'a');
      testValidLocation('<p><a href="#"><code>a</code></a></p>', [ 0, 0, 0 ], 1, 'end', 'a');
      testValidLocation('<p><a href="#"><code>a</code></a></p>', [ 0 ], 1, 'after', 'a');
    });
  });

  it('Valid zwsp locations', () => {
    testValidLocation('<p>' + ZWSP + '<a href="a">a</a></p>', [ 0, 0 ], 0, 'before', 'a');
    testValidLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1, 'start', 'a');
    testValidLocation('<p><a href="a">a' + ZWSP + '</a></p>', [ 0, 0, 0 ], 1, 'end', 'a');
    testValidLocation('<p><a href="a">a</a>' + ZWSP + '</p>', [ 0, 1 ], 1, 'after', 'a');
  });

  context('Invalid locations', () => {
    it('paragraph locations', () => {
      testInvalidLocation('<p>a</p>', [ 0, 0 ], 0);
      testInvalidLocation('<p><b>a</b></p>', [ 0 ], 0);
      testInvalidLocation('<p><b>a</b></p>', [ 0 ], 1);
    });

    it('anchor locations', () => {
      testInvalidLocation('<p>a<a href="a">a</a>b</p>', [ 0, 0 ], 0);
      testInvalidLocation('<p>a<a href="a">a</a>b</p>', [ 0, 2 ], 1);
      testInvalidLocation('<p><img src="a"><a href="a">a</a></p>', [ 0 ], 0);
      testInvalidLocation('<p><a href="a">a</a><img src="a"></p>', [ 0 ], 2);
      testInvalidLocation('<p><a href="a"><img src="a"><img src="a"></a><img src="a"></p>', [ 0, 0 ], 1);
      testInvalidLocation('<p dir="rtl"><a href="a">a</a></p>', [ 0, 0, 0 ], 0);
      testInvalidLocation('<p><a href="a">\u05D4</a></p>', [ 0, 0, 0 ], 0);
    });

    it('anchor + code locations', () => {
      testInvalidLocation('<p><a href="#">a<code>b</code>c</a></p>', [ 0, 0, 0 ], 1);
      testInvalidLocation('<p><a href="#">a<code>b</code>c</a></p>', [ 0, 0, 2 ], 0);
    });

    it('format caret parent', () => {
      testInvalidLocation('<p><span id="_mce_caret">a</span></p>', [ 0, 0, 0 ], 0);
      testInvalidLocation('<p><span id="_mce_caret"><code>a</code></span></p>', [ 0, 0, 0, 0 ], 0);
    });
  });

  it('Previous locations', () => {
    testPrevLocation('<p><a href="a">a</a>b</p>', [ 0, 1 ], 1, 'after', 'a');
    testPrevLocation('<p><a href="a">a</a></p>', [ 0 ], 1, 'end', 'a');
    testPrevLocation('<p><a href="a">a</a></p>', [ 0, 0, 0 ], 1, 'start', 'a');
    testPrevLocation('<p><a href="a">a</a></p>', [ 0, 0, 0 ], 0, 'before', 'a');
    testPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [ 0 ], 1, 'end', 'a');
    testPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [ 0, 0 ], 1, 'start', 'a');
    testPrevLocation('<p><a href="a"><img src="about:blank"></a></p>', [ 0, 0 ], 0, 'before', 'a');
  });

  it('Previous locations between inlines', () => {
    testPrevLocation('<p><a href="a">a</a><a href="b">b</a></p>', [ 0, 1, 0 ], 0, 'before', 'a:nth-child(2)');
  });

  it('Previous locations between blocks', () => {
    testPrevLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [ 1 ], 0, 'end', 'p:nth-child(1) a');
    testPrevLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [ 1, 0, 0 ], 0, 'before', 'p:nth-child(2) a');
    testPrevLocation('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [ 1, 0, 0 ], 0, 'before', 'p:nth-child(2) a');
    testPrevLocation('<p><a href="a">a</a><br /></p><p><a href="c">c</a></p>', [ 1 ], 0, 'after', 'p:nth-child(1) a');
    testPrevLocationInvalid('<p><a href="a">a</a></p><p>b<a href="c">c</a></p>', [ 1, 0 ], 1);
    testPrevLocationInvalid('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [ 1 ], 0);
  });

  it('Previous zwsp locations', () => {
    testPrevLocation('<p><a href="a">a</a>' + ZWSP + 'b</p>', [ 0, 1 ], 2, 'after', 'a');
    testPrevLocation('<p><a href="a">a</a>' + ZWSP + '</p>', [ 0, 1 ], 1, 'end', 'a');
    testPrevLocation('<p><a href="a">a' + ZWSP + '</a></p>', [ 0, 0, 0 ], 1, 'start', 'a');
    testPrevLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1, 'before', 'a');
  });

  it('Next locations', () => {
    testNextLocation('<p>a<a href="a">b</a></p>', [ 0, 0 ], 0, 'before', 'a');
    testNextLocation('<p><a href="a">a</a></p>', [ 0 ], 0, 'start', 'a');
    testNextLocation('<p><a href="a">a</a></p>', [ 0, 0, 0 ], 0, 'end', 'a');
    testNextLocation('<p><a href="a">a</a></p>', [ 0, 0, 0 ], 1, 'after', 'a');
    testNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [ 0 ], 0, 'start', 'a');
    testNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [ 0, 0 ], 0, 'end', 'a');
    testNextLocation('<p><a href="a"><img src="about:blank"></a></p>', [ 0, 0 ], 1, 'after', 'a');
  });

  it('Next locations between inlines', () => {
    testNextLocation('<p><a href="a">a</a><a href="a">b</a></p>', [ 0, 0, 0 ], 1, 'after', 'a:nth-child(1)');
  });

  it('Next locations between blocks', () => {
    testNextLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [ 0 ], 1, 'start', 'p:nth-child(2) a');
    testNextLocation('<p><a href="a">a</a></p><p><a href="b">b</a></p>', [ 0, 0, 0 ], 1, 'after', 'p:nth-child(1) a');
    testNextLocationInvalid('<p><a href="a">a</a>b</p><p><a href="c">c</a></p>', [ 0, 1 ], 0);
    testNextLocationInvalid('<p><a href="a">a</a></p><p>b<a href="c">c</a></p>', [ 0 ], 1);
  });

  it('Next zwsp locations', () => {
    testNextLocation('<p>a' + ZWSP + '<a href="a">b</a></p>', [ 0, 0 ], 0, 'before', 'a');
    testNextLocation('<p>' + ZWSP + '<a href="a">a</a></p>', [ 0 ], 0, 'start', 'a');
    testNextLocation('<p><a href="a">' + ZWSP + 'a</a></p>', [ 0, 0, 0 ], 1, 'end', 'a');
    testNextLocation('<p><a href="a">a' + ZWSP + '</a></p>', [ 0, 0, 0 ], 1, 'after', 'a');
  });
});
