import { RawAssertions } from '@ephox/agar';
import AlloyParts from 'ephox/alloy/parts/AlloyParts';
import PartType from 'ephox/alloy/parts/PartType';
import { Objects } from '@ephox/boulder';
import { ValueSchema } from '@ephox/boulder';
import { Fun } from '@ephox/katamari';
import Jsc from '@ephox/wrap-jsverify';
import { UnitTest } from '@ephox/refute';

UnitTest.test('Atomic Test: parts.SchemasTest', function() {
  var internal = PartType.required({
    factory: { sketch: function (x) { return 'sketch.' + x; } },
    schema: [ ],
    name: 'internal',
    pname: '<part.internal>',
    defaults: function () {
      return {
        value: 10
      };
    },
    overrides: function () {
      return {
        otherValue: 15
      };
    }
  });

  var external = PartType.external({
    factory: { sketch: function (x) { return x + '.external'; } },
    schema: [ ],
    name: 'external',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  var optional = PartType.optional({
    factory: { sketch: function (x) { return x + '.optional'; } },
    schema: [ ],
    name: 'optional',
    pname: '<part.optional>',
    defaults: Fun.constant({ defaultValue: 10 }),
    overrides: Fun.constant({ overriddenValue: 15 })
  });

  var group = PartType.group({
    factory: { sketch: function (x) { return x + '.group'; } },
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

  var checkSuccess = function (label, expected, parts, input) {
    var schemas = AlloyParts.schemas(parts);
    var output = ValueSchema.asRawOrDie(
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


  Jsc.syncProperty('Just internal', [ Jsc.string ], function (s) {
    return checkSuccess(
      'just internal',
      { },
      [ internal ],
      { }
    );
  });

  Jsc.syncProperty('Just external', [ Jsc.string ], function (s) {
    return checkSuccess(
      'just external',
      {
        external: { entirety: s }
      },
      [ external ],
      { external: s }
    );
  });

  Jsc.syncProperty('Just group', [ Jsc.string ], function (s) {
    return checkSuccess(
      'just group',
      { },
      [ group ],
      { }
    );
  });
});

