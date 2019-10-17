import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Types } from '@ephox/bridge';
import { ValueSchema } from '@ephox/boulder';
import { Blob } from '@ephox/dom-globals';

UnitTest.test('Custom Editor Schema Test', () => {
  const schema = Types.CustomEditor.customEditorSchema;

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
    init(el) {
      return {
        setValue: (value: string) => {},
        getValue: () => '',
        destroy: () =>  {}
      };
    }
  }).isValue());

  Assert.eq('Expect combining script and init to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl',
    init(el) {
      return {
        setValue: (value: string) => {},
        getValue: () => '',
        destroy: () =>  {}
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
      // tslint:disable-next-line:no-construct
      g: new Boolean(false),
      h: new Date(),
      i: /^(?:fizz|buzz)/,
      j: new Blob(['<a id="a"><b id="b">hey!</b></a>'], {type : 'text/html'}),
      k: ['text', Infinity, true, false],
      l: { prop: 'value' },
      m: new Map([['key1', 'value1'], ['key2', 'value2']]),
      n: new Set([1, 2, 3, 4, 5])
    }
  }).isValue());

  Assert.eq('Expect scriptId + scriptUrl with non structured-cloneable settings to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl',
    settings: {
      func: () => {}
    }
  }).isError());
});
