import {
  ApproxStructure,
  Assertions,
  Chain,
  FocusTools,
  Keyboard,
  Keys,
  Logger,
  Mouse,
  Step,
  UiFinder,
  Waiter,
} from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Result } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Tooltipping } from 'ephox/alloy/api/behaviour/Tooltipping';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';

UnitTest.asynctest('Tooltipping Behaviour', (success, failure) => {

  const memSink = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tooltipping-test-sink' ]
    },
    behaviours: Behaviour.derive([
      Positioning.config({ })
    ])
  });

  GuiSetup.setup((store, doc, body) => {
    const lazySink = (): Result<AlloyComponent, any> => {
      return memSink.getOpt(me).fold(
        () => Result.error('Could not find test sink'),
        Result.value
      );
    };

    const makeButton = (name: string): AlloySpec => {
      return Container.sketch({
        dom: {
          tag: 'button',
          classes: [ name ],
          innerHtml: `${name}-html`
        },
        containerBehaviours: Behaviour.derive([
          Tooltipping.config({
            lazySink,
            delay: 100,
            tooltipDom: {
              tag: 'span',
            },
            tooltipComponents: [
              GuiFactory.text(`${name}-tooltip`)
            ]
          }),
          Focusing.config({ })
        ])
      });
    };

    const me = GuiFactory.build({
      dom: {
        tag: 'div',
        classes: [ 'tooltipping-container' ]
      },
      components: [
        memSink.asSpec(),
        makeButton('alpha'),
        makeButton('beta'),
        makeButton('gamma')
      ],
      behaviours: Behaviour.derive([
        Keying.config({
          mode: 'flow',
          selector: 'button'
        }),
        Replacing.config({ })
      ])
    });

    return me;
  }, (doc, body, gui, component, store) => {

    const alphaButton = component.getSystem().getByDom(
      SelectorFind.descendant(component.element(), '.alpha').getOrDie('Could not find alpha button')
    ).toOption().getOrDie('Could not find alpha button component');

    const sAssertSinkContents = (children) => Waiter.sTryUntil(
      'Waiting for tooltip to appear in sink',
      Assertions.sAssertStructure(
        'Checking structure of sink',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            children: children(s, str, arr)
          });
        }),
        memSink.get(component).element()
      ),
      100,
      1000
    );

    const sAssertEmptySink = Logger.t(
      'Waiting for sink to be empty',
      sAssertSinkContents((s, str, arr) => [ ])
    );

    const sAssertSinkHtml = (html: string) => Logger.t(
      'Waiting for ' + html + ' to be in sink',
      sAssertSinkContents((s, str, arr) => [
        s.element('span', {
          html: str.is(html)
        })
      ])
    );

    return Arr.flatten([
      Logger.ts(
        'Checking initial structure',
        [
          Assertions.sAssertStructure(
            'Check initial tooltipping values',
            ApproxStructure.build((s, str, arr) => {
              return s.element('div', {
                classes: [ arr.has('tooltipping-container') ]
              });
            }),
            component.element()
          )
        ]
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
      Logger.ts(
        'Checking tooltips appear and disappear on focus and hover',
        [
          Mouse.sHoverOn(component.element(), 'button:contains("alpha-html")'),
          sAssertSinkHtml('alpha-tooltip'),
          Mouse.sHoverOn(component.element(), 'button:contains("beta-html")'),
          sAssertSinkHtml('beta-tooltip'),
          FocusTools.sSetFocus('Focusing beta button', component.element(), 'button:contains("beta-html")'),
          sAssertSinkHtml('beta-tooltip'),
          Keyboard.sKeydown(doc, Keys.right(), { }),
          sAssertSinkHtml('gamma-tooltip'),
          Keyboard.sKeydown(doc, Keys.right(), { }),
          sAssertSinkHtml('alpha-tooltip')
        ]
      ),

      Logger.ts(
        'Checking tooltips do not disappear when the tooltip is hovered, but do disappear ' +
        'when something else is hovered',
        [
          Mouse.sHoverOn(component.element(), 'button:contains("alpha-html")'),
          Step.wait(200),
          sAssertSinkHtml('alpha-tooltip'),
          Mouse.sHoverOn(component.element(), 'span:contains("alpha-tooltip")'),
          Step.wait(200),
          Logger.t('Hovering the tooltip itself should not dismiss it', sAssertSinkHtml('alpha-tooltip')),
          Chain.asStep({ }, [
            Chain.inject(gui.element()),
            UiFinder.cFindIn('span:contains("alpha-tooltip")'),
            Mouse.cMouseOut
          ]),
          Step.wait(2000),
          Logger.t('Hovering outside the tooltip should dismiss it after delay', sAssertEmptySink),
        ]
      ),

      Logger.ts(
        'Tooltips should not throw errors when the firing button is removed from the dom',
        [
          Mouse.sHoverOn(component.element(), 'button:contains("alpha-html")'),
          Step.sync(() => {
            Replacing.remove(component, alphaButton);
          }),
          // NOTE: This won't actual fail is this throws an error to the console :( It's
          // disconnected from the event queue.
          Step.wait(1000)
        ]
      )
    ]);
  }, () => { success(); }, failure);
});
