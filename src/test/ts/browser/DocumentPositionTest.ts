import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as DocumentPosition from 'ephox/sugar/api/dom/DocumentPosition';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Html from 'ephox/sugar/api/properties/Html';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('DocumentPositionTest', function() {
  var container = Element.fromTag('div');
  var p1 = Element.fromTag('p');
  var p1t1 = Element.fromText('p1text');
  var p1t2 = Element.fromText('p2text');
  var p1s1 = Element.fromTag('span');
  var p1s1t1 = Element.fromText('spantext');

  /* Note: this looks like
   * <div>
   *   <p>
   *     p1text
   *     p2text
   *     <span>
   *       spantext
   *     </span>
   *   </p>
   * </div>
   */

  InsertAll.append(container, [ p1 ]);
  InsertAll.append(p1, [ p1t1, p1t2, p1s1 ]);
  InsertAll.append(p1s1, [ p1s1t1 ]);

  Insert.append(Body.body(), container);

  var check = function (expected, start, soffset, finish, foffset, msg) {
    assert.eq(expected, DocumentPosition.after(start, soffset, finish, foffset), msg);
  };

  check(true, container, 1, p1t1, ''.length, 'Selection from (div,end) -> (p1t1,0) should be RTL');
  check(false, p1t1, 0, container, 1, 'Selection from (p1t1,0) -> (div,end) should be LTR');

  check(true, container, 1, p1t1, 'p1text'.length, 'Selection from (div,end) -> (p1t1,end) should be RTL');
  check(false, p1t1, 'p1text'.length, container, 1, 'Selection from (p1t1,end) -> (div,end) should be LTR');

  check(true, container, 1, p1s1t1, 'spantext'.length, 'Selection from (div,end) -> (p1s1t1,end) should be RTL');
  check(false, p1s1t1, 'spantext'.length, container, 1, 'Selection from  (p1s1t1,end) -> (div,end) should be LTR');

  check(true, container, 1, p1, 3, 'Selection from (div,end) -> (p,end) should be RTL');
  check(false, p1, 3, container, 1, 'Selection from (p,end) -> (div,end) should be LTR');

  Remove.remove(container);

  // commonAncestorContainer tests
  (function () {
    var div = Element.fromTag('div');
    var p1 = Element.fromTag('p');
    var p2 = Element.fromTag('p');
    var p1text = Element.fromText('One');
    var p1textb = Element.fromText(', two');
    var p1span = Element.fromTag('span');
    var p1span1 = Element.fromText('cat');
    var p1span2 = Element.fromText(' dog ');
    var p2br = Element.fromTag('br');

    InsertAll.append(div, [ p1, p2 ]);
    InsertAll.append(p1, [ p1text, p1textb, p1span ]);
    InsertAll.append(p1span, [ p1span1, p1span2 ]);
    Insert.append(p2, p2br);
    /* div+-p1
          |  |-p1text
          |  |-p1textb
          |  +-p1span
          |         |-p1span1
          |         +-p1span2
          +-p2
             +-p2br
    */
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(div, 0, div, 0)),
      'lca(div,0,div,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(div, 0, div, 0)) + ', expected: \'<div>...\'');
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(p1, 0, p2, 0)),
      'lca(p1,0,p2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1, 0, p2, 0)) + ', expected: \'<div>...\'');
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(div, 1, div, 2)),
      'lca(div,1,div,2)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(div,1,div,2)) + ', expected: \'<div>...\'');
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(p1span1, 0, p2br, 0)),
      'lca(p1span1,0,p2br,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1span1,0,p2br,0)) + ', expected: \'<div>...\'');
    assert.eq(true, Compare.eq(p1, DocumentPosition.commonAncestorContainer(p1text, 0, p1span2, 0)),
      'lca(p1text,0,p1span2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1text,0,p1span2,0)) + ', expected: \'p1\': <p>One, two...');
    assert.eq(true, Compare.eq(p1span, DocumentPosition.commonAncestorContainer(p1span1, 0, p1span2, 0)),
      'lca(p1span1,0,p1span2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1span1,0,p1span2,0)) + ', expected: \'p1span\': <span>cat dog </span>');
  })();
});

