import { ApproxStructure, Assertions, Chain, Step, StructAssert } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Result } from '@ephox/katamari';

import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import { Button } from 'ephox/alloy/api/ui/Button';
import { Input } from 'ephox/alloy/api/ui/Input';
import { SlotContainer } from 'ephox/alloy/api/ui/SlotContainer';

UnitTest.asynctest('SlotContainerTest', (success, failure) => {

  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      SlotContainer.sketch((parts) => ({
        dom: {
          tag: 'div',
          classes: [ 'test-slot-container' ]
        },
        components: [
          parts.slot('inputA', Input.sketch({ inputClasses: [ 'slot-input' ] })),
          {
            dom: {
              tag: 'p',
              classes: [ 'something-else' ],
              innerHtml: 'Hello'
            }
          },
          {
            dom: {
              tag: 'div',
              classes: [ 'slot-wrapper' ]
            },
            components: [
              parts.slot('buttonB', Button.sketch({
                dom: {
                  tag: 'button',
                  classes: [ 'slot-button' ],
                  innerHtml: 'Patchy button'
                },
                action: store.adder('slot-button')
              }))
            ]
          }
        ]
      }))
    );
  }, (doc, body, gui, component, store) => {

    const cGetSlot = (slot: string) => Chain.binder(() => {
      return SlotContainer.getSlot(component, slot).fold(
        () => Result.error('Could not find slot: ' + slot),
        Result.value
      );
    });

    const sAssertSlotStructure = (label: string, slot: string, expectedStructure: ApproxStructure.Builder<StructAssert>) => Chain.asStep({ }, [
      cGetSlot(slot),
      Chain.op((c) => {
        Assertions.assertStructure(
          label,
          ApproxStructure.build(expectedStructure),
          c.element()
        );
      })
    ]);

    const sAssertButtonShowing = (label: string) => sAssertSlotStructure(label, 'buttonB', (s, str, arr) => {
      return s.element('button', {
        attrs: {
          'aria-hidden': str.none()
        },
        styles: {
          display: str.none()
        }
      });
    });

    const sAssertButtonHidden = (label: string) => sAssertSlotStructure(label, 'buttonB', (s, str, arr) => {
      return s.element('button', {
        attrs: {
          'aria-hidden': str.is('true')
        },
        styles: {
          display: str.is('none')
        }
      });
    });

    const sAssertInputShowing = (label: string) => sAssertSlotStructure(label, 'inputA', (s, str, arr) => {
      return s.element('input', {
        attrs: {
          'aria-hidden': str.none()
        },
        styles: {
          display: str.none()
        }
      });
    });

    const sAssertInputHidden = (label: string) => sAssertSlotStructure(label, 'inputA', (s, str, arr) => {
      return s.element('input', {
        attrs: {
          'aria-hidden': str.is('true')
        },
        styles: {
          display: str.is('none')
        }
      });
    });

    const cSlotShowing = (slot: string) => Chain.mapper(() => {
      return SlotContainer.isShowing(component, slot);
    });

    const sAssertSlotShowing = (slot: string, expectedShowing: boolean) => (label: string) => Chain.asStep({}, [
      cSlotShowing(slot),
      Assertions.cAssertEq('SlotContainer.isShowing(_,"' + slot + '") !== ' + expectedShowing + ' - ' + label, expectedShowing)
    ]);

    const sAssertButtonSlotShowing = sAssertSlotShowing('buttonB', true);
    const sAssertButtonSlotHidden = sAssertSlotShowing('buttonB', false);
    const sAssertInputSlotShowing = sAssertSlotShowing('inputA', true);
    const sAssertInputSlotHidden = sAssertSlotShowing('inputA', false);

    const cGetSlotNames = () => Chain.mapper(() => {
      return SlotContainer.getSlotNames(component);
    });

    const sAssertGetSlotNames = (label: string, expectedSlots: string[]) => Chain.asStep({}, [
      cGetSlotNames(),
      Assertions.cAssertEq(label, expectedSlots)
    ]);

    const sShowSlot = (slot: string) => Step.sync(() => {
      SlotContainer.showSlot(component, slot);
    });

    const sHideSlot = (slot: string) => Step.sync(() => {
      SlotContainer.hideSlot(component, slot);
    });

    const sHideAllSlots = () => Step.sync(() => {
      SlotContainer.hideAllSlots(component);
    });

    return [
      Assertions.sAssertStructure(
        'Checking initial structure',
        ApproxStructure.build((s, str, arr) => {
          return s.element('div', {
            classes: [ arr.has('test-slot-container') ],
            children: [
              s.element('input', { classes: [ arr.has('slot-input') ] }),
              s.element('p', { classes: [ arr.has('something-else') ] }),
              s.element('div', {
                classes: [ arr.has('slot-wrapper') ],
                children: [
                  s.element('button', {
                    classes: [ arr.has('slot-button') ]
                  })
                ]
              })
            ]
          });
        }),
        component.element()
      ),

      sAssertButtonShowing('button: Before any APIs are called'),
      sAssertInputShowing('input: Before any APIs are called'),
      sAssertInputSlotShowing('before any APIs are called'),
      sAssertButtonSlotShowing('before any APIs are called'),
      sHideSlot('buttonB'),
      sAssertButtonHidden('button: After SlotContainer.hideSlot(_, button)'),
      sAssertButtonSlotHidden('After SlotContainer.hideSlot(_, button)'),
      sAssertInputShowing('input: After SlotContainer.hideSlot(_, button)'),
      sAssertInputSlotShowing('After SlotContainer.hideSlot(_, button)'),
      sShowSlot('buttonB'),
      sAssertButtonShowing('button: After SlotContainer.showSlot(_, button)'),
      sAssertButtonSlotShowing('After SlotContainer.showSlot(_, button)'),
      sAssertInputShowing('input: After SlotContainer.showSlot(_, button)'),
      sAssertInputSlotShowing('After SlotContainer.showSlot(_, button)'),
      sHideSlot('inputA'),
      sAssertButtonShowing('button: After SlotContainer.hideSlot(_, input)'),
      sAssertButtonSlotShowing('After SlotContainer.hideSlot(_, input)'),
      sAssertInputHidden('input: After SlotContainer.hideSlot(_, input)'),
      sAssertInputSlotHidden('After SlotContainer.hideSlot(_, input)'),
      sShowSlot('inputA'),
      sAssertButtonShowing('button: After SlotContainer.showSlot(_, input)'),
      sAssertInputShowing('input: After SlotContainer.showSlot(_, input)'),
      sAssertInputSlotShowing('After SlotContainer.showSlot(_, input)'),
      sAssertButtonSlotShowing('After SlotContainer.showSlot(_, input)'),
      sHideAllSlots(),
      sAssertButtonHidden('button: After SlotContainer.hideAllSlots(_)'),
      sAssertInputHidden('input: After SlotContainer.hideAllSlots(_)'),
      sAssertInputSlotHidden('After SlotContainer.hideAllSlots(_)'),
      sAssertButtonSlotHidden('After SlotContainer.hideAllSlots(_)'),
      sAssertGetSlotNames('checking the list slots', ['inputA', 'buttonB']),
    ];
  }, () => { success(); }, failure);
});
