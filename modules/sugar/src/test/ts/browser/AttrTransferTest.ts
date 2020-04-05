import { assert, UnitTest } from '@ephox/bedrock-client';
import { Element as DomElement } from '@ephox/dom-globals';
import { Arr, Obj } from '@ephox/katamari';
import Element from 'ephox/sugar/api/node/Element';
import * as Attr from 'ephox/sugar/api/properties/Attr';
import Div from 'ephox/sugar/test/Div';

UnitTest.test('AttrTransfer', () => {
  const alpha = () => {
    const r = Div();
    Attr.setAll(r, {
      title: 'monkey',
      placeholder: 'start typing'
    });
    return r;
  };

  const beta = () => {
    const r = Div();
    Attr.setAll(r, {
      title: 'chimp',
      name: 'anon'
    });
    return r;
  };

  const gamma = () => {
    const r = Div();
    Attr.setAll(r, {
      placeholder: 'lookup'
    });
    return r;
  };

  const check = (expectedPresent: Record<string, any>, expectedAbsent: string[], source: Element<DomElement>, destination: Element<DomElement>, attributes: string[]) => {
    Attr.transfer(source, destination, attributes);
    Arr.each(expectedAbsent, (k) => {
      if (Attr.has(destination, k)) {
        assert.fail('Result should not have attribute: ' + k);
      }
    });

    Obj.each(expectedPresent, (v, k) => {
      if (!Attr.has(destination, k)) {
        assert.fail('Result should have attribute: ' + k); } else { assert.eq(v, Attr.get(destination, k));
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
