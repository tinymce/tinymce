/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloySpec, AlloyTriggers, Behaviour, CustomEvent, GuiFactory, InlineView, Keying,
  NativeEvents
} from '@ephox/alloy';
import { Arr, Cell, Id, Option, Result } from '@ephox/katamari';
import { Class, Css, Element, EventArgs, Focus, Width } from '@ephox/sugar';
import Delay from 'tinymce/core/api/util/Delay';

const forwardSlideEvent = Id.generate('forward-slide');
export interface ForwardSlideEvent extends CustomEvent {
  forwardContents: () => AlloySpec;
}

const backSlideEvent = Id.generate('backward-slide');
// tslint:disable-next-line:no-empty-interface
export interface BackwardSlideEvent extends CustomEvent { }

const changeSlideEvent = Id.generate('change-slide-event');
export interface ChangeSlideEvent extends CustomEvent {
  contents: () => AlloySpec;
  focus: () => Option<Element>;
}

const resizingClass = 'tox-pop--resizing';

const renderContextToolbar = (spec: { onEscape: () => Option<boolean>; sink: AlloyComponent }) => {
  const stack = Cell([ ]);

  return InlineView.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-pop' ]
    },
    fireDismissalEventInstead: {
      event: 'doNotDismissYet'
    },

    onShow: (comp) => {
      stack.set([ ]);
      InlineView.getContent(comp).each((c) => {
        Css.remove(c.element(), 'visibility');
      });
      Class.remove(comp.element(), resizingClass);
      Css.remove(comp.element(), 'width');
    },

    inlineBehaviours: Behaviour.derive([
      AddEventsBehaviour.config('context-toolbar-events', [
        AlloyEvents.runOnSource<EventArgs>(NativeEvents.transitionend(), (comp, _se) => {
          Class.remove(comp.element(), resizingClass);
          Css.remove(comp.element(), 'width');
        }),

        AlloyEvents.run<ChangeSlideEvent>(changeSlideEvent, (comp, se) => {
          // If it was partially through a slide, clear that and measure afresh
          Css.remove(comp.element(), 'width');
          const currentWidth = Width.get(comp.element());

          InlineView.setContent(comp, se.event().contents());
          Class.add(comp.element(), resizingClass);
          const newWidth = Width.get(comp.element());
          Css.set(comp.element(), 'width', currentWidth + 'px');
          InlineView.getContent(comp).each((newContents) => {
            se.event().focus().bind((f) => {
              Focus.focus(f);
              return Focus.search(comp.element());
            }).orThunk(() => {
              Keying.focusIn(newContents);
              return Focus.active();
            });
          });
          Delay.setTimeout(() => {
            Css.set(comp.element(), 'width', newWidth + 'px');
          }, 0);
        }),

        AlloyEvents.run<ForwardSlideEvent>(forwardSlideEvent, (comp, se) => {
          InlineView.getContent(comp).each((oldContents) => {
            stack.set(stack.get().concat([
              {
                bar: oldContents,
                // TODO: Not working
                focus: Focus.active()
              }
            ]));
          });
          AlloyTriggers.emitWith(comp, changeSlideEvent, {
            contents: se.event().forwardContents(),
            focus: Option.none()
          });
        }),

        AlloyEvents.run<BackwardSlideEvent>(backSlideEvent, (comp, _se) => {
          Arr.last(stack.get()).each((last) => {
            stack.set(stack.get().slice(0, stack.get().length - 1));
            AlloyTriggers.emitWith(comp, changeSlideEvent, {
              // Because we are using premade, we should have access to the same element
              // to give focus (although it isn't working)
              contents: GuiFactory.premade(last.bar),
              focus: last.focus
            });
          });
        })

      ]),
      Keying.config({
        mode: 'special',
        onEscape: (comp) => Arr.last(stack.get()).fold(
          () =>
          // Escape just focuses the content. It no longer closes the toolbar.
            spec.onEscape(),
          (_) => {
            AlloyTriggers.emit(comp, backSlideEvent);
            return Option.some(true);
          }
        )
      })
    ]),
    lazySink: () => Result.value(spec.sink)
  });

};

export {
  renderContextToolbar,
  forwardSlideEvent,
  backSlideEvent
};
