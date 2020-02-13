import { assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('AttrTransfer', function () {
  const alpha = function () {
    const r = Div();
    Attr.setAll(r, {
      title: 'monkey',
      placeholder: 'start typing'
    });
    return r;
  };

  const beta = function () {
    const r = Div();
    Attr.setAll(r, {
      title: 'chimp',
      name: 'anon'
    });
    return r;
  };

  const gamma = function () {
    const r = Div();
    Attr.setAll(r, {
      placeholder: 'lookup'
    });
    return r;
  };

  const check = function (expectedPresent, expectedAbsent, source, destination, attributes) {
    Attr.transfer(source, destination, attributes);
    Arr.each(expectedAbsent, function (k) {
      if (Attr.has(destination, k)) { assert.fail('Result should not have attribute: ' + k); }
    });

    Obj.each(expectedPresent, function (v, k) {
      if (!Attr.has(destination, k)) { assert.fail('Result should have attribute: ' + k); } else { assert.eq(v, Attr.get(destination, k)); }
    });
  };

  check({
    title: 'chimp',
    placeholder: 'start typing',
    name: 'anon'
  }, [ 'id' ], alpha(), beta(), [ 'title', 'placeholder' ]);

  check({
    title: 'chimp',
    placeholder: 'start typing',
    name: 'anon'
  }, [ 'id' ], alpha(), beta(), [ 'placeholder' ]);

  check({
    title: 'chimp',
    name: 'anon'
  }, [ 'placeholder' ], alpha(), beta(), [ 'title' ]);

  check({
    title: 'monkey',
    placeholder: 'lookup'
  }, [ ], alpha(), gamma(), [ 'title' ]);

  check({
    placeholder: 'lookup'
  }, [ 'title' ], alpha(), gamma(), [ ]);

  check({
    title: 'chimp',
    name: 'anon',
    placeholder: 'lookup'
  }, [ ], beta(), gamma(), [ 'title', 'name', 'placeholder' ]);

  check({
    title: 'chimp',
    placeholder: 'lookup'
  }, [ 'name' ], beta(), gamma(), [ 'title', 'placeholder' ]);
});
