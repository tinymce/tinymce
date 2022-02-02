import { Assert, UnitTest } from '@ephox/bedrock-client';

import * as FieldPresence from 'ephox/boulder/api/FieldPresence';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as StructureSchema from 'ephox/boulder/api/StructureSchema';

UnitTest.test('Atomic Test: api.TreeTest', () => {
  const schema = StructureSchema.objOf([
    FieldSchema.required('value'),
    FieldSchema.defaulted('text', '?'),
    FieldSchema.field(
      'branches',
      'branches',
      FieldPresence.defaulted([ ]),
      StructureSchema.thunkOf('recursive', () => {
        return StructureSchema.arrOf(schema);
      })
    )
  ]);

  const check = (label: string, expected, input) => {
    const actual = StructureSchema.asRawOrDie(label, schema, input);
    Assert.eq(label, expected, actual);
  };

  check('Single leaf', { value: 'a', text: '?', branches: [ ] }, { value: 'a' });

  check('One branch',
    {
      value: 'a',
      text: '?',
      branches: [
        {
          value: 'a0',
          text: 'a0-text',
          branches: [ ]
        }
      ]
    },

    {
      branches: [
        {
          value: 'a0',
          text: 'a0-text'
        }
      ],
      value: 'a'
    }
  );

  check('Nested branches',
    {
      value: 'a',
      text: '?',
      branches: [
        {
          value: 'a0',
          text: '?',
          branches: [
            {
              value: 'a0-0',
              text: '?',
              branches: [
                {
                  value: 'a0-0-0',
                  text: 'a0-0-0-text',
                  branches: [ ]
                }
              ]
            },
            {
              value: 'a0-1',
              text: '?',
              branches: [ ]
            }
          ]
        }
      ]
    },

    {
      branches: [
        {
          value: 'a0',
          branches: [
            {
              value: 'a0-0',
              branches: [
                {
                  value: 'a0-0-0',
                  text: 'a0-0-0-text'
                }
              ]
            },
            {
              value: 'a0-1'
            }
          ]
        }
      ],
      value: 'a'
    }
  );

});
