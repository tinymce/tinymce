import { Logger } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Fun } from '@ephox/katamari';

import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import { subs } from 'ephox/alloy/parts/PartSubstitutes';
import * as PartType from 'ephox/alloy/parts/PartType';
import * as UiSubstitutes from 'ephox/alloy/spec/UiSubstitutes';

UnitTest.test('PartSubstitutesTest', () => {
  // TODO: Make this test more exhaustive. This is really just a sanity
  // check at the moment.
  Logger.sync(
    'Testing subs',
    () => {
      const detail = {
        'uid': '1',
        'dom': {
          tag: 'div'
        },
        'components': [ ] as AlloySpec[],
        'originalSpec': { },
        'debug.sketcher': { },
        'partUids': ({
          'required.A': 'a-uid',
          'optional.B' : 'b-uid',
          'external.C': 'c-uid',
          'group.D': 'd-uid'
        }),
        'parts': ({
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
            sketch: (spec) => ({
              factory: 'factory.A',
              spec
            })
          }
        }),
        PartType.optional({
          name: 'optional.B',
          pname: 'part:b',
          factory: {
            sketch: (spec) => ({
              factory: 'factory.B',
              spec
            })
          }
        }),
        PartType.external({
          name: 'external.C',
          pname: 'part:c',
          factory: {
            sketch: (spec) => ({
              factory: 'factory.C',
              spec
            })
          }
        }),
        PartType.group({
          name: 'group.D',
          pname: 'part:d',
          unit: 'unit.d',
          factory: {
            sketch: (spec) => ({
              factory: 'factory.D',
              spec
            })
          }
        })
      ]);

      const internals = substitutes.internals();
      const externals = substitutes.externals();

      const checkSinglePart = (label: string, expected: { required: boolean; spec: any; factory: any }, part: UiSubstitutes.UiSubstitutesAdt) => {
        Logger.sync('Checking: ' + label, () => {
          part.match({
            single: (required, valueThunk) => {
              Assert.eq('Checking required status', expected.required, required);
              Assert.eq('Checking result', {
                factory: expected.factory,
                spec: expected.spec
              }, valueThunk(detail, { }, { }));
            },
            multiple: Fun.die('Should not be a multiple')
          });
        });
      };

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

        Assert.eq('Checking result', {
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
            Assert.eq('Checking required status', true, required);
            Assert.eq('Checking result',
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
              ] as any[],
              valueThunks(detail, { }, { })
            );
          }
        });
      });

    }
  );
});
