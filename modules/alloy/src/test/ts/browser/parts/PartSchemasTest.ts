import { Assert, UnitTest } from '@ephox/bedrock-client';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';

import * as AlloyParts from 'ephox/alloy/parts/AlloyParts';
import * as PartType from 'ephox/alloy/parts/PartType';

type TestSpec = { defaultValue: number; overriddenValue: number; };

UnitTest.test('Atomic Test: parts.SchemasTest', () => {
  const internal = PartType.required<any, TestSpec>({
    factory: { sketch (x) { return 'sketch.' + x; } },
    schema: [ ],
    name: 'internal',
    pname: '<part.internal>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 10 })
  });

  const external = PartType.external<any, TestSpec>({
    factory: { sketch (x) { return x + '.external'; } },
    schema: [ ],
    name: 'external',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  const optional = PartType.optional<any, TestSpec>({
    factory: { sketch (x) { return x + '.optional'; } },
    schema: [ ],
    name: 'optional',
    pname: '<part.optional>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  const group = PartType.group<any, TestSpec>({
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

  const checkSuccess = (label: string, expected: { external?: { entirety: string } }, parts: PartType.PartTypeAdt[], input: { external?: string }) => {
    const schemas = AlloyParts.schemas(parts);
    const output = ValueSchema.asRawOrDie(
      label,
      ValueSchema.objOfOnly(schemas),
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

  Jsc.syncProperty('Just internal', [ Jsc.string ], () => {
    return checkSuccess(
      'just internal',
      { },
      [ internal ],
      { }
    );
  });

  Jsc.syncProperty('Just external', [ Jsc.string ], (s: string) => {
    return checkSuccess(
      'just external',
      {
        external: { entirety: s }
      },
      [ external ],
      { external: s }
    );
  });

  Jsc.syncProperty('Just group', [ Jsc.string ], () => {
    return checkSuccess(
      'just group',
      { },
      [ group ],
      { }
    );
  });
});
