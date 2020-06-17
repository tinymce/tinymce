import { Cell, Id, Option } from '@ephox/katamari';
import { Attr, Traverse } from '@ephox/sugar';

import * as AddEventsBehaviour from '../../api/behaviour/AddEventsBehaviour';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { AlloySpec } from '../../api/component/SpecTypes';
import * as AlloyEvents from '../../api/events/AlloyEvents';
import * as AlloyTriggers from '../../api/events/AlloyTriggers';
import * as NativeEvents from '../../api/events/NativeEvents';
import * as AriaDescribe from '../../aria/AriaDescribe';
import * as AriaLabel from '../../aria/AriaLabel';
import { CustomEvent } from '../../events/SimulatedEvent';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ModalDialogSchema from '../../ui/schema/ModalDialogSchema';
import { GetBusySpec, ModalDialogApis, ModalDialogDetail, ModalDialogSketcher, ModalDialogSpec } from '../../ui/types/ModalDialogTypes';
import * as Behaviour from '../behaviour/Behaviour';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Replacing } from '../behaviour/Replacing';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Attachment from '../system/Attachment';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

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
      onTab: () => Option.some<boolean>(true),
      onShiftTab: () => Option.some<boolean>(true)
    }),
    Focusing.config({ })
  ]);

  // TODO IMPROVEMENT: Make close actually close the dialog by default!
  const showDialog = (dialog: AlloyComponent) => {
    const sink = detail.lazySink(dialog).getOrDie();

    const busyComp = Cell(Option.none<AlloyComponent>());

    const externalBlocker = externals.blocker();

    const blocker = sink.getSystem().build({
      ...externalBlocker,
      components: externalBlocker.components.concat([
        GuiFactory.premade(dialog)
      ]),
      behaviours: Behaviour.derive([
        Focusing.config({ }),
        AddEventsBehaviour.config('dialog-blocker-events', [
          // Ensure we use runOnSource otherwise this would cause an infinite loop, as `focusIn` would fire a `focusin` which would then get responded to and so forth
          AlloyEvents.runOnSource(NativeEvents.focusin(), () => {
            Keying.focusIn(dialog);
          }),

          AlloyEvents.run(dialogIdleEvent, (_blocker, _se) => {
            if (Attr.has(dialog.element(), 'aria-busy')) {
              Attr.remove(dialog.element(), 'aria-busy');
              busyComp.get().each((bc) => Replacing.remove(dialog, bc));
            }
          }),

          AlloyEvents.run<DialogBusyEvent>(dialogBusyEvent, (blocker, se) => {
            Attr.set(dialog.element(), 'aria-busy', 'true');
            const getBusySpec = se.event().getBusySpec();

            busyComp.get().each((bc) => {
              Replacing.remove(dialog, bc);
            });
            const busySpec = getBusySpec(dialog, busyBehaviours);
            const busy = blocker.getSystem().build(busySpec);
            busyComp.set(Option.some(busy));
            Replacing.append(dialog, GuiFactory.premade(busy));
            if (busy.hasConfigured(Keying)) {
              Keying.focusIn(busy);
            }
          })
        ])
      ])
    });

    Attachment.attach(sink, blocker);
    Keying.focusIn(dialog);
  };

  const hideDialog = (dialog: AlloyComponent) => {
    Traverse.parent(dialog.element()).each((blockerDom) => {
      dialog.getSystem().getByDom(blockerDom).each((blocker) => {
        Attachment.detach(blocker);
      });
    });
  };

  const getDialogBody = (dialog: AlloyComponent) => AlloyParts.getPartOrDie(dialog, detail, 'body');

  const getDialogFooter = (dialog: AlloyComponent) => AlloyParts.getPartOrDie(dialog, detail, 'footer');

  const setBusy = (dialog: AlloyComponent, getBusySpec: AlloySpec) => {
    AlloyTriggers.emitWith(dialog, dialogBusyEvent, {
      getBusySpec
    });
  };

  const setIdle = (dialog: AlloyComponent) => {
    AlloyTriggers.emit(dialog, dialogIdleEvent);
  };

  const modalEventsId = Id.generate('modal-events');
  const eventOrder = {
    ...detail.eventOrder,
    'alloy.system.attached': [ modalEventsId ].concat(detail.eventOrder['alloy.system.attached'] || [])
  };

  return {
    uid: detail.uid,
    dom: detail.dom,
    components,
    apis: {
      show: showDialog,
      hide: hideDialog,
      getBody: getDialogBody,
      getFooter: getDialogFooter,
      setIdle,
      setBusy
    },
    eventOrder,
    domModification: {
      attributes: {
        'role': 'dialog',
        'aria-modal': 'true'
      }
    },
    behaviours: SketchBehaviours.augment(
      detail.modalBehaviours,
      [
        Replacing.config({ }),
        Keying.config({
          mode: 'cyclic',
          onEnter: detail.onExecute,
          onEscape: detail.onEscape,
          useTabstopAt: detail.useTabstopAt
        }),
        AddEventsBehaviour.config(modalEventsId, [
          AlloyEvents.runOnAttached((c) => {
            AriaLabel.labelledBy(c.element(), AlloyParts.getPartOrDie(c, detail, 'title').element());
            AriaDescribe.describedBy(c.element(), AlloyParts.getPartOrDie(c, detail, 'body').element());
          })
        ])
      ]
    )
  };
};

const ModalDialog: ModalDialogSketcher = Sketcher.composite<ModalDialogSpec, ModalDialogDetail, ModalDialogApis>({
  name: 'ModalDialog',
  configFields: ModalDialogSchema.schema(),
  partFields: ModalDialogSchema.parts(),
  factory,
  apis: {
    show: (apis, dialog) => {
      apis.show(dialog);
    },
    hide: (apis, dialog) => {
      apis.hide(dialog);
    },
    getBody: (apis, dialog) => apis.getBody(dialog),
    getFooter: (apis, dialog) => apis.getFooter(dialog),
    setBusy: (apis, dialog, getBusySpec) => {
      apis.setBusy(dialog, getBusySpec);
    },
    setIdle: (apis, dialog) => {
      apis.setIdle(dialog);
    }
  }
});

export {
  ModalDialog
};
