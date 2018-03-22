import { RawAssertions } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Fun, Obj } from '@ephox/katamari';
import * as DslType from 'ephox/boulder/api/DslType';
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

  const treeDsl = schema.toDsl();

  // Just check that all functions are defined (i.e. does not throw an error)
  const processType = function (dsl) {
    DslType.foldType(
      dsl,
      function (validator, valueType) {
        processType(valueType.toDsl());
      },
      function (valueType) {
        processType(valueType.toDsl());
      },
      function (fields) {
        Arr.each(fields, function (field) {
          field.fold(function (name, presence, type) {
            processType(type.toDsl());
          }, Fun.noop);
        });
      },
      function (validator) { },
      function (key, branches) {
        throw new Error('Nothing is using a "choice" type here');
      },
      function () { },
      function (args, outputSchema) {
        processType(outputSchema.toDsl());
      }
    );
  };
  processType(treeDsl);

  const check = function (label, expected, input) {
    const actual = ValueSchema.asRawOrDie(label, schema, input);
    RawAssertions.assertEq(label, expected, actual);
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
