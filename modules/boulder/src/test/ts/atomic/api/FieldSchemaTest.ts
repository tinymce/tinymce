import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Obj, Optional } from '@ephox/katamari';
import { KAssert } from '@ephox/katamari-assertions';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import { FieldProcessorAdt } from 'ephox/boulder/api/Main';
import * as ValueSchema from 'ephox/boulder/api/ValueSchema';

UnitTest.test('Atomic Test: api.FieldSchemaTest', () => {
  const assertFieldValue = (label: string, expected: any, input: any, field: FieldProcessorAdt) => {
    const schema = ValueSchema.objOf([
      field
    ]);

    ValueSchema.asRaw('spec', schema, input).fold(
      (err) => {
        throw err;
      },
      (value) => Assert.eq(label, expected, value)
    );
  };

  const assertFieldError = (label: string, input: any, field: FieldProcessorAdt) => {
    const schema = ValueSchema.objOf([
      field
    ]);

    ValueSchema.asRaw('spec', schema, input).fold(
      (_err) => {},
      (_value) => Assert.fail('Should fail on value')
    );
  };

  const assertOptionalFieldValue = (expected: Record<string, Optional<any>>, input: any, field: FieldProcessorAdt) => {
    const schema = ValueSchema.objOf([
      field
    ]);

    ValueSchema.asRaw('spec', schema, input).fold(
      (_err) => Assert.fail('Should not fail'),
      (actual: any) => {
        Obj.each(expected, (expectedValueOpt, expectedKey) => {
          KAssert.eqOptional('eq', expectedValueOpt, actual[expectedKey]);
        });
      }
    );
  };

  assertFieldValue('Should be specified value a', { key: 'a' }, { key: 'a' }, FieldSchema.defaultedStringEnum('key', 'b', [ 'a', 'b' ]));
  assertFieldValue('Should be specified value b', { key: 'b' }, { key: 'b' }, FieldSchema.defaultedStringEnum('key', 'b', [ 'a', 'b' ]));
  assertFieldValue('Should be default value', { key: 'b' }, { }, FieldSchema.defaultedStringEnum('key', 'b', [ 'a', 'b' ]));
  assertFieldError('Should fail on undefined value variant', { key: 'c' }, FieldSchema.defaultedStringEnum('key', 'b', [ 'a', 'b' ]));
  assertFieldValue('Should be specified array', { key: [ 'a' ] }, { key: [ 'a' ] }, FieldSchema.defaultedArrayOf('key', [ 'b' ], ValueSchema.string));
  assertFieldValue('Should be default array', { key: [ 'b' ] }, { }, FieldSchema.defaultedArrayOf('key', [ 'b' ], ValueSchema.string));

  assertFieldValue('Should be specified value a', { key: 'a' }, { key: 'a' }, FieldSchema.strictStringEnum('key', [ 'a', 'b' ]));
  assertFieldValue('Should be specified value b', { key: 'b' }, { key: 'b' }, FieldSchema.strictStringEnum('key', [ 'a', 'b' ]));
  assertFieldError('Should fail on undefined value variant', { key: 'c' }, FieldSchema.strictStringEnum('key', [ 'a', 'b' ]));

  assertOptionalFieldValue({ key: Optional.some('a') }, { key: 'a' }, FieldSchema.optionStringEnum('key', [ 'a', 'b' ]));
  assertOptionalFieldValue({ key: Optional.some('b') }, { key: 'b' }, FieldSchema.optionStringEnum('key', [ 'a', 'b' ]));
  assertFieldError('Should be fail on unspecified value', { key: 'c' }, FieldSchema.optionStringEnum('key', [ 'a', 'b' ]));
  assertOptionalFieldValue({ key: Optional.none() }, { }, FieldSchema.optionStringEnum('key', [ 'a', 'b' ]));
  assertOptionalFieldValue({ key: Optional.some([ 'b' ]) }, { key: [ 'b' ] }, FieldSchema.optionArrayOf('key', ValueSchema.string));
  assertOptionalFieldValue({ key: Optional.none() }, { }, FieldSchema.optionArrayOf('key', ValueSchema.string));
});
