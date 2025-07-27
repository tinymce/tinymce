import { ApproxStructure, Assertions, FocusTools, Keyboard, Keys, Mouse, StructAssert, UiFinder, Waiter } from '@ephox/agar';
import { describe, it } from '@ephox/bedrock-client';
import { Fun, Result } from '@ephox/katamari';
import { SelectorFind } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Focusing } from 'ephox/alloy/api/behaviour/Focusing';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Positioning } from 'ephox/alloy/api/behaviour/Positioning';
import { Receiving } from 'ephox/alloy/api/behaviour/Receiving';
import { Replacing } from 'ephox/alloy/api/behaviour/Replacing';
import { Tooltipping } from 'ephox/alloy/api/behaviour/Tooltipping';
import { AlloyComponent } from 'ephox/alloy/api/component/ComponentApi';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Memento from 'ephox/alloy/api/component/Memento';
import { AlloySpec } from 'ephox/alloy/api/component/SpecTypes';
import { Container } from 'ephox/alloy/api/ui/Container';
import * as GuiSetup from 'ephox/alloy/test/GuiSetup';

describe('Tooltipping Behaviour', () => {
  const makeComponent = () => {
    const lazySink = (): Result<AlloyComponent, any> => memSink.getOpt(me).fold(
      () => Result.error('Could not find test sink'),
      Result.value
    );

    const makeButton = (name: string): AlloySpec => Container.sketch({
      dom: {
        tag: 'button',
        classes: [ name ],
        innerHtml: `${name}-html`
      },
      containerBehaviours: Behaviour.derive([
        Tooltipping.config({
          lazySink,
          delayForShow: Fun.constant(10),
          delayForHide: Fun.constant(10),
          tooltipDom: {
            tag: 'span'
          },
          tooltipComponents: [
            GuiFactory.text(`${name}-tooltip`)
          ]
        }),
        Focusing.config({ }),
        // Add receiving to ensure the default event order is configured
        Receiving.config({
          channels: { }
        })
      ])
    });

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
  };

  const memSink = Memento.record({
    dom: {
      tag: 'div',
      classes: [ 'tooltipping-test-sink' ]
    },
    behaviours: Behaviour.derive([
      Positioning.config({})
    ])
  });

  const gui = GuiSetup.bddSetup(makeComponent);

  const pAssertSinkContents = (component: AlloyComponent, children: ApproxStructure.Builder<StructAssert[]>) =>
    Waiter.pTryUntil(
      'Waiting for tooltip to appear in sink',
      () => Assertions.assertStructure(
        'Checking structure of sink',
        ApproxStructure.build((s, str, arr) => s.element('div', {
          children: children(s, str, arr)
        })),
        memSink.get(component).element
      )
    );

  const pAssertEmptySink = (component: AlloyComponent) =>
    pAssertSinkContents(component, (_s, _str, _arr) => []);

  const pAssertSinkHtml = (component: AlloyComponent, html: string) =>
    pAssertSinkContents(component, (s, str, _arr) => [
      s.element('span', {
        html: str.is(html)
      })
    ]);

  it('Checking initial structure', () => {
    Assertions.assertStructure(
      'Check initial tooltipping values',
      ApproxStructure.build((s, _str, arr) =>
        s.element('div', {
          classes: [ arr.has('tooltipping-container') ]
        })
      ),
      gui.component().element
    );
  });

  /*
       * Test
       *
       * 1. Create three buttons with alpha, beta, gamma tooltips
       * 2. Hover over alpha. Check appears.
       * 3. Hover over beta. Check appears. Check alpha disappears
       * 4. Focus gamma. Check appears. Check beta disappears
       * 5. Press left to make beta appear and gamma disappear
       */
  it('Checking tooltips appear and disappear on focus and hover', async () => {
    const component = gui.component();
    Mouse.hoverOn(component.element, 'button:contains("alpha-html")');
    await pAssertSinkHtml(component, 'alpha-tooltip');
    Mouse.hoverOn(component.element, 'button:contains("beta-html")');
    await pAssertSinkHtml(component, 'beta-tooltip');
    FocusTools.setFocus( component.element, 'button:contains("beta-html")');
    await pAssertSinkHtml(component, 'beta-tooltip');
    Keyboard.keydown( Keys.right(), { }, component.element);
    await pAssertSinkHtml(component, 'gamma-tooltip');
    Keyboard.keydown( Keys.right(), { }, component.element);
    await pAssertSinkHtml(component, 'alpha-tooltip');
  });

  it('Checking tooltips do not disappear when the tooltip is hovered, but do disappear when something else is hovered', async () => {
    const component = gui.component();
    Mouse.hoverOn(component.element, 'button:contains("alpha-html")');
    await pAssertSinkHtml(component, 'alpha-tooltip');
    Mouse.hoverOn(component.element, 'span:contains("alpha-tooltip")');
    await pAssertSinkHtml(component, 'alpha-tooltip');
    const alphaTooltip = UiFinder.findIn(component.element, 'span:contains("alpha-tooltip")');
    Mouse.mouseOut(alphaTooltip.getOrDie());
    await pAssertEmptySink(component);
  });

  it('Tooltips should not throw errors when the firing button is removed from the dom', () => {
    const component = gui.component();
    const alphaButton = component.getSystem().getByDom(
      SelectorFind.descendant(component.element, '.alpha').getOrDie('Could not find alpha button')
    ).toOptional().getOrDie('Could not find alpha button component');
    Mouse.hoverOn(component.element, 'button:contains("alpha-html")');
    Replacing.remove(component, alphaButton);
    // NOTE: This won't actual fail is this throws an error to the console :( It's
    // disconnected from the event queue.
  });
});

