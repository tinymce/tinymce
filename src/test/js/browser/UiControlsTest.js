asynctest(
  'UiControlsTest',
 
  [
    'ephox.agar.api.Assertions',
    'ephox.agar.api.Chain',
    'ephox.agar.api.Pipeline',
    'ephox.agar.api.UiControls',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.dom.Insert'
  ],
 
  function (Assertions, Chain, Pipeline, UiControls, Element, Insert) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];
 
    var input = Element.fromTag('input');
    var container = Element.fromTag('container');

    Insert.append(container, input);

    Pipeline.async({}, [
      UiControls.sSetValueOn(container, 'input', 'step.value.1'),
      
      Chain.asStep(input, [
        UiControls.cGetValue,
        Assertions.cAssertEq('Checking that sSetValueOn sets the value and cGetValue reads it', 'step.value.1')
      ]),

      UiControls.sSetValue(input, 'step.value.2'),
      Chain.asStep(input, [
        UiControls.cGetValue,
        Assertions.cAssertEq('Checking that sSetValue sets the value and cGetValue reads it', 'step.value.2')
      ]),

      Chain.asStep(input, [
        UiControls.cSetValue('chain.value.1'),
        UiControls.cGetValue,
        Assertions.cAssertEq( 'Checking that cSetValue sets the value and cGetValue reads it', 'chain.value.1')
      ])

    ], function () { success(); }, failure);
  }
);