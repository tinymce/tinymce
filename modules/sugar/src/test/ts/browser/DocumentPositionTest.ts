import { assert, UnitTest } from '@ephox/bedrock-client';
import { Node as DomNode } from '@ephox/dom-globals';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as DocumentPosition from 'ephox/sugar/api/dom/DocumentPosition';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Html from 'ephox/sugar/api/properties/Html';

UnitTest.test('DocumentPositionTest', () => {
  const container = Element.fromTag('div');
  const p1 = Element.fromTag('p');
  const p1t1 = Element.fromText('p1text');
  const p1t2 = Element.fromText('p2text');
  const p1s1 = Element.fromTag('span');
  const p1s1t1 = Element.fromText('spantext');

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

  const check = (expected: boolean, start: Element<DomNode>, soffset: number, finish: Element<DomNode>, foffset: number, msg: string) => {
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
  (() => {
    const div = Element.fromTag('div');
    const p11 = Element.fromTag('p');
    const p2 = Element.fromTag('p');
    const p1text = Element.fromText('One');
    const p1textb = Element.fromText(', two');
    const p1span = Element.fromTag('span');
    const p1span1 = Element.fromText('cat');
    const p1span2 = Element.fromText(' dog ');
    const p2br = Element.fromTag('br');

    InsertAll.append(div, [ p11, p2 ]);
    InsertAll.append(p11, [ p1text, p1textb, p1span ]);
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
      'lca(div,0,div,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(div, 0, div, 0)) + `, expected: '<div>...'`);
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(p11, 0, p2, 0)),
      'lca(p1,0,p2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p11, 0, p2, 0)) + `, expected: '<div>...'`);
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(div, 1, div, 2)),
      'lca(div,1,div,2)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(div, 1, div, 2)) + `, expected: '<div>...'`);
    assert.eq(true, Compare.eq(div, DocumentPosition.commonAncestorContainer(p1span1, 0, p2br, 0)),
      'lca(p1span1,0,p2br,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1span1, 0, p2br, 0)) + `, expected: '<div>...'`);
    assert.eq(true, Compare.eq(p11, DocumentPosition.commonAncestorContainer(p1text, 0, p1span2, 0)),
      'lca(p1text,0,p1span2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1text, 0, p1span2, 0)) + `, expected: 'p1': <p>One, two...`);
    assert.eq(true, Compare.eq(p1span, DocumentPosition.commonAncestorContainer(p1span1, 0, p1span2, 0)),
      'lca(p1span1,0,p1span2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1span1, 0, p1span2, 0)) + `, expected: 'p1span': <span>cat dog </span>`);
  })();
});
