test(
  'AriaRegisterTest',
 
  [
    'ephox.agar.api.ApproxStructure',
    'ephox.agar.api.Assertions',
    'ephox.echo.api.AriaRegister',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Html',
    'ephox.violin.Strings'
  ],
 
  function (ApproxStructure, Assertions, AriaRegister, Element, Html, Strings) {

    var checkDialogButton = function (expectedStructure, expectedHtml, element) {
      AriaRegister.dialogButton(element);
      Assertions.assertStructure(
        'Checking dialog button attributes',
        expectedStructure,
        element
      );
      Assertions.assertHtml('Checking dialog button html',
        expectedHtml,
        Html.getOuter(element));
    };

    checkDialogButton(ApproxStructure.build(
      function (s, str, arr) {
        return s.element('div', {
          attrs: {
            'role': str.is('button')
          }
        }
        );
      }),
      '<div role="button"></div>', 
      Element.fromTag('div')
    );

    var checkLabelledField = function (expectedDom, expectedHtmlPrefix, field, name, labelText) {
      var element = AriaRegister.labelledField(field, name, labelText);
      assert.eq('function', typeof(element.element), 'expecting element method');
      assert.eq('function', typeof(element.field), 'expecting field method');
      assert.eq(expectedHtmlPrefix, Html.getOuter(element.element()).substr(0,expectedHtmlPrefix.length));
      Assertions.assertStructure('Checking labelledField structure',
        expectedDom,
        element.element());
    };

    checkLabelledField(
      ApproxStructure.build(
      function (s, str, arr) {
        return s.element('div', {
          children: [ 
            s.element('label', { 
                attrs: {'for': str.startsWith('bob_')},
                html: str.is('Bob Text') 
              }), 
            s.element('input', { attrs: {'id': str.startsWith('bob_')} })
            ]
          }
        );
      }),
      '<div><label for="bob_',
      Element.fromTag('input'), 'bob', 'Bob Text');

    checkLabelledField(
      ApproxStructure.build(
      function (s, str, arr) {
        return s.element('div', {
          children: [ 
            s.element('label', { 
                attrs: {'for': str.startsWith('bob_')},
                html: str.is('Bob Text') 
              }), 
            s.element('select', { attrs: {'id': str.startsWith('bob_')} })
            ]
          }
        );
      }),
      '<div><label for="bob_',
      Element.fromTag('select'), 'bob', 'Bob Text');
  }
);