asynctest(
  'MouseDraggingTest',
 
  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.Guard',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.mouse.Clicks',
    'ephox.alloy.api.GuiFactory',
    'ephox.alloy.api.Memento',
    'ephox.alloy.test.GuiSetup',
    'ephox.numerosity.api.JSON',
    'ephox.perhaps.Result',
    'ephox.sugar.api.Css'
  ],
 
  function (Chain, Guard, NamedChain, Step, UiFinder, Clicks, GuiFactory, Memento, GuiSetup, Json, Result, Css) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    var subject = Memento.record({
      uiType: 'container',
      dom: {
        styles: {
          'width': '100px',
          height: '100px',
          border: '1px solid green'
        }
      },
      behaviours: {
        dragging: {
          mode: 'mouse',
          blockerClass: 'test-blocker'
        }
      }
    });

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build({
        uiType: 'container',
        components: [
          subject.asSpec()
        ]
      });
    }, function (doc, body, gui, component, store) {

      var cSubject = Chain.mapper(function () {
        return subject.get(component).element();
      });

      // FIX: Add mousedown to agar API.
      var cMousedown = Chain.op(Clicks.mousedown);

      var cMousemove = function (x, y) {
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

      var cRecordPosition = Chain.fromChains([
        Chain.control(
          Chain.binder(function (box) {
            return Css.getRaw(box, 'left').bind(function (left) {
              return Css.getRaw(box, 'top').map(function (top) {
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

            NamedChain.direct('blocker', cMousemove(100, 200), '_'),

            Chain.wait(10),

            NamedChain.direct('blocker', cMousemove(120, 200), '_'),

            NamedChain.direct('box', cRecordPosition, 'box_position1'),

            Chain.wait(10),

            NamedChain.direct('blocker', cMousemove(140, 200), '_'),

            NamedChain.direct('box', cRecordPosition, 'box_position2'),

            NamedChain.direct('blocker', cMousemove(160, 200), '_'),

            NamedChain.direct('box', cRecordPosition, 'box_position3'),

            NamedChain.write('_', cEnsurePositionChanged),

            Chain.wait(10),
            NamedChain.bundle(function (output) {
              return Result.value(output);
            })
          ])
        ]),
        Step.fail(10)
      ];
    }, function () { success(); }, failure);

  }
);