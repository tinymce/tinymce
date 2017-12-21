import { Assertions } from '@ephox/agar';
import { Logger } from '@ephox/agar';
import { Pipeline } from '@ephox/agar';
import { Step } from '@ephox/agar';
import Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Toggling from 'ephox/alloy/api/behaviour/Toggling';
import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Element } from '@ephox/sugar';
import { UnitTest } from '@ephox/bedrock';

UnitTest.asynctest('Browser Test: api.ComponentConfiguredTest', function() {
  var success = arguments[arguments.length - 2];
  var failure = arguments[arguments.length - 1];

  Pipeline.async({}, [
    Logger.t(
      'Checking basic component without any behaviour',
      Step.sync(function () {
        var behaviourLess = GuiFactory.build({
          dom: {
            tag: 'div'
          }
        });

        Assertions.assertEq('hasConfigured', false, behaviourLess.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking basic component with toggling',
      Step.sync(function () {
        var toggler = GuiFactory.build({
          dom: {
            tag: 'div'
          },
          behaviours: Behaviour.derive([
            Toggling.config({
              toggleClass: 'toggled'
            })
          ])
        });

        Assertions.assertEq('hasConfigured', true, toggler.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking text component',
      Step.sync(function () {
        var toggler = GuiFactory.build(
          GuiFactory.text('nothing')
        );

        Assertions.assertEq('hasConfigured', false, toggler.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking external component',
      Step.sync(function () {
        var toggler = GuiFactory.build(
          GuiFactory.external({ element: Element.fromTag('div') })
        );

        Assertions.assertEq('hasConfigured', false, toggler.hasConfigured(Toggling));
      })
    )
  ], function () { success(); }, failure);
});

