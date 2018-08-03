import { Id, Merger, Option, Thunk } from '@ephox/katamari';
import { Attr, Css, Height, Traverse, Width, Location } from '@ephox/sugar';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import { CompositeSketchFactory } from '../../api/ui/UiSketcher';
import AriaLabel from '../../aria/AriaLabel';
import { CustomEvent } from '../../events/SimulatedEvent';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ModalDialogSchema from '../../ui/schema/ModalDialogSchema';
import { GetBusySpec, ModalDialogDetail, ModalDialogSketcher, ModalDialogSpec } from '../../ui/types/ModalDialogTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Replacing } from '../behaviour/Replacing';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Attachment from '../system/Attachment';
import * as Sketcher from './Sketcher';

const factory: CompositeSketchFactory<ModalDialogDetail, ModalDialogSpec> = (detail, components, spec, externals) => {

  const dialogBusyEvent = Id.generate('alloy.dialog.busy');
  const dialogIdleEvent = Id.generate('alloy.dialog.idle');

  interface DialogBusyEvent extends CustomEvent {
    getBusySpec: () => GetBusySpec;
  }

  const busyBehaviours = Behaviour.derive([
    // Trap the "Tab" key and don't let it escape.
    Keying.config({
      mode: 'special',
      focusIn: Option.some,
      onTab: () => Option.some(true),
      onShiftTab: () => Option.some(true)
    }),
    Focusing.config({ })
  ]);

  // TODO IMPROVEMENT: Make close actually close the dialog by default!
  const showDialog = (dialog) => {
    const sink = detail.lazySink()().getOrDie();

    const blocker = sink.getSystem().build(
      Merger.deepMerge(
        externals.blocker(),
        {
          components: [
            GuiFactory.premade(dialog)
          ],
          behaviours: Behaviour.derive([
            AddEventsBehaviour.config('dialog-blocker-events', [
              AlloyEvents.run(dialogIdleEvent, (blocker, se) => {
                if (Attr.has(dialog.element(), 'aria-busy')) {
                  Attr.remove(dialog.element(), 'aria-busy');
                  const contents = Replacing.contents(blocker);
                  Option.from(contents[contents.length - 1]).each((removee) => {
                    Replacing.remove(blocker, removee);
                  });
                }
              }),

              AlloyEvents.run<DialogBusyEvent>(dialogBusyEvent, (blocker, se) => {
                if (! Attr.has(dialog.element(), 'aria-busy')) {
                  Attr.set(dialog.element(), 'aria-busy', 'true');
                  const getBusySpec = se.event().getBusySpec();

                  const pos = Thunk.cached(() => {
                    return Location.absolute(dialog.element());
                  });

                  const boundStyles = {
                    'left': Css.getRaw(dialog.element(), 'left').getOrThunk(() => pos().left() + 'px'),
                    'top': Css.getRaw(dialog.element(), 'top').getOrThunk(() => pos().top() + 'px'),
                    'width': Css.getRaw(dialog.element(), 'width').getOrThunk(() => Width.get(dialog.element()) + 'px'),
                    'height': Css.getRaw(dialog.element(), 'height').getOrThunk(() => Height.get(dialog.element()) + 'px'),
                    'z-index': Css.get(dialog.element(), 'z-index'),
                    'position': Css.getRaw(dialog.element(), 'position').getOr('fixed')
                  };

                  const busySpec = getBusySpec(dialog, boundStyles, busyBehaviours);
                  const busy = blocker.getSystem().build(busySpec);
                  Replacing.append(blocker, GuiFactory.premade(busy));
                  if (busy.hasConfigured(Keying)) {
                    Keying.focusIn(busy);
                  }
                }
              }),
            ]),

            Replacing.config({ })
          ])
        }
      )
    );

    Attachment.attach(sink, blocker);
    Keying.focusIn(dialog);
  };

  const hideDialog = (dialog) => {
    Traverse.parent(dialog.element()).each((blockerDom) => {
      dialog.getSystem().getByDom(blockerDom).each((blocker) => {
        Attachment.detach(blocker);
      });
    });
  };

  const getDialogBody = (dialog) => {
    return AlloyParts.getPartOrDie(dialog, detail, 'body');
  };

  const setBusy = (dialog, getBusySpec) => {
    AlloyTriggers.emitWith(dialog, dialogBusyEvent, {
      getBusySpec
    });
  };

  const setIdle = (dialog) => {
    AlloyTriggers.emit(dialog, dialogIdleEvent);
  };

  const modalEventsId = Id.generate('modal-events');
  const eventOrder = {
    ...detail.eventOrder(),
    'alloy.system.attached': [modalEventsId].concat(detail.eventOrder()['alloy.system.attached'] || [])
  };

  return {
    uid: detail.uid(),
    dom: Merger.deepMerge({
      attributes: {
        role: 'dialog'
      }
    }, detail.dom()),
    components,
    apis: {
      show: showDialog,
      hide: hideDialog,
      getBody: getDialogBody,
      setIdle,
      setBusy
    },
    eventOrder,
    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          onEnter: detail.onExecute(),
          onEscape: detail.onEscape(),
          useTabstopAt: detail.useTabstopAt()
        }),
        AddEventsBehaviour.config(modalEventsId, [
          AlloyEvents.runOnAttached((c) => {
            AriaLabel.labelledBy(c.element(), AlloyParts.getPartOrDie(c, detail, 'title').element());
          })
        ])
      ]),
      SketchBehaviours.get(detail.modalBehaviours())
    )
  };
};

const ModalDialog = Sketcher.composite({
  name: 'ModalDialog',
  configFields: ModalDialogSchema.schema(),
  partFields: ModalDialogSchema.parts(),
  factory,
  apis: {
    show (apis, dialog) {
      apis.show(dialog);
    },
    hide (apis, dialog) {
      apis.hide(dialog);
    },
    getBody (apis, dialog) {
      return apis.getBody(dialog);
    },
    setBusy (apis, dialog, getBusySpec) {
      apis.setBusy(dialog, getBusySpec);
    },
    setIdle (apis, dialog) {
      apis.setIdle(dialog);
    }
  }
}) as ModalDialogSketcher;

export {
  ModalDialog
};