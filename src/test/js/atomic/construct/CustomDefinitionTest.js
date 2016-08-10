test(
  'CustomDefinitionTest',

  [
    'ephox.agar.api.RawAssertions',
    'ephox.alloy.construct.CustomDefinition',
    'ephox.alloy.dom.DomDefinition',
    'ephox.alloy.test.ResultAssertions'
  ],

  function (RawAssertions, CustomDefinition, DomDefinition, ResultAssertions) {
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

  }


);