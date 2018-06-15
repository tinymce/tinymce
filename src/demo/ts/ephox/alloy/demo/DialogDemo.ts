import { Option, Result } from '@ephox/katamari';
import { Class, Element } from '@ephox/sugar';
import * as DomFactory from 'ephox/alloy/api/component/DomFactory';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import * as Attachment from 'ephox/alloy/api/system/Attachment';
import * as Gui from 'ephox/alloy/api/system/Gui';
import { Container } from 'ephox/alloy/api/ui/Container';
import { ModalDialog } from 'ephox/alloy/api/ui/ModalDialog';
import DemoSink from 'ephox/alloy/demo/DemoSink';
import HtmlDisplay from 'ephox/alloy/demo/HtmlDisplay';
import { document, console } from '@ephox/dom-globals';

export default (): void => {
  const gui = Gui.create();
  const body = Element.fromDom(document.body);
  Class.add(gui.element(), 'gui-root-demo-container');
  Attachment.attachSystem(body, gui);

  const sink = DemoSink.make();

  gui.add(sink);

  const lazySink = () => {
    return Result.value(sink);
  };

  const pTitle = ModalDialog.parts().title({
    dom: DomFactory.fromHtml('<div class="mce-title">Insert Link</div>')
  });

  const pDraghandle = ModalDialog.parts().draghandle({
    dom: DomFactory.fromHtml('<div class="mce-dragh"></div>')
  });

  const pClose = ModalDialog.parts().close({
    dom: DomFactory.fromHtml('<button type="button" aria-hidden="true" class="mce-close"></button>'),
    components: [
      Container.sketch({ dom: { tag: 'i', classes: [ 'mce-ico', 'mce-i-remove' ] } })
    ]
  });

  const pBody = ModalDialog.parts().body({
    dom: DomFactory.fromHtml('<div></div>'),
    components: [
      Container.sketch({
        dom: DomFactory.fromHtml('<div style="width: 400px; height: 200px;"></div>')
      })
    ]
  });

  const pFooter = ModalDialog.parts().footer({
    dom: {
      tag: 'div'
    }
  });

  const dialog = GuiFactory.build(
    ModalDialog.sketch({
      dom: DomFactory.fromHtml('<div class="mce-container mce-panel mce-floatpanel mce-window mce-in"></div>'),
      components: [
        Container.sketch({
          dom: DomFactory.fromHtml('<div class="mce-reset" role="application"></div>'),
          components: [
            Container.sketch({
              dom: DomFactory.fromHtml('<div class="mce-window-head"></div>'),
              components: [
                pTitle,
                pDraghandle,
                pClose
              ]
            }),
            Container.sketch({
              dom: DomFactory.fromHtml('<div class="mce-container-body mce-window-body mce-abs-layout"></div>'),
              components: [
                pBody
              ]
            }),
            Container.sketch({
              dom: DomFactory.fromHtml('<div class="mce-container mce-panel mce-foot"></div>'),
              components: [
                pFooter
              ]
            })
          ]
        })
      ],

      lazySink,
      onEscape () {
        console.log('escaping');
        return Option.some(true);
      },
      dragBlockClass: 'blocker-class',

      parts: {
        blocker: { }
      }
    })
  );

  HtmlDisplay.section(
    gui,
    'This dialog is customised',
    GuiFactory.premade(sink)
  );

  ModalDialog.show(dialog);
};