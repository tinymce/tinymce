import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import Element from 'ephox/sugar/api/node/Element';
import * as Html from 'ephox/sugar/api/properties/Html';
import { Situ } from 'ephox/sugar/api/selection/Situ';
import * as Prefilter from 'ephox/sugar/selection/quirks/Prefilter';

UnitTest.test('Browser Test: PrefilterTest', () => {
  const root = Element.fromHtml(
    '<div>' +
      '<span>dog</span>' +
      '<br>' +
      '<img>' +
      '<span>cat</span>' +
    '</div>'
  );

  const toString = (situ: Situ) => situ.fold(
    (b) => 'before(' + Html.getOuter(b) + ')',
    (e, o) => 'on(' + Html.getOuter(e) + ', ' + o + ')',
    (a) => 'after(' + Html.getOuter(a) + ')'
  );

  const check = (label: string, expected: string, elementPath: number[], offset: number) => {
    const element = Hierarchy.follow(root, elementPath).getOrDie('Test: ' + label + '. Could not find the element path within root: ' + elementPath);
    const actual = Prefilter.beforeSpecial(element, offset);

    const actualS = toString(actual);
    assert.eq(expected, actualS, 'Test: ' + label + '. Was: ' + actualS + ', but expected: ' + expected);
  };

  check('div 0', 'on(<div><span>dog</span><br><img><span>cat</span></div>, 0)', [ ], 0);
  check('div > span, 0', 'on(<span>dog</span>, 0)', [ 0 ], 0);
  check('div > span, 1', 'on(<span>dog</span>, 1)', [ 0 ], 1);
  check('div > br, 0', 'before(<br>)', [ 1 ], 0);
  check('div > br, 1', 'after(<br>)', [ 1 ], 1);
  check('div > img,  0', 'before(<img>)', [ 2 ], 0);
  check('div > img,  1', 'after(<img>)', [ 2 ], 1);
  check('div > span3, 0', 'on(<span>cat</span>, 0)', [ 3 ], 0);
  check('div > span3, 1', 'on(<span>cat</span>, 1)', [ 3 ], 1);
});
