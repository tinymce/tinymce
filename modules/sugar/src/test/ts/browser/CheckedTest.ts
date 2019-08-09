import * as Checked from 'ephox/sugar/api/properties/Checked';
import Element from 'ephox/sugar/api/node/Element';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Value from 'ephox/sugar/api/properties/Value';
import { UnitTest, assert } from '@ephox/bedrock';
import { HTMLInputElement } from '@ephox/dom-globals';

UnitTest.test('CheckedTest', function () {
  const container = Element.fromTag('div');

  const alpha = Element.fromHtml<HTMLInputElement>('<input type="radio" value="alpha"></input>');
  const beta = Element.fromHtml<HTMLInputElement>('<input type="radio" value="beta"></input>');
  const gamma = Element.fromHtml<HTMLInputElement>('<input type="radio" value="gamma"></input>');

  InsertAll.append(container, [ alpha, beta, gamma ]);

  assert.eq(true, Checked.find(container).isNone());
  Checked.set(beta, true);
  assert.eq('beta', Value.get(Checked.find(container).getOrDie()));
  Checked.set(alpha, true);
  assert.eq('alpha', Value.get(Checked.find(container).getOrDie()));
});
