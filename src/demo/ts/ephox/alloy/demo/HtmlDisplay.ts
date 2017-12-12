import GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Attachment from 'ephox/alloy/api/system/Attachment';
import Container from 'ephox/alloy/api/ui/Container';
import Debugging from 'ephox/alloy/debugging/Debugging';
import { Id } from '@ephox/katamari';
import { Thunk } from '@ephox/katamari';
import { DomEvent } from '@ephox/sugar';
import { Element } from '@ephox/sugar';
import { Html } from '@ephox/sugar';
import { TextContent } from '@ephox/sugar';

var register = Thunk.cached(function (gui) {
  Debugging.registerInspector('htmldisplay', gui);
});

var section = function (gui, instructions, spec) {
  register(gui);
  var information = Container.sketch({
    dom: {
      tag: 'p',
      innerHtml: instructions
    }
  });

  var component = GuiFactory.build(spec);

  var display = GuiFactory.build(
    Container.sketch({
      dom: {
        styles: {
          'padding-left': '100px',
          'padding-top': '20px',
          'padding-right': '100px',
          'border': '1px dashed green'
        }
      },
      components: [
        GuiFactory.premade(component)

      ]
    })
  );

  var dumpUid = Id.generate('html-dump');

  var htmlDump = Html.getOuter(component.element());
  var dump = Container.sketch({
    uid: dumpUid,
    dom: {
      tag: 'p',
      classes: [ 'html-display' ]
    },
    components: [
      GuiFactory.text(htmlDump)
    ]
  });

  var updateHtml = function () {
    gui.getByUid(dumpUid).each(function (dumpC) {
      // NOTE: Use Body.body() here for more information.
      TextContent.set(dumpC.element(), Html.getOuter(component.element()));
    });
  };

  var observer = new MutationObserver(function (mutations) {
    updateHtml();
  });

  observer.observe(component.element().dom(), { attributes: true, childList: true, characterData: true, subtree: true });

  var all = GuiFactory.build(
    Container.sketch({
      components: [
        Container.sketch({ dom: { tag: 'hr' } }),
        information,
        GuiFactory.premade(display),
        dump,
        Container.sketch({ dom: { tag: 'hr' } })
      ]
    })
  );

  gui.add(all);

  var onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
    if (evt.raw().button === 0) {
      gui.broadcastOn([ 'dismiss.popups' ], {
        target: evt.target()
      });
    }
  });

  return component;

};

export default <any> {
  section: section
};