import { Assert, UnitTest } from '@ephox/bedrock-client';
import { ValueSchema } from '@ephox/boulder';
import { Dialog } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';

UnitTest.test('Custom Editor Schema Test', () => {
  const schema = Dialog.customEditorSchema;

  Assert.eq('Expect empty not not be valid', true, ValueSchema.asRaw('empty', schema, {
  }).isError());

  const base = {
    type: 'customeditor',
    name: 'customeditor',
    tag: 'textarea'
  };

  Assert.eq('Expect missing scriptId + scriptUrl or init to not be valid', true, ValueSchema.asRaw('.', schema, base).isError());

  Assert.eq('Expect missing scriptUrl to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId'
  }).isError());

  Assert.eq('Expect missing scriptId to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptUrl: 'scriptUrl'
  }).isError());

  Assert.eq('Expect scriptId + scriptUrl be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl'
  }).isValue());

  Assert.eq('Expect init be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    init(_el) {
      return {
        setValue: Fun.noop,
        getValue: Fun.constant(''),
        destroy: Fun.noop
      };
    }
  }).isValue());

  Assert.eq('Expect combining script and init to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl',
    init(_el) {
      return {
        setValue: Fun.noop,
        getValue: Fun.constant(''),
        destroy: Fun.noop
      };
    }
  }).isError());

  Assert.eq('Expect scriptId + scriptUrl with structured-cloneable settings to be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl',
    settings: {
      a: 'text',
      b: 1.23,
      c: true,
      d: false,
      e: null,
      f: undefined,
      // eslint-disable-next-line no-new-wrappers
      g: new Boolean(false),
      h: new Date(),
      i: /^(?:fizz|buzz)/,
      j: new Blob([ '<a id="a"><b id="b">hey!</b></a>' ], { type : 'text/html' }),
      k: [ 'text', Infinity, true, false ],
      l: { prop: 'value' },
      m: new Map([[ 'key1', 'value1' ], [ 'key2', 'value2' ]]),
      n: new Set([ 1, 2, 3, 4, 5 ])
    }
  }).isValue());

  Assert.eq('Expect scriptId + scriptUrl with non structured-cloneable settings to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl',
    settings: {
      func: Fun.noop
    }
  }).isError());
});
