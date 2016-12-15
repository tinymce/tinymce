test(
  'CustomDefinitionTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.api.behaviour.BehaviourExport',
    'ephox.alloy.behaviour.CustomBehaviour',
    'ephox.alloy.construct.ComponentDom',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.test.ResultAssertions',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (RawAssertions, BehaviourExport, CustomBehaviour, ComponentDom, CustomDefinition, DomDefinition, DomModification, ResultAssertions, FieldSchema, ValueSchema, Fun, Result) {
    var checkErr = function (label, expectedPart, spec) {
      ResultAssertions.checkErrStr(
        label,
        expectedPart,
        function () {
          return CustomDefinition.toInfo(spec).fold(
            function (errInfo) {
              var formatted = ValueSchema.formatError(errInfo);
              console.log('formatted', formatted);
              return Result.error(formatted);
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
        }).fold(function (errInfo) {
          var formatted = ValueSchema.formatError(errInfo);
          console.log('formatted', formatted);
          return Result.error(formatted);
        }, Result.value);
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
      attributes: {
        'data-alloy-id': 'basic-uid',
        'role': 'presentation'
      },
      styles: { },
      value: '<none>',
      innerHtml: '<none>',
      defChildren: '<none>',
      domChildren: '0 children, but still specified'
    }, {
      uid: 'basic-uid',
      dom: {
        tag: 'span'
      },
      components: [ ]
    });

    checkErr('Basics supplied with behaviour that adds classes and does have it but does not follow schema', 
      '*strict* value for "a"', 
      {
        uid: 'missing-a',
        dom: {
          tag: 'span'
        },
        components: [ ],
        customBehaviours: [
          BehaviourExport.santa([
            FieldSchema.strict('a')
          ], 'behaviourA', {
            exhibit: function (info, base) {
              return DomModification.nu({
                classes: [ 'added-class-a' ]
              });
            }
          }, { }, { })
        ],
        behaviours: {
          behaviourA: {

          }
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
          'data-alloy-id': 'id-custom-button-1',
          role: 'presentation'
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
        behaviours: {
          'behaviourA': {
            a: true
          }
        },

        customBehaviours: [
          BehaviourExport.santa([
            FieldSchema.strict('a')
          ], 'behaviourA', {
            exhibit: function (info, base) {
              return DomModification.nu({
                classes: [ 'added-class-a' ]
              });
            }
          }, { }, { })
        ]
      }
    );
  }


);