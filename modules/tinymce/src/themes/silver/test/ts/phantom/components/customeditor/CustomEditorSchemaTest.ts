import { UnitTest } from '@ephox/bedrock';
import { Types } from '@ephox/bridge';
import { ValueSchema } from '@ephox/boulder';
import { RawAssertions } from '@ephox/agar';

UnitTest.test('Custom Editor Schema Test', () => {
  const schema = Types.CustomEditor.customEditorSchema;

  RawAssertions.assertEq('Expect empty not not be valid', true, ValueSchema.asRaw('empty', schema, {
  }).isError());

  const base = {
    type: 'customeditor',
    name: 'customeditor',
    tag: 'textarea'
  };

  RawAssertions.assertEq('Expect missing scriptId + scriptUrl or init to not be valid', true, ValueSchema.asRaw('.', schema, base).isError());

  RawAssertions.assertEq('Expect missing scriptUrl to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId'
  }).isError());

  RawAssertions.assertEq('Expect missing scriptId to not be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptUrl: 'scriptUrl'
  }).isError());

  RawAssertions.assertEq('Expect scriptId + scriptUrl be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    scriptId: 'scriptId',
    scriptUrl: 'scriptUrl'
  }).isValue());

  RawAssertions.assertEq('Expect init be valid', true, ValueSchema.asRaw('.', schema, {
    ...base,
    init(el) {
      return {
        setValue: (value: string) => {},
        getValue: () => '',
        destroy: () =>  {}
      };
    }
  }).isValue());

  RawAssertions.assertEq('Expect combining script and init to not be valid', true, ValueSchema.asRaw('.', schema, {
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
});