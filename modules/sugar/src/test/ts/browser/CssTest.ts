import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Option } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Css from 'ephox/sugar/api/properties/Css';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';

UnitTest.test('CssTest', function () {
  const runChecks = function (connected) {
    const c = Div();
    const m = MathElement();
    if (connected) {
      Insert.append(Body.body(), c);
    }

    Insert.append(Body.body(), m);

    const check = function (k, v1, v2) {
      Css.set(c, k, v1);
      Css.set(m, k, v1); // Just checking that the element
      assert.eq(v1, Css.get(c, k));
      Css.set(c, k, v2);
      assert.eq(v2, Css.get(c, k));
    };

    check('background-color', 'rgb(10, 20, 30)', 'rgb(40, 50, 11)');
    check('display', 'none', 'block');

    Css.set(c, 'position', 'relative'); // so that z-index actually does something
    check('z-index', '-1', '2');

    const c2 = Div();
    Css.copy(c, c2);
    Css.copy(m, c2);

    // NOTE: Safari seems to support styles for math ml tags, so the Css.copy(m, c2) clobbers the previous style
    if (PlatformDetection.detect().browser.isSafari()) { Css.copy(c, c2); }

    Css.get(m, 'display');
    Css.getRaw(m, 'bogus');

    assert.eq('rgb(40, 50, 11)', Css.get(c2, 'background-color'));
    assert.eq('block', Css.get(c2, 'display'));

    // getRaw
    const d = Div();
    if (connected) {
      Insert.append(Body.body(), d);
    }
    assert.eq(true, Css.getRaw(d, 'bogus').isNone());

    assert.eq(true, Css.getRaw(d, 'display').isNone());
    Css.set(d, 'display', 'inline-block');
    assert.eq(true, Css.getRaw(d, 'display').isSome());
    assert.eq('inline-block', Css.getRaw(d, 'display').getOrDie('Option expecting: inline-block'));
    Css.remove(d, 'display');
    assert.eq(true, Css.getRaw(d, 'display').isNone());
    assert.eq(false, Attr.has(d, 'style'));
    Css.set(d, 'font-size', '12px');
    assert.eq(true, Css.getRaw(d, 'font-size').isSome());
    Css.remove(d, 'font-size');
    assert.eq(false, Css.getRaw(d, 'font-size').isSome());
    Css.set(d, 'background-color', 'rgb(12, 213, 12)');
    assert.eq('rgb(12, 213, 12)', Css.getRaw(d, 'background-color').getOrDie('Option expecting: rgb(12,213,12)'));
    Css.remove(d, 'background-color');

    // getAllRaw
    const bulkStyles = {
      'display': 'inline-block',
      'font-size': '12px',
      'background-color': 'rgb(12, 213, 12)'
    };

    Css.setAll(d, bulkStyles);
    assert.eq(bulkStyles, Css.getAllRaw(d));
    Attr.remove(d, 'style');

    // validate
    assert.eq(true, Css.isValidValue('span', 'font-size', 'small'));
    assert.eq(true, Css.isValidValue('span', 'font-size', '12px'));
    assert.eq(false, Css.isValidValue('span', 'font-size', 'biggest'));
    assert.eq(true, Css.isValidValue('span', 'display', 'inline-block'));
    assert.eq(false, Css.isValidValue('span', 'display', 'on'));
    assert.eq(true, Css.isValidValue('span', 'background-color', '#232323'));
    assert.eq(false, Css.isValidValue('span', 'backgroundColor', '#2323'));
    assert.eq(false, Css.isValidValue('span', 'font-size', 'value'));
    assert.eq(true, Css.isValidValue('span', 'margin-top', '23px'));

    const play = Div();
    if (connected) {
      Insert.append(Body.body(), play);
    }

    // ensure preserve works correctly when there are no styles
    Css.preserve(play, function (e) {
      Css.set(e, 'left', '0px');
    });
    if (!(Attr.get(play, 'style') === '' || Attr.get(play, 'style') === undefined)) {
      assert.fail('lack of styles should have been preserved, was "' + Attr.get(play, 'style') + '"');
    }

    Css.setAll(play, {
      'left': '0px',
      'right': '0px',
      'font-size': '12px'
    });
    assert.eq(true, Css.getRaw(play, 'font-size').isSome());
    Css.preserve(play, function (el) {
      Css.remove(el, 'font-size');
      assert.eq(false, Css.getRaw(play, 'font-size').isSome());
    });
    assert.eq(true, Css.getRaw(play, 'font-size').isSome(), 'Font size should have been preserved');

    Css.setOptions(play, {
      'left': Option.none(),
      'right': Option.none(),
      'top': Option.some('0px'),
      'bottom': Option.some('0px'),
      'font-size': Option.none(),
      'font-family': Option.some('Arial')
    });

    assert.eq(true, Css.getRaw(play, 'left').isNone());
    assert.eq(true, Css.getRaw(play, 'right').isNone());
    assert.eq(true, Css.getRaw(play, 'font-size').isNone());
    assert.eq(true, Css.getRaw(play, 'top').isSome());
    assert.eq(true, Css.getRaw(play, 'bottom').isSome());
    assert.eq(true, Css.getRaw(play, 'font-family').isSome());

    // final cleanup
    Arr.each([c, d, play], Remove.remove);

  };

  runChecks(true);
  runChecks(false);
});
