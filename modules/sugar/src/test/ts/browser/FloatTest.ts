import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Float from 'ephox/sugar/api/properties/Float';
import MathElement from 'ephox/sugar/test/MathElement';

UnitTest.test('FloatTest', () => {
  const image = Element.fromTag('table');
  const m = MathElement();
  assert.eq(null, Float.getRaw(image));
  Float.getRaw(m);

  Insert.append(Body.body(), image);
  Insert.append(Body.body(), m);
  Css.setAll(image, {
    'margin-left': 'auto',
    'margin-right': 'auto'
  });

  assert.eq('center', Float.divine(image).getOrDie());

  Float.divine(m);
  Float.getRaw(m);
  Css.remove(m, 'margin-right');
  assert.eq(false, Float.isCentered(m));
  Css.set(m, 'float', 'none');

  assert.eq(true, Float.isCentered(image));

  Css.remove(image, 'margin-left');
  Css.remove(image, 'margin-right');

  assert.eq('none', Float.divine(image).getOrDie());

  Css.set(image, 'float', 'none');
  assert.eq('none', Float.divine(image).getOrDie());
  assert.eq('none', Float.getRaw(image));

  Css.set(image, 'float', 'right');
  assert.eq('right', Float.divine(image).getOrDie());

  assert.eq(false, Float.isCentered(image));
  Float.setCentered(image);
  assert.eq(true, Float.isCentered(image));

  Remove.remove(image);
});
