import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Class from 'ephox/sugar/api/properties/Class';
import * as Classes from 'ephox/sugar/api/properties/Classes';
import Element from 'ephox/sugar/api/node/Element';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('ClassTest', function () {
  const c = Div();
  const m = MathElement();

  const check = function (blob, spot, mogel, t) {
    assert.eq(blob, Class.has(c, 'blob'));
    assert.eq(spot, Class.has(c, 'spot'));
    assert.eq(mogel, Class.has(c, 'mogel'));
    assert.eq(t, Class.has(c, 't'));
  };

  check(false, false, false, false);
  Class.add(c, 'blob');
  check(true, false, false, false);

  Class.remove(c, 'blob');
  check(false, false, false, false);
  assert.eq(false, Attr.has(c, 'class'), 'empty class attribute was not removed');

  Class.add(c, 'blob');
  check(true, false, false, false);

  Class.add(c, 'spot');
  check(true, true, false, false);

  Classes.add(c, ['mogel', 't']);
  check(true, true, true, true);

  assert.eq(['blob', 'spot', 'mogel', 't'], Classes.get(c));

  Classes.remove(c, ['mogel', 't']);
  check(true, true, false, false);
  assert.eq(['blob', 'spot'], Classes.get(c));

  Class.remove(c, 'blob');
  check(false, true, false, false);

  assert.eq(true, Class.toggle(c, 'mogel'));
  check(false, true, true, false);

  assert.eq(false, Class.toggle(c, 'mogel'));
  check(false, true, false, false);

  Class.remove(c, 'spot');
  check(false, false, false, false);
  assert.eq(false, Attr.has(c, 'class'), 'empty class attribute was not removed');

  const incorrect = Element.fromText('a');
  assert.eq(false, Class.has(incorrect, 'anything'));

  assert.eq([], Classes.get(m));

  Classes.add(m, ['a', 'b']);
  assert.eq(['a', 'b'], Classes.get(m));
  Classes.remove(m, ['a', 'b']);
  assert.eq([], Classes.get(m));
  assert.eq(false, Class.has(m, 'a'));

  Class.toggle(m, 'a');
  assert.eq(['a'], Classes.get(m));
  Class.toggle(m, 'a');
  assert.eq([], Classes.get(m));

  const tgl = Class.toggler(m, 'tglClass');
  assert.eq(false, tgl.isOn());
  tgl.on();
  assert.eq(true, tgl.isOn());
  assert.eq(['tglClass'], Classes.get(m));
  tgl.off();
  assert.eq(false, tgl.isOn());
  assert.eq([], Classes.get(m));
});
