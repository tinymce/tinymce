import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';

import { SugarElement } from 'ephox/sugar/api/node/SugarElement';
import * as Attribute from 'ephox/sugar/api/properties/Attribute';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('AttributeTransfer', () => {
  const alpha = () => {
    const r = Div();
    Attribute.setAll(r, {
      title: 'monkey',
      placeholder: 'start typing'
    });
    return r;
  };

  const beta = () => {
    const r = Div();
    Attribute.setAll(r, {
      title: 'chimp',
      name: 'anon'
    });
    return r;
  };

  const gamma = () => {
    const r = Div();
    Attribute.setAll(r, {
      placeholder: 'lookup'
    });
    return r;
  };

  const check = (expectedPresent: Record<string, any>, expectedAbsent: string[], source: SugarElement<Element>, destination: SugarElement<Element>, attributes: string[]) => {
    Attribute.transfer(source, destination, attributes);
    Arr.each(expectedAbsent, (k) => {
      if (Attribute.has(destination, k)) {
        Assert.fail('Result should not have attribute: ' + k);
      }
    });

    Obj.each(expectedPresent, (v, k) => {
      if (!Attribute.has(destination, k)) {
        Assert.fail('Result should have attribute: ' + k);
      } else {
        Assert.eq('', v, Attribute.get(destination, k));
      }
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
