asynctest(
  'HotspotPositionTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Step',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.test.GuiSetup',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.PredicateExists',
    'global!Error',
    'global!setTimeout'
  ],
 
  function (Chain, Guard, NamedChain, Step, GuiFactory, GuiSetup, Result, Compare, PredicateExists, Error, setTimeout) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    GuiSetup.setup(function (store, doc, body) {
      var fixedSink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        uid: 'fixed-sink',
        positioning: {
          useFixed: true
        }
      });

      var relativeSink = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        uid: 'relative-sink',
        positioning: {
          useFixed: false
        }
      });

      var popup = GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div',
          innerHtml: 'Demo day',
          styles: {
            width: '200px',
            height: '150px',
            border: '1px solid black'
          }
        },
        uid: 'popup'
      });

      var hotspot = GuiFactory.build({
        uiType: 'button',
        text: 'Hotspot',
        action: function () { },
        dom: {
          styles: {
            position: 'absolute',
            left: '100px',
            top: '450px'
          }
        },
        uid: 'hotspot'
      });

      return GuiFactory.build({
        uiType: 'custom',
        dom: {
          tag: 'div'
        },
        components: [
          { built: fixedSink },
          { built: relativeSink },
          { built: popup },
          { built: hotspot }
        ]
      });

    }, function (doc, body, gui, component, store) {
      var cFindUid = function (uid) {
        return Chain.binder(function (context) {
          return context.getByUid(uid);
        });
      };

      var isInside = function (sinkComponent, popupComponent) {
        var isSink = function (el) {
          return Compare.eq(el, sinkComponent.element());
        };

        return PredicateExists.closest(popupComponent.element(), isSink);
      };

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.writeValue('context', gui),
            NamedChain.direct('context', cFindUid('fixed-sink'), 'fixed'),
            NamedChain.direct('context', cFindUid('relative-sink'), 'relative'),
            NamedChain.direct('context', cFindUid('hotspot'), 'hotspot'),
            NamedChain.direct('context', cFindUid('popup'), 'popup'),
            NamedChain.bundle(function (data) {
              data.relative.apis().addContainer(data.popup);
              data.relative.apis().position({
                anchor: 'hotspot',
                hotspot: data.hotspot
              }, data.popup);
              return Result.value(data);
            }),
            Chain.control(
              NamedChain.bundle(function (data) {
                var inside = isInside(data.relative, data.popup);
                return inside ? Result.value(data) : Result.error(
                  new Error('The popup does not appear within the relative sink container')
                );
              }),
              Guard.tryUntil('Ensuring that the popup is inside the relative sink', 100, 3000)
            ),

            NamedChain.bundle(function (data) {
              data.fixed.apis().addContainer(data.popup);
              data.fixed.apis().position({
                anchor: 'hotspot',
                hotspot: data.hotspot
              }, data.popup);
              return Result.value(data);
            }),
            Chain.control(
              NamedChain.bundle(function (data) {
                var inside = isInside(data.fixed, data.popup);
                return inside ? Result.value(data) : Result.error(
                  new Error('The popup does not appear within the fixed sink container')
                );
              }),
              Guard.tryUntil('Ensuring that the popup is inside the fixed sink', 100, 3000)
            )
          ])
        ])
      ];
    }, function () { success(); }, failure);
 

  }
);