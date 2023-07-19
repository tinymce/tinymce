import { Fun, Id, Singleton } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import * as AriaLabel from '../../aria/AriaLabel';
import * as AlloyParts from '../../parts/AlloyParts';
import * as ModalDialogSchema from '../../ui/schema/ModalDialogSchema';
import { GetBusySpec, ModalDialogApis, ModalDialogDetail, ModalDialogSketcher, ModalDialogSpec } from '../../ui/types/ModalDialogTypes';
import * as AddEventsBehaviour from '../behaviour/AddEventsBehaviour';
import * as Behaviour from '../behaviour/Behaviour';
import { Blocking } from '../behaviour/Blocking';
import { Focusing } from '../behaviour/Focusing';
import { Keying } from '../behaviour/Keying';
import { Replacing } from '../behaviour/Replacing';
import { AlloyComponent } from '../component/ComponentApi';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as AlloyEvents from '../events/AlloyEvents';
import * as NativeEvents from '../events/NativeEvents';
import * as SystemEvents from '../events/SystemEvents';
import * as Attachment from '../system/Attachment';
import * as Sketcher from './Sketcher';
import { CompositeSketchFactory } from './UiSketcher';

const factory: CompositeSketchFactory<ModalDialogDetail, ModalDialogSpec> = (detail, components, spec, externals) => {

  const dialogComp = Singleton.value<AlloyComponent>();

  // TODO IMPROVEMENT: Make close actually close the dialog by default!
  const showDialog = (dialog: AlloyComponent) => {
    dialogComp.set(dialog);
    const sink = detail.lazySink(dialog).getOrDie();

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
            Blocking.isBlocked(dialog) ? Fun.noop() : Keying.focusIn(dialog);
          })
        ])
      ])
    });

    Attachment.attach(sink, blocker);
    Keying.focusIn(dialog);
  };

  const hideDialog = (dialog: AlloyComponent) => {
    dialogComp.clear();
    Traverse.parent(dialog.element).each((blockerDom) => {
      dialog.getSystem().getByDom(blockerDom).each((blocker) => {
        Attachment.detach(blocker);
      });
    });
  };

  const getDialogBody = (dialog: AlloyComponent) => AlloyParts.getPartOrDie(dialog, detail, 'body');

  const getDialogFooter = (dialog: AlloyComponent) => AlloyParts.getPart(dialog, detail, 'footer');

  const setBusy = (dialog: AlloyComponent, getBusySpec: GetBusySpec) => {
    Blocking.block(dialog, getBusySpec);
  };

  const setIdle = (dialog: AlloyComponent) => {
    Blocking.unblock(dialog);
  };

  const modalEventsId = Id.generate('modal-events');
  const eventOrder = {
    ...detail.eventOrder,
    [SystemEvents.attachedToDom()]: [ modalEventsId ].concat(detail.eventOrder['alloy.system.attached'] || [])
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
          useTabstopAt: detail.useTabstopAt,
          firstTabstop: detail.firstTabstop
        }),
        Blocking.config({
          getRoot: dialogComp.get
        }),
        AddEventsBehaviour.config(modalEventsId, [
          AlloyEvents.runOnAttached((c) => {
            AriaLabel.labelledBy(c.element, AlloyParts.getPartOrDie(c, detail, 'title').element);
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
