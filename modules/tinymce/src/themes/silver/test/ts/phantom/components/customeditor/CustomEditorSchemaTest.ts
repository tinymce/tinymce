import { describe, it } from '@ephox/bedrock-client';
import { ValueSchema } from '@ephox/boulder';
import { Dialog } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';
import { assert } from 'chai';

describe('phantom.tinymce.themes.silver.components.customeditor.CustomEditorSchemaTest', () => {
  const schema = Dialog.customEditorSchema;
  const base = {
    type: 'customeditor',
    name: 'customeditor',
    tag: 'textarea'
  };

  it('Invalid values returns an error', () => {
    assert.isTrue(ValueSchema.asRaw('empty', schema, {}).isError(), 'Expect empty not not be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, base).isError(), 'Expect missing scriptId + scriptUrl or init to not be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, {
      ...base,
      scriptId: 'scriptId'
    }).isError(), 'Expect missing scriptUrl to not be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, {
      ...base,
      scriptUrl: 'scriptUrl'
    }).isError(), 'Expect missing scriptId to not be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, {
      ...base,
      scriptId: 'scriptId',
      scriptUrl: 'scriptUrl',
      init: (_el) => {
        return {
          setValue: Fun.noop,
          getValue: Fun.constant(''),
          destroy: Fun.noop
        };
      }
    }).isError(), 'Expect combining script and init to not be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, {
      ...base,
      scriptId: 'scriptId',
      scriptUrl: 'scriptUrl',
      settings: {
        func: Fun.noop
      }
    }).isError(), 'Expect scriptId + scriptUrl with non structured-cloneable settings to not be valid');
  });

  it('Valid values should return a value', () => {
    assert.isTrue(ValueSchema.asRaw('.', schema, {
      ...base,
      scriptId: 'scriptId',
      scriptUrl: 'scriptUrl'
    }).isValue(), 'Expect scriptId + scriptUrl be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, {
      ...base,
      init: (_el) => {
        return {
          setValue: Fun.noop,
          getValue: Fun.constant(''),
          destroy: Fun.noop
        };
      }
    }).isValue(), 'Expect init be valid');

    assert.isTrue(ValueSchema.asRaw('.', schema, {
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
        j: new Blob([ '<a id="a"><b id="b">hey!</b></a>' ], { type: 'text/html' }),
        k: [ 'text', Infinity, true, false ],
        l: { prop: 'value' },
        m: new Map([[ 'key1', 'value1' ], [ 'key2', 'value2' ]]),
        n: new Set([ 1, 2, 3, 4, 5 ])
      }
    }).isValue(), 'Expect scriptId + scriptUrl with structured-cloneable settings to be valid');
  });
});
