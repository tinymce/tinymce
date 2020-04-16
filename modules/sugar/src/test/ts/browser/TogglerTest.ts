import { assert, UnitTest } from '@ephox/bedrock-client';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Class from 'ephox/sugar/api/properties/Class';
import * as Css from 'ephox/sugar/api/properties/Css';
import * as Visibility from 'ephox/sugar/api/view/Visibility';
import Div from 'ephox/sugar/test/Div';

interface ToggleApi {
  toggle: () => void;
  on: () => void;
  off: () => void;
  isOn: () => boolean;
}

UnitTest.test('TogglerTest', () => {
  const runCheck = (toggler: ToggleApi, check: (expected: boolean) => void) => {
    check(false);
    toggler.toggle();
    check(true);
    toggler.toggle();
    check(false);

    toggler.on();
    assert.eq(true, toggler.isOn());
    check(true);
    toggler.on();
    assert.eq(true, toggler.isOn());
    check(true);

    toggler.off();
    assert.eq(false, toggler.isOn());
    check(false);
    toggler.off();
    assert.eq(false, toggler.isOn());
    check(false);

    toggler.on();
    toggler.off();
    assert.eq(false, toggler.isOn());
    check(false);
  };

  // this is all due for a good refactoring

  const checkClass = (has: boolean) => {
    assert.eq(has, Class.has(c, 'blob'));
  };

  let c = Div();
  runCheck(Class.toggler(c, 'blob'), checkClass);
  c = Div();
  Insert.append(Body.body(), c);
  runCheck(Class.toggler(c, 'blob'), checkClass);
  Remove.remove(c);

  // CSS toggles are silly - we should delete this and do it in a way that does not require detection

  const checkDisplayBlockRemoved = (has: boolean) => {
    // oh IE, you bastard
    // var isie = PlatformDetection.detect().browser.isIE();
    // var off = isie ? 'block' : undefined;
    const v = has ? 'none' : 'block';
    assert.eq(v, Css.get(c, 'display'));
  };

  // behaviour when not connected and not specified - which the link dialog relies on
  c = Div();
  let vis = Visibility.displayToggler(c, 'block');
  Insert.append(Body.body(), c);
  runCheck(vis, checkDisplayBlockRemoved);
  Remove.remove(c);

  const checkDisplayBlockNone = (has: boolean) => {
    const v = has ? 'block' : 'none';
    assert.eq(v, Css.get(c, 'display'));
  };

  // normal behaviour
  c = Div();
  Css.set(c, 'display', 'none');
  runCheck(Visibility.displayToggler(c, 'block'), checkDisplayBlockNone);
  Insert.append(Body.body(), c);
  runCheck(Visibility.displayToggler(c, 'block'), checkDisplayBlockNone);
  Remove.remove(c);

  const checkVisibilityVisibleRemoved = (has: boolean) => {
    const v = has ? 'hidden' : 'visible';
    assert.eq(v, Css.get(c, 'visibility'));
  };

  // behaviour when not connected and not specified
  c = Div();
  vis = Visibility.toggler(c);
  Insert.append(Body.body(), c);
  runCheck(vis, checkVisibilityVisibleRemoved);
  Remove.remove(c);

  const checkVisibilityVisibleHidden = (has: boolean) => {
    const v = has ? 'visible' : 'hidden';
    assert.eq(v, Css.get(c, 'visibility'));
  };

  // normal behaviour
  c = Div();
  Css.set(c, 'visibility', 'hidden');
  runCheck(Visibility.toggler(c), checkVisibilityVisibleHidden);
  Insert.append(Body.body(), c);
  runCheck(Visibility.toggler(c), checkVisibilityVisibleHidden);
  Remove.remove(c);
});
