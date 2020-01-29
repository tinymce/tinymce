import { Assert, UnitTest } from '@ephox/bedrock-client';
import * as FieldPresence from 'ephox/boulder/api/FieldPresence';
import * as FieldSchema from 'ephox/boulder/api/FieldSchema';
import * as ValueSchema from 'ephox/boulder/api/ValueSchema';

UnitTest.test('Atomic Test: api.TreeTest', function () {
  const schema = ValueSchema.objOf([
    FieldSchema.strict('value'),
    FieldSchema.defaulted('text', '?'),
    FieldSchema.field(
      'branches',
      'branches',
      FieldPresence.defaulted([ ]),
      ValueSchema.thunkOf('recursive', function () {
        return ValueSchema.arrOf(schema);
      })
    )
  ]);

  const check = function (label, expected, input) {
    const actual = ValueSchema.asRawOrDie(label, schema, input);
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
