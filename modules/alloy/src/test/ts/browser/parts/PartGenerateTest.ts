import { Logger, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { FieldSchema, Objects } from '@ephox/boulder';
import { Obj } from '@ephox/katamari';
import * as AlloyParts from 'ephox/alloy/parts/AlloyParts';
import * as PartType from 'ephox/alloy/parts/PartType';

UnitTest.test('Atomic Test: parts.GenerateTest', () => {
  const schema = [
    FieldSchema.strict('test-data'),
    FieldSchema.state('state', () => {
      return 'state';
    })
  ];

  const internal = PartType.required({
    name: 'name.1',
    pname: 'name.part.1',
    schema
  });

  const external = PartType.external({
    name: 'name.2',
    schema
  });

  const optional = PartType.optional({
    name: 'name.3',
    pname: 'name.part.3',
    schema
  });

  const group = PartType.group({
    name: 'name.4',
    unit: 'unit.4',
    pname: 'name.part.4',
    // This should be ignored
    schema
  });

  const check = (label, expected, parts) => {
    Logger.sync(label, () => {
      const data = { 'test-data': label };
      const generated = AlloyParts.generate('owner', parts);

      // Check that config and validated match what was passed through
      Obj.each(generated, (g, k) => {
        const output = g(data);
        RawAssertions.assertEq('Checking config', data, output.config);
        RawAssertions.assertEq('Checking validated', {
          'test-data': data['test-data'],
          'state': 'state'
        }, output.validated);
      });

      RawAssertions.assertEq(
        'Checking PartType.generate',
        expected,
        Obj.map(generated, (g) => {
          const output = g(data);
          return Objects.exclude(output, [ 'config', 'validated' ]);
        })
      );
    });
  };

  const checkGroup = (label, expected, parts) => {
    Logger.sync(label, () => {
      const data = { preprocess: 'PREPROCESSOR' };
      const generated = AlloyParts.generate('owner', parts);

      // Check that config, and ensure that preprocessor is all that is in validated
      Obj.each(generated, (g, k) => {
        const output = g(data);
        RawAssertions.assertEq('Checking config', data, output.config);
        RawAssertions.assertEq('Checking validated', 'PREPROCESSOR', output.validated.preprocess.getOr('none'));
        RawAssertions.assertEq('Should only be one key: preprocess', [ 'preprocess' ], Obj.keys(output.validated));
      });

      RawAssertions.assertEq(
        'Checking PartType.generate',
        expected,
        Obj.map(generated, (g) => {
          const output = g(data);
          return Objects.exclude(output, [ 'config', 'validated' ]);
        })
      );
    });
  };

  check(
    'Internal',
    {
      'name.1': {
        uiType: 'placeholder',
        owner: 'owner',
        name: 'name.part.1'
      }
    },
    [ internal ]
  );

  check(
    'External',
    { },
    [ external ]
  );

  check(
    'Optional',
    {
      'name.3': {
        uiType: 'placeholder',
        owner: 'owner',
        name: 'name.part.3'
      }
    },
    [ optional ]
  );

  checkGroup(
    'Group',
    {
      'name.4': {
        uiType: 'placeholder',
        owner: 'owner',
        name: 'name.part.4'
      }
    },
    [ group ]
  );
});
