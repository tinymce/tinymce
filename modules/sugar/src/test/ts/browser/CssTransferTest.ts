import { assert, UnitTest } from '@ephox/bedrock';
import { Arr, Obj } from '@ephox/katamari';
import * as Css from 'ephox/sugar/api/properties/Css';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('CssTransfer', function () {
  const alpha = function () {
    const r = Div();
    Css.setAll(r, {
      'display': 'inline',
      'background-color': 'blue'
    });
    return r;
  };

  const beta = function () {
    const r = Div();
    Css.setAll(r, {
      display: 'block',
      border: '1px solid black'
    });
    return r;
  };

  const gamma = function () {
    const r = Div();
    Css.setAll(r, {
      'background-color': 'red'
    });
    return r;
  };

  const check = function (expectedPresent, expectedAbsent, source, destination, styles) {
    Css.transfer(source, destination, styles);
    Arr.each(expectedAbsent, function (k) {
      if (Css.getRaw(destination, k).isSome()) { assert.fail('Result should not have style: ' + k); }
    });

    Obj.each(expectedPresent, function (v, k) {
      const value = Css.getRaw(destination, k).getOrDie('Result should have style: ' + k);
      assert.eq(v, value);
    });
  };

  check({
    'display': 'block',
    'background-color': 'blue',
    'border': '1px solid black'
  }, [ 'text-align' ], alpha(), beta(), [ 'display', 'background-color' ]);

  check({
    'display': 'block',
    'background-color': 'blue',
    'border': '1px solid black'
  }, [ 'text-align' ], alpha(), beta(), [ 'background-color' ]);

  check({
    display: 'block',
    border: '1px solid black'
  }, [ 'background-color' ], alpha(), beta(), [ 'display' ]);

  check({
    'display': 'inline',
    'background-color': 'red'
  }, [ ], alpha(), gamma(), [ 'display' ]);

  check({
    'background-color': 'red'
  }, [ 'display' ], alpha(), gamma(), [ ]);

  check({
    'display': 'block',
    'border': '1px solid black',
    'background-color': 'red'
  }, [ ], beta(), gamma(), [ 'display', 'border', 'background-color' ]);

  check({
    'display': 'block',
    'background-color': 'red'
  }, [ 'border' ], beta(), gamma(), [ 'display', 'background-color' ]);
});
