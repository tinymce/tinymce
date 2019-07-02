import { Assertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr } from '@ephox/katamari';

import * as AlloyParts from 'ephox/alloy/parts/AlloyParts';
import * as PartType from 'ephox/alloy/parts/PartType';
import * as PartSubstitutes from 'ephox/alloy/parts/PartSubstitutes';

UnitTest.test('Browser Test: parts.PartProcessGroupTest', () => {

  const groupWithPreprocess = PartType.group({
    name: 'groupA',
    unit: 'groupA-unit',
    pname: 'groupA-pname'
  });

  const group = PartType.group({
    name: 'groupB',
    unit: 'groupB-unit',
    pname: 'groupB-pname'
  });

  const placeholders = AlloyParts.generate('owner', [ groupWithPreprocess, group ]);

  const detail = {
    partUids: { },
    components: [
      {
        components: [
          placeholders.groupA({ })
        ]
      },

      placeholders.groupB({
        preprocess: (comps) => {
          const chunks = Arr.chunk(comps, 2);
          return Arr.map(chunks, (c) => {
            return {
              chunk: c
            };
          });
        }
      })
    ],
    groupA: [
      {
        components: [ 'groupA1', 'groupA2', 'groupA3', 'groupA4' ]
      }
    ],
    groupB: [
      {
        components: [ 'groupB1' ]
      },
      {
        components: [ 'groupB2' ]
      },
      {
        components: [ 'groupB3' ]
      },
      {
        components: [ 'groupB4' ]
      }
    ]
  } as any;

  const subs = PartSubstitutes.subs('owner', detail, [ groupWithPreprocess, group ]);

  // Work out the components by substituting internals
  const components: any = AlloyParts.components('owner', detail, subs.internals());

  Assertions.assertEq(
    'Checking components generated altogether',
    [
      {
        components: [
          {
            components: [ 'groupA1', 'groupA2', 'groupA3', 'groupA4' ]
          }
        ]
      },
      {
        chunk: [
          {
            components: [ 'groupB1' ]
          },
          {
            components: [ 'groupB2' ]
          }
        ]
      },
      {
        chunk: [
          {
            components: [ 'groupB3' ]
          },
          {
            components: [ 'groupB4' ]
          }
        ]
      }
    ],
    components
  );
});
