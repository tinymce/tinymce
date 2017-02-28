define(
  'ephox.alloy.demo.ForeignGuiDemo',

  [
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.system.ForeignGui',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.frame.Reader',
    'ephox.alloy.frame.Writer',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.InsertAll',
    'ephox.sugar.api.events.DomEvent',
    'ephox.sugar.api.node.Element',
    'ephox.sugar.api.node.Elements',
    'ephox.sugar.api.node.Node',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFind'
  ],

  function (SystemEvents, ForeignGui, EventHandler, Reader, Writer, Option, Insert, InsertAll, DomEvent, Element, Elements, Node, Css, SelectorFind) {
    return function () {
      var ephoxUi = SelectorFind.first('#ephox-ui').getOrDie();

      var onNode = function (name) {
        return function (elem) {
          return Node.name(elem) === name ? Option.some(elem) : Option.none();
        };
      };

      var contents = '<div><strong>drag1</strong> and <code>click1</code> and <strong>drag2</strong> and <code>click2</code></div>';

      var frame = Element.fromTag('iframe');
      Css.set(frame, 'min-width', '80%');
      var onload = DomEvent.bind(frame, 'load', function () {
        onload.unbind();
        Writer.write(
          frame, 
          '<html>' + 
            '<head>' +
              '<style>' + 
                '.selected { color: white; background: black; }' +
                '* { font-size: bigger; }\n' + 
                'span { padding: 30px; display: inline-block; border: 1px solid blue; }' + 
              '</style>' + 
            '</head>' +
            '<body>' +
              contents +
            '</body>' +
          '</html>'        
        );
        var root = Element.fromDom(Reader.doc(frame).dom().documentElement);
        addAsForeign(root, function (gui) {
          Insert.append(root, gui.element());
        });
      });

      var inlineContainer = Element.fromHtml(
        contents
      );

      var addAsForeign = function (root, doInsert) {
        var connection =  ForeignGui.engage({
          root: root,
          dynamics: [
            {
              getTarget: onNode('code'),
              config: {
                behaviours: {
                  toggling: {
                    toggleClass: 'selected'
                  }
                },

                events: {
                  click: EventHandler.nu({
                    run: function (component, simulatedEvent) {
                      // We have to remove the proxy first, because we are during a proxied event (click)
                      connection.unproxy(component);
                      connection.dispatchTo(SystemEvents.execute(), simulatedEvent.event());
                    }
                  })
                }
              }
            },
            {
              getTarget: onNode('strong'),
              config: {
                behaviours: {
                  dragging: {
                    mode: 'mouse',
                    blockerClass: 'blocker'
                  }
                }
              }
            }
          ]
        });

        return connection;
      };

      InsertAll.append(ephoxUi, 
        Elements.fromHtml(
          '<p>This is a demo for alloy delegation. The iframe and the div editor are not alloy components' +
            ' but they need to exhibit alloy behaviours. This is done through ForeignGui</p>' +
          '<p>Drag the <strong>dragx</strong> elements and click on the <code>clickx</code> elements</p>'
        )
      );

      Insert.append(ephoxUi, Element.fromHtml('<h3>IFrame Editor</h3>'));
      Insert.append(ephoxUi, frame);
      Insert.append(ephoxUi, Element.fromHtml('<h3>Div Editor</h3>'));
      Insert.append(ephoxUi, inlineContainer);


      addAsForeign(inlineContainer, function (gui) {
        Insert.after(inlineContainer, gui.element());
      });
    };
  }
);