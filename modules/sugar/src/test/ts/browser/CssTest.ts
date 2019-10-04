import { Assert, UnitTest } from '@ephox/bedrock';
import { Arr, Option, OptionInstances } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import * as Insert from 'ephox/sugar/api/dom/Insert';
import * as Remove from 'ephox/sugar/api/dom/Remove';
import * as Body from 'ephox/sugar/api/node/Body';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import * as Css from 'ephox/sugar/api/properties/Css';
import Div from 'ephox/sugar/test/Div';
import MathElement from 'ephox/sugar/test/MathElement';

const { tOption } = OptionInstances;

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

    // NOTE: Safari seems to support styles for math ml tags, so the Css.copy(m, c2) clobbers the previous style
    if (PlatformDetection.detect().browser.isSafari()) { Css.copy(c, c2); }

    Css.get(m, 'display');
    Css.getRaw(m, 'bogus');

    Assert.eq('get', 'rgb(40, 50, 11)', Css.get(c2, 'background-color'));
    Assert.eq('get', 'block', Css.get(c2, 'display'));

    // getRaw
    const d = Div();
    if (connected) {
      Insert.append(Body.body(), d);
    }
    Assert.eq('getRaw bogus', Option.none(), Css.getRaw(d, 'bogus'), tOption());

    Assert.eq('getRaw display 1', true, Css.getRaw(d, 'display').isNone());
    Css.set(d, 'display', 'inline-block');
    Assert.eq('getRaw display 2', true, Css.getRaw(d, 'display').isSome());
    Assert.eq('getRaw display 3', 'inline-block', Css.getRaw(d, 'display').getOrDie('Option expecting: inline-block'));
    Css.remove(d, 'display');
    Assert.eq('getRaw display 4', true, Css.getRaw(d, 'display').isNone());
    Assert.eq('has', false, Attr.has(d, 'style'));
    Css.set(d, 'font-size', '12px');
    Assert.eq('getRaw font-size 1', true, Css.getRaw(d, 'font-size').isSome());
    Css.remove(d, 'font-size');
    Assert.eq('getRaw font-size 2', false, Css.getRaw(d, 'font-size').isSome());
    Css.set(d, 'background-color', 'rgb(12, 213, 12)');
    Assert.eq('getRaw background-color', 'rgb(12, 213, 12)', Css.getRaw(d, 'background-color').getOrDie('Option expecting: rgb(12,213,12)'));
    Css.remove(d, 'background-color');

    // getAllRaw
    const bulkStyles = {
      'display': 'inline-block',
      'font-size': '12px',
      'background-color': 'rgb(12, 213, 12)'
    };

    Css.setAll(d, bulkStyles);
    Assert.eq('getAllRaw', bulkStyles, Css.getAllRaw(d));
    Attr.remove(d, 'style');

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
      Insert.append(Body.body(), play);
    }

    // ensure preserve works correctly when there are no styles
    Css.preserve(play, function (e) {
      Css.set(e, 'left', '0px');
    });
    if (!(Attr.get(play, 'style') === '' || Attr.get(play, 'style') === undefined)) {
      Assert.fail('lack of styles should have been preserved, was "' + Attr.get(play, 'style') + '"');
    }

    Css.setAll(play, {
      'left': '0px',
      'right': '0px',
      'font-size': '12px'
    });
    Assert.eq('getRaw', true, Css.getRaw(play, 'font-size').isSome());
    Css.preserve(play, function (el) {
      Css.remove(el, 'font-size');
      Assert.eq('getRaw', false, Css.getRaw(play, 'font-size').isSome());
    });
    Assert.eq('Font size should have been preserved', true, Css.getRaw(play, 'font-size').isSome());

    Css.setOptions(play, {
      'left': Option.none(),
      'right': Option.none(),
      'top': Option.some('0px'),
      'bottom': Option.some('0px'),
      'font-size': Option.none(),
      'font-family': Option.some('Arial')
    });

    Assert.eq('getRaw left', Option.none(), Css.getRaw(play, 'left'), tOption());
    Assert.eq('getRaw right', Option.none(), Css.getRaw(play, 'right'), tOption());
    Assert.eq('getRaw font-size', Option.none(), Css.getRaw(play, 'font-size'), tOption());
    Assert.eq('getRaw top', Option.some('0px'), Css.getRaw(play, 'top'), tOption());
    Assert.eq('getRaw bottom', Option.some('0px'), Css.getRaw(play, 'bottom'), tOption());
    Assert.eq('getRaw font-family', Option.some('Arial'), Css.getRaw(play, 'font-family'), tOption());

    // final cleanup
    Arr.each([c, d, play], Remove.remove);

  };

  runChecks(true);
  runChecks(false);
});
