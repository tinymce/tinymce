import { ApproxStructure, Assertions, Mouse, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Tooltipping } from 'ephox/alloy/api/behaviour/Tooltipping';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import { Result } from '@ephox/katamari';

UnitTest.asynctest('Tooltipping Behaviour', (success, failure) => {
  GuiSetup.setup((store, doc, body) => {
    const memSink = Memento.record({
      dom: {
        tag: 'div',
        classes: [ 'tooltipping-test-sink' ]
      },
      behaviours: Behaviour.derive([
        Positioning.config({ })
      ])
    });

    const lazySink = (): Result<AlloyComponent, any> => {
      return memSink.getOpt(me).fold(
        () => Result.error('Could not find test sink'),
        Result.value
      )
    };

    const me = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'tooltipping-container' ]
      },
      components: [
        memSink.asSpec(),
        Container.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'Button1'
          },
          containerBehaviours: Behaviour.derive([
            Tooltipping.config({
              lazySink: lazySink,
              tooltipDom: {
                tag: 'span',
                innerHtml: 'button1'
              }
            })
          ])
        })
      ]
    });

    return me;
  }, (doc, body, gui, component, store) => {
    return [
      Assertions.sAssertStructure(
        'Check initial tooltipping values',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('tooltipping-container') ]
          });
        }),
        component.element()
      ),

      /*
       * Test
       *
       * 1. Create three buttons with alpha, beta, gamma tooltips
       * 2. Hover over alpha. Check appears.
       * 3. Hover over beta. Check appears. Check alpha disappears
       * 4. Focus gamma. Check appears. Check beta disappears
       * 5. Press left to make beta appear and gamma disappear
       */

      /*
       * Repeat the same test, except with no exclusivity set
       */

      Mouse.sHoverOn(component.element(), 'button:contains("Button1")'),


      Step.debugging
    ];
  }, () => { success(); }, failure);
});
