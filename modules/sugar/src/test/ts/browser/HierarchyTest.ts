import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import Element from 'ephox/sugar/api/node/Element';

UnitTest.test('HierarchyTest', () => {
  const div = Element.fromTag('div');
  const p1 = Element.fromTag('p');
  const p2 = Element.fromTag('p');
  const p1text = Element.fromText('One');
  const p1textb = Element.fromText(', two');
  const p1span = Element.fromTag('span');
  const p1span1 = Element.fromText('cat');
  const p1span2 = Element.fromText(' dog ');
  const p2br = Element.fromTag('br');

  InsertAll.append(div, [ p1, p2 ]);
  InsertAll.append(p1, [ p1text, p1textb, p1span ]);
  InsertAll.append(p1span, [ p1span1, p1span2 ]);
  Insert.append(p2, p2br);

  assert.eq([ ], Hierarchy.path(div, div).getOrDie());
  assert.eq([ 0 ], Hierarchy.path(div, p1).getOrDie());
  assert.eq([ 1 ], Hierarchy.path(div, p2).getOrDie());
  assert.eq([ 0, 0 ], Hierarchy.path(div, p1text).getOrDie());
  assert.eq([ 0, 1 ], Hierarchy.path(div, p1textb).getOrDie());
  assert.eq([ 0, 2 ], Hierarchy.path(div, p1span).getOrDie());
  assert.eq([ 0, 2, 0 ], Hierarchy.path(div, p1span1).getOrDie());
  assert.eq([ 0, 2, 1 ], Hierarchy.path(div, p1span2).getOrDie());
  assert.eq([ 1, 0 ], Hierarchy.path(div, p2br).getOrDie());

  assert.eq(true, Compare.eq(div, Hierarchy.follow(div, []).getOrDie()));
  assert.eq(true, Compare.eq(p1, Hierarchy.follow(div, [ 0 ]).getOrDie()));
  assert.eq(true, Compare.eq(p2, Hierarchy.follow(div, [ 1 ]).getOrDie()));
  assert.eq(true, Compare.eq(p1text, Hierarchy.follow(div, [ 0, 0 ]).getOrDie()));
  assert.eq(true, Compare.eq(p1textb, Hierarchy.follow(div, [ 0, 1 ]).getOrDie()));
  assert.eq(true, Compare.eq(p1span, Hierarchy.follow(div, [ 0, 2 ]).getOrDie()));
  assert.eq(true, Compare.eq(p1span1, Hierarchy.follow(div, [ 0, 2, 0 ]).getOrDie()));
  assert.eq(true, Compare.eq(p1span2, Hierarchy.follow(div, [ 0, 2, 1 ]).getOrDie()));
  assert.eq(true, Compare.eq(p2br, Hierarchy.follow(div, [ 1, 0 ]).getOrDie()));
});
