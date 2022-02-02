import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Visibility from 'ephox/sugar/api/view/Visibility';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('VisibilityTest', () => {
  const c = Div();
  assert.eq(false, Visibility.isVisible(c));
  Insert.append(SugarBody.body(), c);
  assert.eq(true, Visibility.isVisible(c));

  Css.set(c, 'display', 'none');
  assert.eq(false, Visibility.isVisible(c));

  const s = SugarElement.fromTag('span');
  assert.eq(false, Visibility.isVisible(s));

  Insert.append(SugarBody.body(), s);
  const expected = PlatformDetection.detect().browser.isFirefox();
  assert.eq(expected, Visibility.isVisible(s)); // tricked you! height and width are zero == hidden

  const d = Div();
  Insert.append(c, d);
  assert.eq(false, Visibility.isVisible(d));

  Css.remove(c, 'display');
  assert.eq(true, Visibility.isVisible(d));
  assert.eq(true, Visibility.isVisible(c));

  Arr.each([ c, d, s ], Remove.remove);
});
