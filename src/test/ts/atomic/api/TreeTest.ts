
import { RawAssertions } from '@ephox/agar';
import DslType from 'ephox/boulder/api//DslType';
import FieldPresence from 'ephox/boulder/api/FieldPresence';
import FieldSchema from 'ephox/boulder/api/FieldSchema';
import { ValueSchema } from 'ephox/boulder/api/ValueSchema';
import { Arr, Fun, Obj } from '@ephox/katamari';
import { UnitTest, assert } from '@ephox/bedrock';

UnitTest.test('Atomic Test: api.TreeTest', function() {
  var schema = ValueSchema.objOf([
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

  var treeDsl = schema.toDsl();

  // Just check that all functions are defined (i.e. does not throw an error)
  var processType = function (dsl) {
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
          DslType.foldField(field, function (name, presence, type) {
            processType(type.toDsl());
          }, Fun.noop);
        });
      },
      function (validator) { },
      function (key, branches) {
        var values = Obj.values(branches);
        Arr.each(values, function (v) {
          Arr.each(v, function (field) {
            DslType.foldField.cata(field, function (name, presence, type) {
              processType(type.toDsl());
            }, Fun.noop);
          });
        });
      },
      function () { },
      function (args, outputSchema) {
        processType(outputSchema.toDsl());
      }
    );
  };
  processType(treeDsl);

  var check = function (label, expected, input) {
    var actual = ValueSchema.asRawOrDie(label, schema, input);
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
