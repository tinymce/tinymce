import Assertions from 'ephox/agar/api/Assertions';
import Chain from 'ephox/agar/api/Chain';
import Pipeline from 'ephox/agar/api/Pipeline';
import UiControls from 'ephox/agar/api/UiControls';
import { Element } from '@ephox/sugar';
import { Insert } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('UiControlsTest', function() {
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
});

