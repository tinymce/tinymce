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
    var actualVal = ValueSchema.asStruct('test.struct.val', ValueSchema.anyValue(), 10);
    assert.eq(10, actualVal.getOrDie());


    var actualObj = ValueSchema.asStruct('test.struct.obj', ValueSchema.objOf([
      FieldSchema.strict('a')
    ]), {
      a: 'alpha'
    });
    assert.eq('alpha', actualObj.getOrDie().a());

    var actualArray = ValueSchema.asStruct('test.struct.arr', ValueSchema.arrOf(
      ValueSchema.anyValue()
    ), [ 'a', 'b', 'c' ]);
    assert.eq('c', actualArray.getOrDie()[2]);

    var actualArrayOfObj = ValueSchema.asStruct('test.struct.arrof.obj', ValueSchema.arrOf(
      ValueSchema.objOf([
        FieldSchema.strict('a'),
        FieldSchema.strict('b')
      ])
    ), [
      { a: 'alpha', b: 'Beta' }
    ]);
    assert.eq('Beta', actualArrayOfObj.getOrDie()[0].b());

    var nestedObj = ValueSchema.asStruct('test.struct.nested.obj', ValueSchema.objOf([
      FieldSchema.field('first', 'first', FieldPresence.strict(), ValueSchema.objOf([
        FieldSchema.strict('first.a')
      ])),
      FieldSchema.strict('second'),
      FieldSchema.field('third', 'third', FieldPresence.defaulted('third.fallback'), ValueSchema.anyValue()),
      FieldSchema.field('fourth', 'fourth', FieldPresence.asOption(), ValueSchema.objOf([
        FieldSchema.strict('fourth.a')
      ]))
    ]), {
      first: {
        'first.a': 'First-a-value'
      },
      second: 'Second',
      fourth: {
        'fourth.a': 'Fourth-a-value'
      }
    }).getOrDie();
    assert.eq('First-a-value', nestedObj.first()['first.a']());
    assert.eq('Second', nestedObj.second());
    assert.eq('third.fallback', nestedObj.third());
    assert.eq(true, nestedObj.fourth().isSome());
    assert.eq('Fourth-a-value', nestedObj.fourth().getOrDie()['fourth.a']());
    // assert.eq()
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