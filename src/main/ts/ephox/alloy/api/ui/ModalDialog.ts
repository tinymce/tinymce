import Behaviour from '../behaviour/Behaviour';
import Keying from '../behaviour/Keying';
import GuiFactory from '../component/GuiFactory';
import SketchBehaviours from '../component/SketchBehaviours';
import Attachment from '../system/Attachment';
import Sketcher from './Sketcher';
import AlloyParts from '../../parts/AlloyParts';
import ModalDialogSchema from '../../ui/schema/ModalDialogSchema';
import { Merger } from '@ephox/katamari';
import { Traverse } from '@ephox/sugar';

var factory = function (detail, components, spec, externals) {
  var showDialog = function (dialog) {
    var sink = detail.lazySink()().getOrDie();
    var blocker = sink.getSystem().build(
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

  var hideDialog = function (dialog) {
    Traverse.parent(dialog.element()).each(function (blockerDom) {
      dialog.getSystem().getByDom(blockerDom).each(function (blocker) {
        Attachment.detach(blocker);
      });
    });
  };

  var getDialogBody = function (dialog) {
    return AlloyParts.getPartOrDie(dialog, detail, 'body');
  };

  return {
    dom: Merger.deepMerge({
      attributes: {
        role: 'dialog'
      }
    }, detail.dom()),
    components: components,
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

export default <any> Sketcher.composite({
  name: 'ModalDialog',
  configFields: ModalDialogSchema.schema(),
  partFields: ModalDialogSchema.parts(),
  factory: factory,
  apis: {
    show: function (apis, dialog) {
      apis.show(dialog);
    },
    hide: function (apis, dialog) {
      apis.hide(dialog);
    },
    getBody: function (apis, dialog) {
      return apis.getBody(dialog);
    }
  }
});