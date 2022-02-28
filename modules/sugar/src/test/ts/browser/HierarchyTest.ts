import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as Compare from 'ephox/sugar/api/dom/Compare';
import * as Hierarchy from 'ephox/sugar/api/dom/Hierarchy';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';

UnitTest.test('HierarchyTest', () => {
  const div = SugarElement.fromTag('div');
  const p1 = SugarElement.fromTag('p');
  const p2 = SugarElement.fromTag('p');
  const p1text = SugarElement.fromText('One');
  const p1textb = SugarElement.fromText(', two');
  const p1span = SugarElement.fromTag('span');
  const p1span1 = SugarElement.fromText('cat');
  const p1span2 = SugarElement.fromText(' dog ');
  const p2br = SugarElement.fromTag('br');

  InsertAll.append(div, [ p1, p2 ]);
  InsertAll.append(p1, [ p1text, p1textb, p1span ]);
  InsertAll.append(p1span, [ p1span1, p1span2 ]);
  Insert.append(p2, p2br);

  Assert.eq('', [ ], Hierarchy.path(div, div).getOrDie());
  Assert.eq('', [ 0 ], Hierarchy.path(div, p1).getOrDie());
  Assert.eq('', [ 1 ], Hierarchy.path(div, p2).getOrDie());
  Assert.eq('', [ 0, 0 ], Hierarchy.path(div, p1text).getOrDie());
  Assert.eq('', [ 0, 1 ], Hierarchy.path(div, p1textb).getOrDie());
  Assert.eq('', [ 0, 2 ], Hierarchy.path(div, p1span).getOrDie());
  Assert.eq('', [ 0, 2, 0 ], Hierarchy.path(div, p1span1).getOrDie());
  Assert.eq('', [ 0, 2, 1 ], Hierarchy.path(div, p1span2).getOrDie());
  Assert.eq('', [ 1, 0 ], Hierarchy.path(div, p2br).getOrDie());

  Assert.eq('', true, Compare.eq(div, Hierarchy.follow(div, []).getOrDie()));
  Assert.eq('', true, Compare.eq(p1, Hierarchy.follow(div, [ 0 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p2, Hierarchy.follow(div, [ 1 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p1text, Hierarchy.follow(div, [ 0, 0 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p1textb, Hierarchy.follow(div, [ 0, 1 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p1span, Hierarchy.follow(div, [ 0, 2 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p1span1, Hierarchy.follow(div, [ 0, 2, 0 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p1span2, Hierarchy.follow(div, [ 0, 2, 1 ]).getOrDie()));
  Assert.eq('', true, Compare.eq(p2br, Hierarchy.follow(div, [ 1, 0 ]).getOrDie()));
});
