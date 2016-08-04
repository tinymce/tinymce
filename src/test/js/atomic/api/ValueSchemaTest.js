test(
  'ValueSchemaTest',

  [
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema'
  ],

  function (FieldPresence, FieldSchema, ValueSchema) {
  /*
    var check = function (label, input, processor) {
      assert.eq(input, ValueSchema.asRaw(label, processor, input).getOrDie());
    };
  
    check('test.1', 10, ValueSchema.anyValue());

    check('test.2', [ 10, 20, 50 ], ValueSchema.arrOfVal());

    check('test.3', {
      a: 'a',
      b: 'b'
    }, ValueSchema.objOf([
      FieldSchema.strict('a'),
      FieldSchema.strict('b')
    ]));

    check('test.4', {
      urls: [
        { url: 'hi', fresh: 'true' },
        { url: 'hi', fresh: 'true' }
      ]
    }, ValueSchema.objOf([
      FieldSchema.strictArrayOfObj('urls', [
        FieldSchema.strict('url'),
        FieldSchema.defaulted('fresh', '10')
      ])
    ]));

    check('test.5', {
      urls: [ 'dog', 'cat' ]
    }, ValueSchema.objOf([
      FieldSchema.strictArrayOf('urls', ValueSchema.anyValue())
    ]));


    var optionValue = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.option('alpha')
    ]), {}).getOrDie();    
    assert.eq(true, optionValue.alpha.isNone(), 'alpha should be none');

    var optionValue2 = ValueSchema.asRaw('test.option', ValueSchema.objOf([
      FieldSchema.option('alpha')
    ]), { alpha: 'beta' }).getOrDie();    
    assert.eq(true, optionValue2.alpha.isSome(), 'alpha should be some');

*/
  (function () {
    var actualVal = ValueSchema.asStruct('test.struct.1', ValueSchema.anyValue(), 10);
    assert.eq(10, actualVal.getOrDie());


    var actualObj = ValueSchema.asStruct('test.struct.2', ValueSchema.objOf([
      FieldSchema.strict('a')
    ]), {
      a: 'alpha'
    });
    assert.eq('alpha', actualObj.getOrDie().a());
  })();

    (function () {
      var actual = ValueSchema.asStruct('test.struct', ValueSchema.objOf([
        FieldSchema.field('countries', 'countries', FieldPresence.strict(), ValueSchema.objOf([
          FieldSchema.field('aus', 'aus', FieldPresence.strict(), ValueSchema.objOf([
            FieldSchema.strict('brisbane'),
            FieldSchema.strict('sydney')
          ]))
        ]))

      ]), {
        countries: {
          aus: {
            brisbane: '19',
            sydney: '20'
          }
        }
      }).getOrDie();
      console.log('actual', actual);
      assert.eq(true, actual.countries().aus !== undefined);
      assert.eq(19, actual.countries().aus().brisbane());
      assert.eq(20, actual.countries().aus().sydney());
    })();

  }
);