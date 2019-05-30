import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import * as AlloyParts from 'ephox/alloy/parts/AlloyParts';
import * as PartType from 'ephox/alloy/parts/PartType';

UnitTest.test('Atomic Test: parts.SchemasTest', () => {
  const internal = PartType.required({
    factory: { sketch (x) { return 'sketch.' + x; } },
    schema: [ ],
    name: 'internal',
    pname: '<part.internal>',
    defaults () {
      return {
        value: 10
      };
    },
    overrides () {
      return {
        otherValue: 15
      };
    }
  });

  const external = PartType.external({
    factory: { sketch (x) { return x + '.external'; } },
    schema: [ ],
    name: 'external',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  const optional = PartType.optional({
    factory: { sketch (x) { return x + '.optional'; } },
    schema: [ ],
    name: 'optional',
    pname: '<part.optional>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  const group = PartType.group({
    factory: { sketch (x) { return x + '.group'; } },
    schema: [ ],
    name: 'group',
    unit: 'member',
    pname: '<part.group>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  // We split up the checking functions like so:
  // checkSuccessWithNone, the non-optional parts are expected, and the optional = None
  // checkSuccessWithSome, the non-optional parts are expected, and the optional is optExpected

  const checkSuccess = (label, expected, parts, input) => {
    const schemas = AlloyParts.schemas(parts);
    const output = ValueSchema.asRawOrDie(
      label,
      ValueSchema.objOfOnly(schemas),
      input
    );

    RawAssertions.assertEq(label, expected, output);
    return true;
  };

  checkSuccess(
    'sanity: just internal',
    { },
    [ internal ],
    { }
  );

  checkSuccess(
    'sanity: just external',
    { external: { entirety: 'external.schema' } },
    [ external ],
    { external: 'external.schema' }
  );

  checkSuccess(
    'sanity: group',
    { },
    [ group ],
    {  }
  );

  checkSuccess(
    'sanity: just optional',
    { },
    [ optional ],
    { }
  );

  Jsc.syncProperty('Just internal', [ Jsc.string ], (s) => {
    return checkSuccess(
      'just internal',
      { },
      [ internal ],
      { }
    );
  });

  Jsc.syncProperty('Just external', [ Jsc.string ], (s) => {
    return checkSuccess(
      'just external',
      {
        external: { entirety: s }
      },
      [ external ],
      { external: s }
    );
  });

  Jsc.syncProperty('Just group', [ Jsc.string ], (s) => {
    return checkSuccess(
      'just group',
      { },
      [ group ],
      { }
    );
  });
});
