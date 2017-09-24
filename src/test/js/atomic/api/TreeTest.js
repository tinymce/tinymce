test(
  'Atomic Test: api.TreeTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (RawAssertions, FieldPresence, FieldSchema, ValueSchema) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('value'),
      FieldSchema.defaulted('text', '?'),
      FieldSchema.field(
        'branches',
        'branches',
        FieldPresence.defaulted([ ]),
        ValueSchema.thunk(function () {
          return ValueSchema.arrOf(schema);
        })
      )
    ]);

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
  }
);
