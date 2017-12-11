import { Arr } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import Insert from 'ephox/sugar/api/dom/Insert';
import Remove from 'ephox/sugar/api/dom/Remove';
import Body from 'ephox/sugar/api/node/Body';
import Element from 'ephox/sugar/api/node/Element';
import Css from 'ephox/sugar/api/properties/Css';
import Visibility from 'ephox/sugar/api/view/Visibility';
import Div from 'ephox/sugar/test/Div';
import { UnitTest, assert } from '@ephox/refute';

UnitTest.test('VisibilityTest', function() {
  var c = Div();
  assert.eq(false, Visibility.isVisible(c));
  Insert.append(Body.body(), c);
  assert.eq(true, Visibility.isVisible(c));

  Css.set(c, 'display', 'none');
  assert.eq(false, Visibility.isVisible(c));

  var s = Element.fromTag('span');
  assert.eq(false, Visibility.isVisible(s));

  Insert.append(Body.body(), s);
  var expected = PlatformDetection.detect().browser.isFirefox();
  assert.eq(expected, Visibility.isVisible(s)); // tricked you! height and width are zero == hidden

  var d = Div();
  Insert.append(c, d);
  assert.eq(false, Visibility.isVisible(d));

  Css.remove(c, 'display');
  assert.eq(true, Visibility.isVisible(d));
  assert.eq(true, Visibility.isVisible(c));


  Arr.each([c, d, s], Remove.remove);
});

