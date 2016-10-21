define(
  'ephox.alloy.demo.ToolbarsDemo',

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
      Insert.append(body, gui.element());

      var groups = [
        {
          label: 'group-1',
          components: [
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Alpha' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Beta' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Gamma' }, action: function () { } }

          ]
        },

        {
          label: 'group-2',
          components: [
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Delta' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Epsilon' }, action: function () { } }

          ]
        },
        {
          label: 'group-2',
          components: [
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Rho' }, action: function () { } },
            { uiType: 'button', dom: { tag: 'button', innerHtml: 'Theta' }, action: function () { } }

          ]
        }
      ];

      var toolbar = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that scrolls',
        {
          uiType: 'toolbar',
          groups: groups,
          overflowing: {
            mode: 'scroll',
            initWidth: '150px'
          }
        }
      );

      var toolbar2 = HtmlDisplay.section(
        gui,
        'This toolbar has overflow behaviour that uses a more drawer',
        {
          uiType: 'more.toolbar',
          uid: 'demo-more-toolbar',
          groups: groups,
          initWidth: '100px',
          dom: {
            styles: {
              // width: '300px',
              // display: 'flex',
              overflow: 'hidden'
            }
          },
          overflowButton: {
            uiType: 'button',
            dom: {
              tag: 'button',
              innerHtml: '-More-'
            }
          }
        }
      );

      window.addEventListener('resize', function () {
        toolbar2.apis().refresh();
      });
    };
  }
);