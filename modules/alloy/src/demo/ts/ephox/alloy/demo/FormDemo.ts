import { console, document, setTimeout } from '@ephox/dom-globals';
import { Obj, Result } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';

import * as Behaviour from 'ephox/alloy/api/behaviour/Behaviour';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import { Tabstopping } from 'ephox/alloy/api/behaviour/Tabstopping';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Container } from 'ephox/alloy/api/ui/Container';
import { ExpandableForm } from 'ephox/alloy/api/ui/ExpandableForm';
import { Form } from 'ephox/alloy/api/ui/Form';
import { FormField } from 'ephox/alloy/api/ui/FormField';
import { Input } from 'ephox/alloy/api/ui/Input';
import DemoDataset from 'ephox/alloy/demo/DemoDataset';
import * as DemoSink from 'ephox/alloy/demo/DemoSink';
import * as HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { FormParts } from 'ephox/alloy/ui/types/FormTypes';

import * as DemoFields from './forms/DemoFields';

// tslint:disable:no-console

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const lazySink = () => Result.value(sink);

  const alphaSpec = { label: 'Alpha', inline: false };
  const betaSpec = { label: 'Beta', inline: false };
  const gammaSpec = { label: 'Gamma', inline: true };
  const deltaSpec = { label: 'Delta', inline: false };
  const epsilonSpec = { label: 'Epsilon' };

  const thetaSpec = {
    label: 'AA',
    options: [
      { value: 'a.a', text: 'A.A' },
      { value: 'b.b', text: 'B.B' },
      { value: 'c.c', text: 'C.C' },
      { value: 'd.d', text: 'D.D' }
    ]
  };

  const rhoSpec = {
    legend: 'Rho',
    choices: [
      { value: 'left', text: 'Left' },
      { value: 'middle', text: 'Middle' },
      { value: 'right', text: 'Right' }
    ]
  };

  const omegaSpec = {
    field1: { label: 'omega-1', inline: false },
    field2: { label: 'omega-2', inline: false }
  };

  const maxiSpec = {
    label: 'Maxis',
    dataset: DemoDataset,
    lazySink
  };

  const form = HtmlDisplay.section(
    gui,
    'This form has many fields',
    Form.sketch((parts: FormParts) => ({
      dom: {
        tag: 'div',
        classes: [ 'outside-form' ]
      },

      components: [
        parts.field('aria', FormField.sketch({
          dom: {
            tag: 'span'
          },
          components: [
            FormField.parts().label({
              dom: {
                tag: 'label',
                innerHtml: 'aria test'
              }
            }),
            FormField.parts().field({ factory: Input }),
            FormField.parts()['aria-descriptor']({
              text: 'aria descriptor'
            })
          ]
        })),
        parts.field('alpha', DemoFields.textMunger(alphaSpec)),
        parts.field('beta', DemoFields.textMunger(betaSpec)),
        Container.sketch({
          dom: {
            styles: {
              border: '1px solid green'
            }
          },
          components: [
            parts.field('gamma', DemoFields.textMunger(gammaSpec))
          ]
        }),

        parts.field('delta', DemoFields.textMunger(deltaSpec)),
        parts.field('epsilon', DemoFields.textMunger(epsilonSpec)),
        parts.field('theta', DemoFields.selectMunger(thetaSpec)),
        parts.field('rho', DemoFields.chooserMunger(rhoSpec)),
        parts.field('omega', DemoFields.coupledTextMunger(omegaSpec)),
        parts.field('maxis', DemoFields.typeaheadMunger(maxiSpec)),

        Button.sketch({
          dom: {
            tag: 'button',
            innerHtml: 'OK'
          },
          action(_button) {
            console.log('Form values', Obj.map(
              Representing.getValue(form),
              (v) => v.getOr('Not found')
            ));
          }
        })
      ],

      formBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'cyclic'
        })
      ])
    }))
  );

  Representing.setValue(form, {
    alpha: 'doggy',
    beta: 'bottle',
    gamma: 'cad'
  });

  const expform = HtmlDisplay.section(
    gui,
    'This form expands',
    ExpandableForm.sketch({
      dom: {
        tag: 'div',
        classes: [ 'expandable-form' ]
      },

      markers: {
        expandedClass: 'demo-form-expanded',
        collapsedClass: 'demo-form-collapsed',
        closedClass: 'demo-form-closed',
        openClass: 'demo-form-open',
        shrinkingClass: 'demo-form-shrinking',
        growingClass: 'demo-form-growing'
      },

      components: [
        ExpandableForm.parts().minimal(
          Form.sketch((parts: FormParts) => ({
            dom: {
              tag: 'div',
              classes: [ 'demo-form-section', 'demo-form-minimal' ]
            },

            components: [
              parts.field('omega', DemoFields.coupledTextMunger(omegaSpec)),
              parts.field('alpha', DemoFields.textMunger(alphaSpec)),
              parts.field('beta', DemoFields.textMunger(betaSpec))
            ]
          }))
        ),

        ExpandableForm.parts().extra(
          Form.sketch((parts: FormParts) => ({
            dom: {
              tag: 'div',
              classes: [ 'demo-form-section', 'demo-form-extra' ]
            },
            components: [
              parts.field('beta', DemoFields.textMunger(betaSpec)),
              Container.sketch({
                dom: {
                  styles: {
                    border: '1px solid green'
                  }
                },
                components: [
                  parts.field('gamma', DemoFields.textMunger(gammaSpec))
                ]
              }),
              parts.field('delta', DemoFields.textMunger(deltaSpec)),
              parts.field('epsilon', DemoFields.textMunger(epsilonSpec)),
              parts.field('rho', DemoFields.chooserMunger(rhoSpec))
            ]
          }))
        ),
        ExpandableForm.parts().expander({
          dom: {
            tag: 'button',
            innerHtml: 'v'
          },
          buttonBehaviours: Behaviour.derive([
            Tabstopping.config({ })
          ])
        }),
        ExpandableForm.parts().controls({
          dom: {
            tag: 'div'
          },
          behaviours: Behaviour.derive([
            Tabstopping.config({ }),
            Keying.config({
              mode: 'flow',
              selector: 'button'
            })
          ]),
          components: [
            Button.sketch(
              {
                dom: { tag: 'button', innerHtml: 'OK' },
                action(_button) {
                  console.log('Exp Form values', Obj.map(
                    Representing.getValue(expform),
                    (v) => v.getOr('Not found')
                  ));
                }
              }
            )
          ]
        })
      ],
      expandableBehaviours: Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          visibilitySelector: '.demo-form-section'
        })
      ])
    })
  );

  Keying.focusIn(expform);

  setTimeout(() => {
    ExpandableForm.toggleForm(expform);

    Representing.setValue(form, {
      alpha: 'hi'
    });

    console.log('form', Obj.map(Representing.getValue(form), (v) => v.getOrDie()));

    console.log('expform', Obj.map(Representing.getValue(expform), (v) => v.getOrDie()));

    Representing.setValue(expform, {
      omega: 'hi'
    });

    Representing.getValue(expform);

  }, 100);
};
