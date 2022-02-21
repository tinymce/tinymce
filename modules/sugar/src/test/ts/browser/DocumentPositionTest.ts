import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as DocumentPosition from 'ephox/sugar/api/dom/DocumentPosition';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Html from 'ephox/sugar/api/properties/Html';

UnitTest.test('DocumentPositionTest', () => {
  const container = SugarElement.fromTag('div');
  const p1 = SugarElement.fromTag('p');
  const p1t1 = SugarElement.fromText('p1text');
  const p1t2 = SugarElement.fromText('p2text');
  const p1s1 = SugarElement.fromTag('span');
  const p1s1t1 = SugarElement.fromText('spantext');

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

  Insert.append(SugarBody.body(), container);

  const check = (expected: boolean, start: SugarElement<Node>, soffset: number, finish: SugarElement<Node>, foffset: number, msg: string) => {
    Assert.eq(msg, expected, DocumentPosition.after(start, soffset, finish, foffset));
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
    const div = SugarElement.fromTag('div');
    const p11 = SugarElement.fromTag('p');
    const p2 = SugarElement.fromTag('p');
    const p1text = SugarElement.fromText('One');
    const p1textb = SugarElement.fromText(', two');
    const p1span = SugarElement.fromTag('span');
    const p1span1 = SugarElement.fromText('cat');
    const p1span2 = SugarElement.fromText(' dog ');
    const p2br = SugarElement.fromTag('br');

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
    Assert.eq('lca(div,0,div,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(div, 0, div, 0)) + `, expected: '<div>...'`,
      true, Compare.eq(div, DocumentPosition.commonAncestorContainer(div, 0, div, 0)));
    Assert.eq('lca(p1,0,p2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p11, 0, p2, 0)) + `, expected: '<div>...'`,
      true, Compare.eq(div, DocumentPosition.commonAncestorContainer(p11, 0, p2, 0)));
    Assert.eq('lca(div,1,div,2)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(div, 1, div, 2)) + `, expected: '<div>...'`,
      true, Compare.eq(div, DocumentPosition.commonAncestorContainer(div, 1, div, 2)));
    Assert.eq('lca(p1span1,0,p2br,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1span1, 0, p2br, 0)) + `, expected: '<div>...'`,
      true, Compare.eq(div, DocumentPosition.commonAncestorContainer(p1span1, 0, p2br, 0)));
    Assert.eq('lca(p1text,0,p1span2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1text, 0, p1span2, 0)) + `, expected: 'p1': <p>One, two...`,
      true, Compare.eq(p11, DocumentPosition.commonAncestorContainer(p1text, 0, p1span2, 0)));
    Assert.eq('lca(p1span1,0,p1span2,0)===' + Html.getOuter(DocumentPosition.commonAncestorContainer(p1span1, 0, p1span2, 0)) + `, expected: 'p1span': <span>cat dog </span>`,
      true, Compare.eq(p1span, DocumentPosition.commonAncestorContainer(p1span1, 0, p1span2, 0)));
  })();
});
