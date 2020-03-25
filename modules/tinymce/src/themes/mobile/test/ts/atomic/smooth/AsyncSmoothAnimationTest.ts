import { assert, UnitTest } from '@ephox/bedrock-client';
import { Fun, Future } from '@ephox/katamari';

import * as SmoothAnimation from 'tinymce/themes/mobile/ios/smooth/SmoothAnimation';

UnitTest.asynctest('SmoothAnimationTest', function () {
  const success = arguments[arguments.length - 2];

  const animator = SmoothAnimation.create();

  const check = function (label, initial, destination, amount) {
    return Future.nu(function (callback) {
      let current = initial;
      let values = [ current ];

      const add = function (val, abort) {
        if (val > 100) {
          abort('abort');
        } else {
          current = val;
          values = values.concat([ val ]);
        }
      };

      animator.animate(function () {
        return current;
      }, destination, amount, add, function (s) {
        add(s, Fun.identity);
        callback({
          label,
          info: {
            current,
            values
          }
        });
      }, 2);
    });
  };

  const assertInfo = function (label, expected, info) {
    assert.eq(
      expected.current,
      info.current,
      'Test: ' + label + '. Expected current: ' + expected.current + ', but was: ' + info.current
    );
    assert.eq(
      expected.values,
      info.values,
      'Test: ' + label + '. Expected values: ' + expected.values + ', but was: ' + info.values
    );
  };

  check('Test 1', 2, 10, 3).get(function (data1) {
    assertInfo(data1.label, { current: 10, values: [ 2, 5, 8, 10 ] }, data1.info);
    check('Test 2', 15, 9, 4).get(function (data2) {
      assertInfo(data2.label, { current: 9, values: [ 15, 11, 9 ] }, data2.info);
      check('Test 3: jump to end', 15, 9, -4).get(function (data3) {
        assertInfo(data3.label, { current: 9, values: [ 15, 19, /* jump to end*/9 ] }, data3.info);
        check('Test 4: abort', 10, 1000, 50).get(function (data4) {
          assertInfo(data4.label, { current: 'abort', values: [ 10, 60, 'abort' ] }, data4.info);
          success();
        });
      });
    });
  });
});
