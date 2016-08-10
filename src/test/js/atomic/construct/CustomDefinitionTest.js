test(
  'CustomDefinitionTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.test.ResultAssertions',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun'
  ],

  function (RawAssertions, CustomBehaviour, CustomDefinition, DomDefinition, DomModification, ResultAssertions, FieldPresence, FieldSchema, ValueSchema, Fun) {
    var checkErr = function (label, expectedPart, spec) {
      ResultAssertions.checkErr(
        label,
        expectedPart,
        function () {
          return CustomDefinition.toInfo(spec);
        }
      );
    };

    var checkDomVal = function (label, expected, spec) {
      ResultAssertions.checkVal(label, function () {
        var info = CustomDefinition.toInfo(spec);
        return info.map(CustomDefinition.toDefinition);
      }, function (value) {
        RawAssertions.assertEq(label, expected, DomDefinition.defToRaw(value));
      });
    };

    checkErr('Empty object', '*strict* value for "dom"', {});

    checkErr('Missing dom.tag', '*strict* value for "tag"', {
      dom: {

      }
    });

    checkErr('Missing components', '*strict* value for "components"', {
      dom: {
        tag: 'span'
      }
    });

    checkDomVal('Basics supplied', {
      tag: 'span',
      classes: [ ],
      attributes: { },
      styles: { },
      value: '<none>',
      innerHtml: '<none>',
      defChildren: '<none>',
      domChildren: '0 children, but still specified'
    }, {
      dom: {
        tag: 'span'
      },
      components: [ ]
    });

    checkDomVal('Basics supplied with behaviour that adds classes but does not use it', {
      tag: 'span',
      classes: [ ],
      attributes: { },
      styles: { },
      value: '<none>',
      innerHtml: '<none>',
      defChildren: '<none>',
      domChildren: '0 children, but still specified'
    }, {
      dom: {
        tag: 'span'
      },
      components: [ ],
      behaviours: [
        CustomBehaviour('behaviourA', {
          exhibit: function (info, base) {
            return DomModification.nu({
              classes: [ 'added-class-a' ]
            });
          },

          schema: Fun.constant(
            ValueSchema.objOf([
              FieldSchema.strict('a')
            ])
          )
        })
      ]
    });

    checkErr('Basics supplied with behaviour that adds classes and does have it but does not follow schema', 
      '*strict* value for "a"', 
      {
        dom: {
          tag: 'span'
        },
        components: [ ],
        behaviours: [
          CustomBehaviour('behaviourA', {
            exhibit: function (info, base) {
              return DomModification.nu({
                classes: [ 'added-class-a' ]
              });
            },

            schema: Fun.constant(
              ValueSchema.objOf([
                FieldSchema.strict('a')
              ])
            )
          })
        ],
        behaviourA: {

        }
      }
    );

    checkDomVal(
      'Basics supplied with behaviour that adds classes and activates it with correct schema', 
      {
        tag: 'span',
        classes: [
          'added-class-a'
        ],
        attributes: { },
        styles: { },
        value: '<none>',
        innerHtml: '<none>',
        defChildren: '<none>',
        domChildren: '0 children, but still specified'
      }, {
        dom: {
          tag: 'span'
        },
        components: [ ],
        behaviours: [
          CustomBehaviour('behaviourA', {
            exhibit: function (info, base) {
              return DomModification.nu({
                classes: [ 'added-class-a' ]
              });
            },

            schema: Fun.constant(
              ValueSchema.objOf([
                FieldSchema.strict('a')
              ])
            )
          })
        ],
        'behaviourA': {
          a: true
        }
      }
    );

    // Add more tests.

  }


);