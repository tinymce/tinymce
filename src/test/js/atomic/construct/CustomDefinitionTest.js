test(
  'CustomDefinitionTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.construct.ComponentDom',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.test.ResultAssertions',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (RawAssertions, CustomBehaviour, ComponentDom, CustomDefinition, DomDefinition, DomModification, ResultAssertions, FieldPresence, FieldSchema, ValueSchema, Fun, Result) {
    var checkErr = function (label, expectedPart, spec) {
      ResultAssertions.checkErrStr(
        label,
        expectedPart,
        function () {
//           // Format the error nicely
// var behaviours = CustomDefinition.behaviours(info);

//       var definition = CustomDefinition.toDefinition(info);

//       var modification = ComponentDom.combine(info, behaviours, definition).getOrDie();
//       console.log('modification', DomModification.modToRaw(modification));
//       var modDefinition = DomModification.merge(definition, modification);


          return CustomDefinition.toInfo(spec).fold(
            function (errInfo) {
              return Result.error(ValueSchema.formatError(errInfo));
            }, Result.value
          );
        }
      );
    };

    var checkDomVal = function (label, expected, spec) {
      ResultAssertions.checkVal(label, function () {
        var info = CustomDefinition.toInfo(spec);
        return info.bind(function (inf) {
          var behaviours = CustomDefinition.behaviours(inf);

          var definition = CustomDefinition.toDefinition(inf);

          return ComponentDom.combine(inf, behaviours, definition).map(function (mod) {
            return DomModification.merge(definition, mod);
          });
        });
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
        attributes: {
          'alloy-id': 'id-custom-button-1'
        },
        styles: { },
        value: '<none>',
        innerHtml: '<none>',
        defChildren: '<none>',
        domChildren: '0 children, but still specified'
      }, {
        dom: {
          tag: 'span'
        },
        uid: 'id-custom-button-1',
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