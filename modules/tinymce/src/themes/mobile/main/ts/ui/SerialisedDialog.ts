/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyEvents, AlloyTriggers, Behaviour, Button, Container, CustomEvent, Disabling, Form, Highlighting, Keying, Memento,
  NativeEvents, Representing
} from '@ephox/alloy';
import { FieldSchema, StructureSchema } from '@ephox/boulder';
import { Arr, Cell, Optional, Singleton } from '@ephox/katamari';
import { Css, EventArgs, SelectorFilter, SelectorFind, Width } from '@ephox/sugar';

import * as Receivers from '../channels/Receivers';
import * as SwipingModel from '../model/SwipingModel';
import * as Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';

interface NavigateEvent extends CustomEvent {
  readonly direction: number;
}

const sketch = (rawSpec) => {
  const navigateEvent = 'navigateEvent';

  const wrapperAdhocEvents = 'serializer-wrapper-events';
  const formAdhocEvents = 'form-events';

  const schema = StructureSchema.objOf([
    FieldSchema.required('fields'),
    // Used for when datafields are present.
    FieldSchema.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
    FieldSchema.required('onExecute'),
    FieldSchema.required('getInitialValue'),
    FieldSchema.customField('state', () => {
      return {
        dialogSwipeState: Singleton.value(),
        currentScreen: Cell(0)
      };
    })
  ]);

  const spec = StructureSchema.asRawOrDie('SerialisedDialog', schema, rawSpec);

  const navigationButton = (direction, directionName, enabled) => {
    return Button.sketch({
      dom: UiDomFactory.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
      action: (button) => {
        AlloyTriggers.emitWith(button, navigateEvent, { direction });
      },
      buttonBehaviours: Behaviour.derive([
        Disabling.config({
          disableClass: Styles.resolve('toolbar-navigation-disabled'),
          disabled: () => !enabled
        })
      ])
    });
  };

  const reposition = (dialog, message) => {
    SelectorFind.descendant(dialog.element, '.' + Styles.resolve('serialised-dialog-chain')).each((parent) => {
      Css.set(parent, 'left', (-spec.state.currentScreen.get() * message.width) + 'px');
    });
  };

  const navigate = (dialog, direction) => {
    const screens = SelectorFilter.descendants<HTMLElement>(dialog.element, '.' + Styles.resolve('serialised-dialog-screen'));
    SelectorFind.descendant(dialog.element, '.' + Styles.resolve('serialised-dialog-chain')).each((parent) => {
      if ((spec.state.currentScreen.get() + direction) >= 0 && (spec.state.currentScreen.get() + direction) < screens.length) {
        Css.getRaw(parent, 'left').each((left) => {
          const currentLeft = parseInt(left, 10);
          const w = Width.get(screens[0]);
          Css.set(parent, 'left', (currentLeft - (direction * w)) + 'px');
        });
        spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
      }
    });
  };

  // Unfortunately we need to inspect the DOM to find the input that is currently on screen
  const focusInput = (dialog) => {
    const inputs = SelectorFilter.descendants(dialog.element, 'input');
    const optInput = Optional.from(inputs[spec.state.currentScreen.get()]);
    optInput.each((input) => {
      dialog.getSystem().getByDom(input).each((inputComp) => {
        AlloyTriggers.dispatchFocus(dialog, inputComp.element);
      });
    });
    const dotitems = memDots.get(dialog);
    Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
  };

  const resetState = () => {
    spec.state.currentScreen.set(0);
    spec.state.dialogSwipeState.clear();
  };

  const memForm = Memento.record(
    Form.sketch((parts) => {
      return {
        dom: UiDomFactory.dom('<div class="${prefix}-serialised-dialog"></div>'),
        components: [
          Container.sketch({
            dom: UiDomFactory.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
            components: Arr.map(spec.fields, (field, i) => {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: UiDomFactory.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                components: [
                  navigationButton(-1, 'previous', (i > 0)),
                  parts.field(field.name, field.spec),
                  navigationButton(+1, 'next', (i < spec.maxFieldIndex))
                ]
              }) : parts.field(field.name, field.spec);
            })
          })
        ],

        formBehaviours: Behaviour.derive([
          Receivers.orientation((dialog, message) => {
            reposition(dialog, message);
          }),
          Keying.config({
            mode: 'special',
            focusIn: (dialog, _specialInfo) => {
              focusInput(dialog);
            },
            onTab: (dialog, _specialInfo) => {
              navigate(dialog, +1);
              return Optional.some(true);
            },
            onShiftTab: (dialog, _specialInfo) => {
              navigate(dialog, -1);
              return Optional.some(true);
            }
          }),

          AddEventsBehaviour.config(formAdhocEvents, [
            AlloyEvents.runOnAttached((dialog, _simulatedEvent) => {
              // Reset state to first screen.
              resetState();
              const dotitems = memDots.get(dialog);
              Highlighting.highlightFirst(dotitems);
              spec.getInitialValue(dialog).each((v) => {
                Representing.setValue(dialog, v);
              });
            }),

            AlloyEvents.runOnExecute(spec.onExecute),

            AlloyEvents.run<EventArgs<TransitionEvent>>(NativeEvents.transitionend(), (dialog, simulatedEvent) => {
              const event = simulatedEvent.event;
              if (event.raw.propertyName === 'left') {
                focusInput(dialog);
              }
            }),

            AlloyEvents.run<NavigateEvent>(navigateEvent, (dialog, simulatedEvent) => {
              const event = simulatedEvent.event;
              const direction = event.direction;
              navigate(dialog, direction);
            })
          ])
        ])
      };
    })
  );

  const memDots = Memento.record({
    dom: UiDomFactory.dom('<div class="${prefix}-dot-container"></div>'),
    behaviours: Behaviour.derive([
      Highlighting.config({
        highlightClass: Styles.resolve('dot-active'),
        itemClass: Styles.resolve('dot-item')
      })
    ]),
    components: Arr.bind(spec.fields, (_f, i) => {
      return i <= spec.maxFieldIndex ? [
        UiDomFactory.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')
      ] : [];
    })
  });

  return {
    dom: UiDomFactory.dom('<div class="${prefix}-serializer-wrapper"></div>'),
    components: [
      memForm.asSpec(),
      memDots.asSpec()
    ],

    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'special',
        focusIn: (wrapper) => {
          const form = memForm.get(wrapper);
          Keying.focusIn(form);
        }
      }),

      AddEventsBehaviour.config(wrapperAdhocEvents, [
        AlloyEvents.run<EventArgs<TouchEvent>>(NativeEvents.touchstart(), (_wrapper, simulatedEvent) => {
          const event = simulatedEvent.event;
          spec.state.dialogSwipeState.set(
            SwipingModel.init(event.raw.touches[0].clientX)
          );
        }),
        AlloyEvents.run<EventArgs<TouchEvent>>(NativeEvents.touchmove(), (_wrapper, simulatedEvent) => {
          const event = simulatedEvent.event;
          spec.state.dialogSwipeState.on((state) => {
            simulatedEvent.event.prevent();
            spec.state.dialogSwipeState.set(
              SwipingModel.move(state, event.raw.touches[0].clientX)
            );
          });
        }),
        AlloyEvents.run<EventArgs<TouchEvent>>(NativeEvents.touchend(), (wrapper, _simulatedEvent) => {
          spec.state.dialogSwipeState.on((state) => {
            const dialog = memForm.get(wrapper);
            // Confusing
            const direction = -1 * SwipingModel.complete(state);
            navigate(dialog, direction);
          });
        })
      ])
    ])
  };
};

export {
  sketch
};
