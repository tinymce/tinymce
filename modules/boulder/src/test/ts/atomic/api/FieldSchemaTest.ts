import { RawAssertions } from '@ephox/agar';
import { UnitTest, assert } from '@ephox/bedrock';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as ValueSchema from 'ephox/boulder/api/ValueSchema';
import { FieldProcessorAdt } from 'ephox/boulder/api/Main';
import { Option, Obj, Arr } from '@ephox/katamari';

UnitTest.test('Atomic Test: api.FieldSchemaTest', function () {
  const assertFieldValue = (label: string, expected: any, input: any, field: FieldProcessorAdt) => {
    const schema = ValueSchema.objOf([
      field
    ]);

    ValueSchema.asRaw('spec', schema, input).fold(
      (err) => { throw err; },
      (value) => RawAssertions.assertEq(label, expected, value)
    );
  };

  const assertFieldError = (label: string, input: any, field: FieldProcessorAdt) => {
    const schema = ValueSchema.objOf([
      field
    ]);

    ValueSchema.asRaw('spec', schema, input).fold(
      (err) => {},
      (value) => assert.fail('Should fail on value')
    );
  };

  const assertOptionalFieldValue = (expected: Record<string, Option<any>>, input: any, field: FieldProcessorAdt) => {
    const schema = ValueSchema.objOf([
      field
    ]);

    ValueSchema.asRaw('spec', schema, input).fold(
      (err) => assert.fail('Should not fail'),
      (actual: any) => {
       Obj.each(expected, (expectedValueOpt, expectedKey) => {
          if (expectedValueOpt.isNone()) {
            RawAssertions.assertEq(`Expected value for key ${expectedKey} to be none`, true, actual[expectedKey].isNone());
          } else if (expectedValueOpt.isSome()) {
            const actualValue = actual[expectedKey].getOrDie(`Expected value for key ${expectedKey} to be some`);
            const expectedValue = expectedValueOpt.getOrDie(`Expected value for key ${expectedKey} to be some`);
            RawAssertions.assertEq(`Expected value for key ${expectedKey} to be some`, expectedValue, actualValue);
          }
        });
      }
    );
  };

  assertFieldValue('Should be specified value a', { key: 'a' }, { key: 'a' }, FieldSchema.defaultedStringEnum('key', 'b', ['a', 'b']));
  assertFieldValue('Should be specified value b', { key: 'b' }, { key: 'b' }, FieldSchema.defaultedStringEnum('key', 'b', ['a', 'b']));
  assertFieldValue('Should be default value', { key: 'b' }, { }, FieldSchema.defaultedStringEnum('key', 'b', ['a', 'b']));
  assertFieldError('Should fail on undefined value variant', { key: 'c' }, FieldSchema.defaultedStringEnum('key', 'b', ['a', 'b']));
  assertFieldValue('Should be specified array', { key: ['a'] }, { key: ['a'] }, FieldSchema.defaultedArrayOf('key', ['b'], ValueSchema.string));
  assertFieldValue('Should be default array', { key: ['b'] }, { }, FieldSchema.defaultedArrayOf('key', ['b'], ValueSchema.string));

  assertFieldValue('Should be specified value a', { key: 'a' }, { key: 'a' }, FieldSchema.strictStringEnum('key', ['a', 'b']));
  assertFieldValue('Should be specified value b', { key: 'b' }, { key: 'b' }, FieldSchema.strictStringEnum('key', ['a', 'b']));
  assertFieldError('Should fail on undefined value variant', { key: 'c' }, FieldSchema.strictStringEnum('key', ['a', 'b']));

  assertOptionalFieldValue({ key: Option.some('a') }, { key: 'a' }, FieldSchema.optionStringEnum('key', ['a', 'b']));
  assertOptionalFieldValue({ key: Option.some('b') }, { key: 'b' }, FieldSchema.optionStringEnum('key', ['a', 'b']));
  assertFieldError('Should be fail on unspecified value', { key: 'c' }, FieldSchema.optionStringEnum('key', ['a', 'b']));
  assertOptionalFieldValue({ key: Option.none() }, { }, FieldSchema.optionStringEnum('key', ['a', 'b']));
  assertOptionalFieldValue({ key: Option.some(['b'])}, { key: ['b'] }, FieldSchema.optionArrayOf('key', ValueSchema.string));
  assertOptionalFieldValue({ key: Option.none()}, { }, FieldSchema.optionArrayOf('key', ValueSchema.string));
});
