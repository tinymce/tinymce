import { Logger, RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Fun, Obj } from '@ephox/katamari';
import { subs } from 'ephox/alloy/parts/PartSubstitutes';
import * as PartType from 'ephox/alloy/parts/PartType';

UnitTest.test('PartSubstitutesTest', () => {
  // TODO: Make this test more exhaustive. This is really just a sanity
  // check at the moment.
  Logger.sync(
    'Testing subs',
    () => {
      const detail = {
        partUids: ({
          'required.A': 'a-uid',
          'optional.B' : 'b-uid',
          'external.C': 'c-uid',
          'group.D': 'd-uid'
        }),
        parts: ({
          'required.A': ({ }),
          'optional.B': ({ }),
          'external.C': ({
            entirety: ({ })
          }),
          'group.D': ({ })
        }),
        'group.D': [
          {
            uid: 'group.D.1'
          },
          {
            uid: 'group.D.2'
          }
        ]
      };
      const substitutes = subs('owner', detail, [
        PartType.required({
          name: 'required.A',
          pname: 'part:a',
          factory: {
            sketch: (spec) => {
              return {
                factory: 'factory.A',
                spec
              }
            }
          }
        }),
        PartType.optional({
          name: 'optional.B',
          pname: 'part:b',
          factory: {
            sketch: (spec) => {
              return {
                factory: 'factory.B',
                spec
              }
            }
          }
        }),
        PartType.external({
          name: 'external.C',
          pname: 'part:c',
          factory: {
            sketch: (spec) => {
              return {
                factory: 'factory.C',
                spec
              }
            }
          }
        }),
        PartType.group({
          name: 'group.D',
          pname: 'part:d',
          unit: 'unit.d',
          factory: {
            sketch: (spec) => {
              return {
                factory: 'factory.D',
                spec
              }
            }
          }
        })
      ]);

      const internals = substitutes.internals();
      const externals = substitutes.externals();

      const internalKeys = Obj.keys(internals);

      const checkSinglePart = (label: string, expected, part) => {
        Logger.sync('Checking: ' + label, () => {
          part.match({
            single: (required, valueThunk) => {
              RawAssertions.assertEq('Checking required status', expected.required, required);
              RawAssertions.assertEq('Checking result', {
                factory: expected.factory,
                spec: expected.spec
              }, valueThunk(detail, { }, { }))
            },
            multiple: Fun.die('Should not be a multiple')
          });
        });
      }

      checkSinglePart('A', {
        required: true,
        factory: 'factory.A',
        spec: {
          uid: 'a-uid'
        }
      }, internals['part:a']);

      checkSinglePart('B', {
        required: false,
        factory: 'factory.B',
        spec: {
          uid: 'b-uid'
        }
      }, internals['part:b']);

      Logger.sync('Checking external.C', () => {
        const outcome = externals['external.C']();

        RawAssertions.assertEq('Checking result', {
          factory: 'factory.C',
          spec: {
            uid: 'c-uid'
          }
        }, outcome);
      });

      Logger.sync('Checking group.D', () => {
        internals['part:d'].match({
          single: Fun.die('Should not be a single'),
          multiple: (required, valueThunks) => {
            RawAssertions.assertEq('Checking required status', true, required);
            RawAssertions.assertEq('Checking result',
              [
                {
                  factory: 'factory.D',
                  spec: {
                    uid: 'group.D.1'
                  }
                },
                {
                  factory: 'factory.D',
                  spec: {
                    uid: 'group.D.2'
                  }
                }
              ],
              valueThunks(detail, { }, { })
            );
          }
        });
      });

    }
  );
});
