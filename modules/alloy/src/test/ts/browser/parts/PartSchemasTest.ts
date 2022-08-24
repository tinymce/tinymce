import { Assert, UnitTest } from '@ephox/bedrock-client';
import { StructureSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import * as fc from 'fast-check';

import * as AlloyParts from 'ephox/alloy/parts/AlloyParts';
import * as PartType from 'ephox/alloy/parts/PartType';

interface TestSpec {
  readonly defaultValue: number;
  readonly overriddenValue: number;
}

UnitTest.test('Atomic Test: parts.SchemasTest', () => {
  const internal = PartType.required<any, TestSpec>({
    factory: { sketch: (x) => 'sketch.' + x },
    schema: [ ],
    name: 'internal',
    pname: '<part.internal>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 10 })
  });

  const external = PartType.external<any, TestSpec>({
    factory: { sketch: (x) => x + '.external' },
    schema: [ ],
    name: 'external',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  const optional = PartType.optional<any, TestSpec>({
    factory: { sketch: (x) => x + '.optional' },
    schema: [ ],
    name: 'optional',
    pname: '<part.optional>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  const group = PartType.group<any, TestSpec>({
    factory: { sketch: (x) => x + '.group' },
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

  const checkSuccess = (label: string, expected: { external?: { entirety: string }}, parts: PartType.PartTypeAdt[], input: { external?: string }) => {
    const schemas = AlloyParts.schemas(parts);
    const output = StructureSchema.asRawOrDie(
      label,
      StructureSchema.objOfOnly(schemas),
      input
    );

    Assert.eq(label, expected, output);
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
    { external: { entirety: 'external.schema' }},
    [ external ],
    { external: 'external.schema' }
  );

  checkSuccess(
    'sanity: group',
    { },
    [ group ],
    { }
  );

  checkSuccess(
    'sanity: just optional',
    { },
    [ optional ],
    { }
  );

  fc.assert(fc.property(fc.string(), () => checkSuccess(
    'just internal',
    { },
    [ internal ],
    { }
  )));

  fc.assert(fc.property(fc.string(), (s) => checkSuccess(
    'just external',
    {
      external: { entirety: s }
    },
    [ external ],
    { external: s }
  )));

  fc.assert(fc.property(fc.string(), () => checkSuccess(
    'just group',
    { },
    [ group ],
    { }
  )));
});
