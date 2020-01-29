import * as Checked from 'ephox/sugar/api/properties/Checked';
import Element from 'ephox/sugar/api/node/Element';
import * as InsertAll from 'ephox/sugar/api/dom/InsertAll';
import * as Value from 'ephox/sugar/api/properties/Value';
import { UnitTest } from '@ephox/bedrock-client';
import { HTMLInputElement } from '@ephox/dom-globals';
import { KAssert } from '@ephox/katamari-assertions';

UnitTest.test('CheckedTest', function () {
  const container = Element.fromTag('div');

  const alpha = Element.fromHtml<HTMLInputElement>('<input type="radio" value="alpha"></input>');
  const beta = Element.fromHtml<HTMLInputElement>('<input type="radio" value="beta"></input>');
  const gamma = Element.fromHtml<HTMLInputElement>('<input type="radio" value="gamma"></input>');

  InsertAll.append(container, [ alpha, beta, gamma ]);

  KAssert.eqNone('eq', Checked.find(container));
  Checked.set(beta, true);
  KAssert.eqSome('eq', 'beta', Checked.find(container).map(Value.get));
  Checked.set(alpha, true);
  KAssert.eqSome('eq', 'alpha', Checked.find(container).map(Value.get));
});
