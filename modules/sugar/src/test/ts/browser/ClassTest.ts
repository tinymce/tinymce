import { Assert, UnitTest } from '@ephox/bedrock-client';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as Class from 'ephox/sugar/api/properties/Class';
import * as Classes from 'ephox/sugar/api/properties/Classes';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';

UnitTest.test('ClassTest', () => {
  const c = Div();
  const m = MathElement();

  const check = (blob: boolean, spot: boolean, mogel: boolean, t: boolean) => {
    Assert.eq('', blob, Class.has(c, 'blob'));
    Assert.eq('', spot, Class.has(c, 'spot'));
    Assert.eq('', mogel, Class.has(c, 'mogel'));
    Assert.eq('', t, Class.has(c, 't'));
  };

  check(false, false, false, false);
  Class.add(c, 'blob');
  check(true, false, false, false);

  Class.remove(c, 'blob');
  check(false, false, false, false);
  Assert.eq('empty class attribute was not removed', false, Attribute.has(c, 'class'));

  Class.add(c, 'blob');
  check(true, false, false, false);

  Class.add(c, 'spot');
  check(true, true, false, false);

  Classes.add(c, [ 'mogel', 't' ]);
  check(true, true, true, true);

  Assert.eq('', [ 'blob', 'spot', 'mogel', 't' ], Classes.get(c));

  Classes.remove(c, [ 'mogel', 't' ]);
  check(true, true, false, false);
  Assert.eq('', [ 'blob', 'spot' ], Classes.get(c));

  Class.remove(c, 'blob');
  check(false, true, false, false);

  Assert.eq('', true, Class.toggle(c, 'mogel'));
  check(false, true, true, false);

  Assert.eq('', false, Class.toggle(c, 'mogel'));
  check(false, true, false, false);

  Class.remove(c, 'spot');
  check(false, false, false, false);
  Assert.eq('empty class attribute was not removed', false, Attribute.has(c, 'class'));

  Class.toggle(c, 'spot');
  check(false, true, false, false);
  Class.toggle(c, 'spot');
  check(false, false, false, false);
  Assert.eq('empty class attribute was not removed', false, Attribute.has(c, 'class'));

  const incorrect = SugarElement.fromText('a');
  Assert.eq('', false, Class.has(incorrect, 'anything'));

  Assert.eq('', [], Classes.get(m));

  Classes.add(m, [ 'a', 'b' ]);
  Assert.eq('', [ 'a', 'b' ], Classes.get(m));
  Classes.remove(m, [ 'a', 'b' ]);
  Assert.eq('', [], Classes.get(m));
  Assert.eq('', false, Class.has(m, 'a'));

  Class.toggle(m, 'a');
  Assert.eq('', [ 'a' ], Classes.get(m));
  Class.toggle(m, 'a');
  Assert.eq('', [], Classes.get(m));

  const tgl = Class.toggler(m, 'tglClass');
  Assert.eq('', false, tgl.isOn());
  tgl.on();
  Assert.eq('', true, tgl.isOn());
  Assert.eq('', [ 'tglClass' ], Classes.get(m));
  tgl.off();
  Assert.eq('', false, tgl.isOn());
  Assert.eq('', [], Classes.get(m));
});
