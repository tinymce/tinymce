import { Assertions, Logger, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Element } from '@ephox/sugar';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import Toggling from 'ephox/alloy/api/behaviour/Toggling';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';

UnitTest.asynctest('Browser Test: api.ComponentConfiguredTest', function () {
  const success = arguments[arguments.length - 2];
  const failure = arguments[arguments.length - 1];

  Pipeline.async({}, [
    Logger.t(
      'Checking basic component without any behaviour',
      Step.sync(function () {
        const behaviourLess = GuiFactory.build({
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
        const toggler = GuiFactory.build({
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
        const toggler = GuiFactory.build(
          GuiFactory.text('nothing')
        );

        Assertions.assertEq('hasConfigured', false, toggler.hasConfigured(Toggling));
      })
    ),

    Logger.t(
      'Checking external component',
      Step.sync(function () {
        const toggler = GuiFactory.build(
          GuiFactory.external({ element: Element.fromTag('div') })
        );

        Assertions.assertEq('hasConfigured', false, toggler.hasConfigured(Toggling));
      })
    )
  ], function () { success(); }, failure);
});
