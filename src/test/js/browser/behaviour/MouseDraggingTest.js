asynctest(
  'MouseDraggingTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.UiFinder',
    'ephox.agar.mouse.Clicks',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Dragging',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.dragging.DragCoord',
    'ephox.alloy.test.GuiSetup',
    'ephox.boulder.api.Objects',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Option',
    'ephox.perhaps.Result',
    'ephox.sugar.alien.Position',
    'ephox.sugar.api.Css'
  ],
 
  function (Chain, Guard, NamedChain, UiFinder, Clicks, GuiFactory, Memento, Behaviour, Dragging, Container, DragCoord, GuiSetup, Objects, Json, Option, Result, Position, Css) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var subject = Memento.record(
      Container.sketch({
        dom: {
          styles: {
            'width': '100px',
            height: '100px',
            border: '1px solid green'
          }
        },
        behaviours: Behaviour.derive([
          Dragging.config({
            mode: 'mouse',
            blockerClass: 'test-blocker',
            snaps: {
              getSnapPoints: function () {
                return [
                  Dragging.snap({
                    sensor: DragCoord.fixed(300, 10),
                    range: Position(1000, 30),
                    output: DragCoord.fixed(Option.none(), Option.some(10))
                  })
                ];
              },
              leftAttr: 'data-snap-left',
              topAttr: 'data-snap-top'
            }
          })
        ])
      })
    );

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Container.sketch({
          components: [
            subject.asSpec()
          ]
        })
      );
    }, function (doc, body, gui, component, store) {

      var cSubject = Chain.mapper(function () {
        return subject.get(component).element();
      });

      // FIX: Add mousedown to agar API.
      var cMousedown = Chain.op(Clicks.mousedown);

      var cMouseup = Chain.op(Clicks.mouseup);

      var cMousemoveTo = function (x, y) {
        return Chain.op(function (elem) {
          Clicks.mousemove(elem, x, y);
        });
      };

      var cEnsurePositionChanged = Chain.control(
        Chain.binder(function (all) {
          return all.box_position1.left !== all.box_position2.left &&
            all.box_position2.left !== all.box_position3.left ? Result.value({}) : 
            Result.error('Positions did not change.\nPosition data: ' + Json.stringify({
              1: all.box_position1,
              2: all.box_position2,
              3: all.box_position3
            }, null, 2));
        }),
        Guard.addLogging('Ensuring that the position information read from the different stages was different')
      );
      var cEnsurePinned = Chain.control(
        Chain.binder(function (all) {
          var pinned = all.box_position4.top !== all.box_position5_pinned.top &&
            all.box_position5_pinned.top === all.box_position6_pinned.top && 
            all.box_position5_pinned.top === '10px';
          return pinned ? Result.value({ }) : Result.error(
            'Box should only have been pinned at 2 and 3 at top: 10px. Positions: ' + Json.stringify({
              1: all.box_position4,
              2: all.box_position5_pinned,
              3: all.box_position6_pinned
            }, null, 2)
          );
        }),
        Guard.addLogging('Checking pinning behaviour to top of screen')
      );

      var cRecordPosition = Chain.fromChains([
        Chain.control(
          Chain.binder(function (box) {
            return Css.getRaw(box, 'left').bind(function (left) {
              return Css.getRaw(box, 'top').map(function (top) {
                console.log('recording', left, top);
                return Result.value({
                  left: left,
                  top: top
                });
              });
            }).getOrThunk(function () {
              return Result.error('No left,top information yet');
            });
          }),
          Guard.tryUntil('Waiting for position data to record', 100, 1000)
        )
      ]);

      return [
        Chain.asStep({}, [
          NamedChain.asChain([
            NamedChain.write('box', cSubject),
            NamedChain.direct('box', cMousedown, '_'),
            NamedChain.writeValue('container', gui.element()),
            NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

            NamedChain.direct('blocker', cMousemoveTo(100, 200), '_'),
            NamedChain.direct('blocker', cMousemoveTo(120, 200), '_'),
            NamedChain.direct('box', cRecordPosition, 'box_position1'),

            NamedChain.direct('blocker', cMousemoveTo(140, 200), '_'),
            NamedChain.direct('box', cRecordPosition, 'box_position2'),
            NamedChain.direct('blocker', cMousemoveTo(160, 200), '_'),
            NamedChain.direct('box', cRecordPosition, 'box_position3'),
            NamedChain.write('_', cEnsurePositionChanged),

            NamedChain.direct('blocker', cMouseup, '_'),
            NamedChain.direct('container', Chain.control(
              UiFinder.cFindIn('.test-blocker'),
              Guard.tryUntilNot('There should no longer be a blocker', 100, 100)
            ), 'blocker'),

            // When testing pinning, we need every browser to behave identically, so we reset positions
            // so we know what we are dealing with            
            NamedChain.direct('box', Chain.op(function (elem) {
              Css.setAll(elem, {
                'left': '50px',
                top: '100px'
              });
            }), '_'),

            NamedChain.direct('box', cMousedown, '_'),
            NamedChain.direct('container', UiFinder.cFindIn('.test-blocker'), 'blocker'),

            // Test pinning.
            NamedChain.direct('blocker', cMousemoveTo(50, 100), '_'),
            NamedChain.direct('blocker', cMousemoveTo(50, 100), '_'),
            NamedChain.direct('blocker', cMousemoveTo(50, 60), '_'),
            NamedChain.direct('box', cRecordPosition, 'box_position4'),
            NamedChain.direct('blocker', cMousemoveTo(50, 30), '_'),
            NamedChain.direct('box', cRecordPosition, 'box_position5_pinned'),
            NamedChain.direct('blocker', cMousemoveTo(160, 20), '_'),
            NamedChain.direct('box', cRecordPosition, 'box_position6_pinned'),
            NamedChain.write('_', cEnsurePinned),

            Chain.wait(10),
            NamedChain.bundle(function (output) {
              return Result.value(output);
            })
          ])
        ])
      ];
    }, function () { success(); }, failure);

  }
);