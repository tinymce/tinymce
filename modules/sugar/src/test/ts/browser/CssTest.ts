import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import { PlatformDetection } from '@ephox/sand';

import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as SugarBody from 'ephox/sugar/api/node/SugarBody';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import * as Css from 'ephox/sugar/api/properties/Css';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';

UnitTest.test('CssTest', () => {
  const runChecks = (connected: boolean) => {
    const c = Div();
    const m = MathElement();
    if (connected) {
      Insert.append(SugarBody.body(), c);
    }

    Insert.append(SugarBody.body(), m);

    const check = (k: string, v1: string, v2: string) => {
      Css.set(c, k, v1);
      Css.set(m, k, v1); // Just checking that the element
      Assert.eq('get', v1, Css.get(c, k));
      Css.set(c, k, v2);
      Assert.eq('get', v2, Css.get(c, k));
    };

    check('background-color', 'rgb(10, 20, 30)', 'rgb(40, 50, 11)');
    check('display', 'none', 'block');

    Css.set(c, 'position', 'relative'); // so that z-index actually does something
    check('z-index', '-1', '2');

    const c2 = Div();
    Css.copy(c, c2);
    Css.copy(m, c2);

    // NOTE: Safari, Firefox 71+ and Chromium 102+ seem to support styles for math ml tags, so the Css.copy(m, c2) clobbers the previous style
    const browser = PlatformDetection.detect().browser;
    if (browser.isSafari() || browser.isFirefox() && browser.version.major >= 71 || browser.isChromium() && browser.version.major >= 102) {
      Css.copy(c, c2);
    }

    Css.get(m, 'display');
    Css.getRaw(m, 'bogus');

    Assert.eq('get', 'rgb(40, 50, 11)', Css.get(c2, 'background-color'));
    Assert.eq('get', 'block', Css.get(c2, 'display'));

    // getRaw
    const d = Div();
    if (connected) {
      Insert.append(SugarBody.body(), d);
    }
    KAssert.eqNone('getRaw bogus', Css.getRaw(d, 'bogus'));

    Assert.eq('getRaw display 1', true, Css.getRaw(d, 'display').isNone());
    Css.set(d, 'display', 'inline-block');
    Assert.eq('getRaw display 2', true, Css.getRaw(d, 'display').isSome());
    Assert.eq('getRaw display 3', 'inline-block', Css.getRaw(d, 'display').getOrDie('Optional expecting: inline-block'));
    Css.remove(d, 'display');
    Assert.eq('getRaw display 4', true, Css.getRaw(d, 'display').isNone());
    Assert.eq('has', false, Attribute.has(d, 'style'));
    Css.set(d, 'font-size', '12px');
    Assert.eq('getRaw font-size 1', true, Css.getRaw(d, 'font-size').isSome());
    Css.remove(d, 'font-size');
    Assert.eq('getRaw font-size 2', false, Css.getRaw(d, 'font-size').isSome());
    Css.set(d, 'background-color', 'rgb(12, 213, 12)');
    Assert.eq('getRaw background-color', 'rgb(12, 213, 12)', Css.getRaw(d, 'background-color').getOrDie('Optional expecting: rgb(12,213,12)'));
    Css.remove(d, 'background-color');

    // getAllRaw
    const bulkStyles = {
      'display': 'inline-block',
      'font-size': '12px',
      'background-color': 'rgb(12, 213, 12)'
    };

    Css.setAll(d, bulkStyles);
    Assert.eq('getAllRaw', bulkStyles, Css.getAllRaw(d));
    Attribute.remove(d, 'style');

    // validate
    Assert.eq('isValidValue', true, Css.isValidValue('span', 'font-size', 'small'));
    Assert.eq('isValidValue', true, Css.isValidValue('span', 'font-size', '12px'));
    Assert.eq('isValidValue', false, Css.isValidValue('span', 'font-size', 'biggest'));
    Assert.eq('isValidValue', true, Css.isValidValue('span', 'display', 'inline-block'));
    Assert.eq('isValidValue', false, Css.isValidValue('span', 'display', 'on'));
    Assert.eq('isValidValue', true, Css.isValidValue('span', 'background-color', '#232323'));
    Assert.eq('isValidValue', false, Css.isValidValue('span', 'backgroundColor', '#2323'));
    Assert.eq('isValidValue', false, Css.isValidValue('span', 'font-size', 'value'));
    Assert.eq('isValidValue', true, Css.isValidValue('span', 'margin-top', '23px'));

    const play = Div();
    if (connected) {
      Insert.append(SugarBody.body(), play);
    }

    // ensure preserve works correctly when there are no styles
    Css.preserve(play, (e) => {
      Css.set(e, 'left', '0px');
    });
    if (!(Attribute.get(play, 'style') === '' || Attribute.get(play, 'style') === undefined)) {
      Assert.fail('lack of styles should have been preserved, was "' + Attribute.get(play, 'style') + '"');
    }

    Css.setAll(play, {
      'left': '0px',
      'right': '0px',
      'font-size': '12px'
    });
    Assert.eq('getRaw', true, Css.getRaw(play, 'font-size').isSome());
    Css.preserve(play, (el) => {
      Css.remove(el, 'font-size');
      Assert.eq('getRaw', false, Css.getRaw(play, 'font-size').isSome());
    });
    Assert.eq('Font size should have been preserved', true, Css.getRaw(play, 'font-size').isSome());

    Css.setOptions(play, {
      'left': Optional.none(),
      'right': Optional.none(),
      'top': Optional.some('0px'),
      'bottom': Optional.some('0px'),
      'font-size': Optional.none(),
      'font-family': Optional.some('Arial')
    });

    KAssert.eqNone('getRaw left', Css.getRaw(play, 'left'));
    KAssert.eqNone('getRaw right', Css.getRaw(play, 'right'));
    KAssert.eqNone('getRaw font-size', Css.getRaw(play, 'font-size'));
    KAssert.eqSome('getRaw top', '0px', Css.getRaw(play, 'top'));
    KAssert.eqSome('getRaw bottom', '0px', Css.getRaw(play, 'bottom'));
    KAssert.eqSome('getRaw font-family', 'Arial', Css.getRaw(play, 'font-family'));

    // final cleanup
    Arr.each([ c, d, play ], Remove.remove);

  };

  runChecks(true);
  runChecks(false);
});
