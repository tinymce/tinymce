import { Merger } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

import * as AlloyParts from '../../parts/AlloyParts';
import * as ModalDialogSchema from '../../ui/schema/ModalDialogSchema';
import * as Behaviour from '../behaviour/Behaviour';
import { Keying } from '../behaviour/Keying';
import * as GuiFactory from '../component/GuiFactory';
import * as SketchBehaviours from '../component/SketchBehaviours';
import * as Attachment from '../system/Attachment';
import * as Sketcher from './Sketcher';
import { AlloyComponent } from '../../api/component/ComponentApi';
import { ModalDialogSketcher, ModalDialogDetail } from '../../ui/types/ModalDialogTypes';
import { CompositeSketchFactory } from 'ephox/alloy/api/ui/UiSketcher';

const factory: CompositeSketchFactory<ModalDialogDetail> = function (detail, components, spec, externals) {
  // TODO IMPROVEMENT: Make close actually close the dialog by default!
  const showDialog = function (dialog) {
    const sink = detail.lazySink()().getOrDie();
    const blocker = sink.getSystem().build(
      Merger.deepMerge(
        externals.blocker(),
        {
          components: [
            GuiFactory.premade(dialog)
          ]
        }
      )
    );

    Attachment.attach(sink, blocker);
    Keying.focusIn(dialog);
  };

  const hideDialog = function (dialog) {
    Traverse.parent(dialog.element()).each(function (blockerDom) {
      dialog.getSystem().getByDom(blockerDom).each(function (blocker) {
        Attachment.detach(blocker);
      });
    });
  };

  const getDialogBody = function (dialog) {
    return AlloyParts.getPartOrDie(dialog, detail, 'body');
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
      getBody: getDialogBody
    },

    behaviours: Merger.deepMerge(
      Behaviour.derive([
        Keying.config({
          mode: 'cyclic',
          onEnter: detail.onExecute(),
          onEscape: detail.onEscape(),
          useTabstopAt: detail.useTabstopAt()
        })
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
    }
  }
}) as ModalDialogSketcher;

export {
  ModalDialog
};