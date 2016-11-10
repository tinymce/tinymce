define(
  'ephox.alloy.demo.DraggableDemo',

  [
    'ephox.alloy.api.Gui',
    'ephox.alloy.demo.HtmlDisplay',
    'ephox.sugar.api.Class',
    'ephox.sugar.api.Element',
    'ephox.sugar.api.Insert',
    'global!document'
  ],

  function (Gui, HtmlDisplay, Class, Element, Insert, document) {
    return function () {
      var gui = Gui.create();
      var body = Element.fromDom(document.body);
      Class.add(gui.element(), 'gui-root-demo-container');
      // Css.set(gui.element(), 'direction', 'rtl');

      Insert.append(body, gui.element());

      var button1 = HtmlDisplay.section(
        gui,
        'This button is a <code>button</code> that can be dragged',
        {
          uiType: 'button',
          dom: {
            tag: 'span',
            innerHtml: 'Drag me!',
            styles: {
              padding: '10px',
              display: 'inline-block',
              background: '#333',
              color: '#fff'
            }
          },
          dragging: {
            mode: 'mouse'
            // initial position?
          },
          eventOrder: {
            // Because this is a button, allow dragging. It will stop clicking.
            mousedown: [ 'dragging', 'alloy.base.behaviour' ]
          },
          unselecting: true
        }
      );

    };
  }
);