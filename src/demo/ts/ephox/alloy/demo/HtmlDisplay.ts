import { Id, Thunk } from '@ephox/katamari';
import { DomEvent, Element, Html, TextContent } from '@ephox/sugar';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import Container from 'ephox/alloy/api/ui/Container';
import * as Debugging from 'ephox/alloy/debugging/Debugging';

const register = Thunk.cached(function (gui) {
  Debugging.registerInspector('htmldisplay', gui);
});

const section = function (gui, instructions, spec) {
  register(gui);
  const information = Container.sketch({
    dom: {
      tag: 'p',
      innerHtml: instructions
    }
  });

  const component = GuiFactory.build(spec);

  const display = GuiFactory.build(
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

  const dumpUid = Id.generate('html-dump');

  const htmlDump = Html.getOuter(component.element());
  const dump = Container.sketch({
    uid: dumpUid,
    dom: {
      tag: 'p',
      classes: [ 'html-display' ]
    },
    components: [
      GuiFactory.text(htmlDump)
    ]
  });

  const updateHtml = function () {
    gui.getByUid(dumpUid).each(function (dumpC) {
      // NOTE: Use Body.body() here for more information.
      TextContent.set(dumpC.element(), Html.getOuter(component.element()));
    });
  };

  const observer = new MutationObserver(function (mutations) {
    updateHtml();
  });

  observer.observe(component.element().dom(), { attributes: true, childList: true, characterData: true, subtree: true });

  const all = GuiFactory.build(
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

  const onMousedown = DomEvent.bind(Element.fromDom(document), 'mousedown', function (evt) {
    if (evt.raw().button === 0) {
      gui.broadcastOn([ 'dismiss.popups' ], {
        target: evt.target()
      });
    }
  });

  return component;

};

export default <any> {
  section
};