asynctest(
  'Browser Test: ui.slider.SliderTest',

  [
    'ephox.agar.api.Chain',
    'ephox.agar.api.FocusTools',
    'ephox.agar.api.Keyboard',
    'ephox.agar.api.Keys',
    'ephox.agar.api.Logger',
    'ephox.agar.api.NamedChain',
    'ephox.agar.api.RawAssertions',
    'ephox.agar.api.Step',
    'ephox.agar.api.UiFinder',
    'ephox.agar.api.Waiter',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.GuiFactory',
    'ephox.alloy.api.ui.Slider',
    'ephox.alloy.test.GuiSetup',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Result',
    'global!navigator'
  ],

  function (
    Chain, FocusTools, Keyboard, Keys, Logger, NamedChain, RawAssertions, Step, UiFinder, Waiter, Keying, Representing, GuiFactory, Slider, GuiSetup, Fun, Result,
    navigator
  ) {
    var success = arguments[arguments.length - 2];
    var failure = arguments[arguments.length - 1];

    // Tests requiring 'flex' do not currently work on phantom. Use the remote  to see how it is
    // viewed as an invalid value.
    if (navigator.userAgent.indexOf('PhantomJS') > -1) return success();

    GuiSetup.setup(function (store, doc, body) {
      return GuiFactory.build(
        Slider.sketch({
          dom: {
            tag: 'div',
            classes: [ 'slider-test' ]
          },

          min: 50,
          getInitialValue: Fun.constant(200),
          max: 200,
          stepSize: 10,
          snapToGrid: true,

          parts: {
            'left-edge': { dom: { tag: 'div', classes: [ 'slider-test-left-edge' ] } },
            'right-edge': { dom: { tag: 'div', classes: [ 'slider-test-right-edge' ] } },
            thumb: { dom: { tag: 'div', classes: [ 'slider-test-thumb' ] } },
            spectrum: { dom: { tag: 'div', classes: [ 'slider-test-spectrum' ] } }
          },

          components: [
            Slider.parts()['left-edge'](),
            Slider.parts().spectrum(),
            Slider.parts()['right-edge'](),
            Slider.parts().thumb()
          ]
        })
      );
    }, function (doc, body, gui, component, store) {

      var cGetBounds = Chain.mapper(function (elem) {
        return elem.dom().getBoundingClientRect();
      });

      var cGetComponent = Chain.binder(function (elem) {
        return component.getSystem().getByDom(elem);
      });

      var cGetParts = NamedChain.asChain([
        NamedChain.writeValue('slider', component.element()),
        NamedChain.direct('slider', UiFinder.cFindIn('.slider-test-thumb'), 'thumb'),
        NamedChain.direct('slider', UiFinder.cFindIn('.slider-test-left-edge'), 'ledge'),
        NamedChain.direct('slider', UiFinder.cFindIn('.slider-test-right-edge'), 'redge'),
        NamedChain.direct('slider', UiFinder.cFindIn('.slider-test-spectrum'), 'spectrum'),

        NamedChain.direct('thumb', cGetComponent, 'thumbComp'),
        NamedChain.direct('ledge', cGetComponent, 'ledgeComp'),
        NamedChain.direct('redge', cGetComponent, 'redgeComp'),
        NamedChain.direct('slider', cGetComponent, 'sliderComp'),
        NamedChain.direct('spectrum', cGetComponent, 'spectrumComp'),

        NamedChain.direct('thumb', cGetBounds, 'thumbRect'),
        NamedChain.direct('ledge', cGetBounds, 'ledgeRect'),
        NamedChain.direct('redge', cGetBounds, 'redgeRect'),
        NamedChain.direct('slider', cGetBounds, 'sliderRect'),
        NamedChain.direct('spectrum', cGetBounds, 'spectrumRect'),
        NamedChain.bundle(Result.value)
      ]);

      var cCheckThumbAtLeft = Chain.op(function (parts) {
        RawAssertions.assertEq(
          'Thumb (' + parts.thumbRect.left + '->' + parts.thumbRect.right +
            '), Left-Edge: (' + parts.ledgeRect.left + '->' + parts.ledgeRect.right + ')',
          true,
          parts.ledgeRect.right > parts.thumbRect.left && parts.ledgeRect.left < parts.thumbRect.left
        );
      });

      var cCheckThumbAtRight = Chain.op(function (parts) {
        RawAssertions.assertEq(
          'Thumb (' + parts.thumbRect.left + '->' + parts.thumbRect.right +
            '), Right-Edge: (' + parts.redgeRect.left + '->' + parts.redgeRect.right + ')',
          true,
          parts.redgeRect.left < parts.thumbRect.right && parts.ledgeRect.left < parts.redgeRect.left
        );
      });

      var cCheckThumbPastRight = Chain.op(function (parts) {
        RawAssertions.assertEq('Checking thumb past end of spectrum', true,
          parts.thumbRect.left > parts.spectrumRect.right
        );
      });

      var cCheckThumbBeforeLeft = Chain.op(function (parts) {
        RawAssertions.assertEq('Checking thumb before start of spectrum', true,
          parts.thumbRect.right < parts.spectrumRect.left
        );
      });

      var cCheckValue = function (expected) {
        return Chain.op(function (parts) {
          var v = Representing.getValue(parts.sliderComp);
          RawAssertions.assertEq('Checking slider value', expected, v);
        });
      };

      var sAssertValue = function (label, expected) {
        return Logger.t(label, Step.sync(function () {
          RawAssertions.assertEq(label, expected, Representing.getValue(component));
        }));
      };

      return [
        GuiSetup.mAddStyles(doc, [
          '.slider-test { border: 1px solid blue; height: 20px; display: flex; }',
          '.slider-test-left-edge { width: 40px; height: 20px; background: black }',
          '.slider-test-right-edge { width: 40px; height: 20px; background: white }',
          '.slider-test-spectrum { background: green; width: 150px; }',
          '.slider-test-thumb { width: 20px; height: 20px; background: gray; }'
        ]),

        Logger.t(
          'Initial-Value: Checking that the thumb now overlaps the right edge at max',
          Waiter.sTryUntil(
            'Initial load can take a while',
            Chain.asStep({}, [
              cGetParts,
              cCheckThumbAtRight,
              cCheckValue(200)
            ]),
            100,
            1000
          )
        ),

        Step.sync(function () {
          Slider.resetToMin(component);
        }),

        Logger.t(
          'Checking that the thumb now overlaps the left edge at min',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbAtLeft,
            cCheckValue(50)
          ])
        ),

        Step.sync(function () {
          Slider.resetToMax(component);
        }),

        Logger.t(
          'Checking that the thumb now overlaps the right edge at max',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbAtRight,
            cCheckValue(200)
          ])
        ),

        Logger.t(
          'Focus the gradient',
          Chain.asStep({}, [
            cGetParts,
            Chain.op(function (parts) {
              Keying.focusIn(parts.sliderComp);
            })
          ])
        ),

        FocusTools.sTryOnSelector('Focus should be on spectrum', doc, '.slider-test-spectrum'),
        Keyboard.sKeydown(doc, Keys.right(), {}),

        Logger.t(
          'Checking that the thumb is past the max',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbPastRight,
            cCheckValue(201)
          ])
        ),
        Keyboard.sKeydown(doc, Keys.right(), { }),
        Logger.t(
          'Pressed right at right edge. Checking that the thumb is still past the max and value has not changed',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbPastRight,
            cCheckValue(201)
          ])
        ),

        Keyboard.sKeydown(doc, Keys.left(), {}),
        Logger.t(
          'Pressed left at the right edge. Thumb should be at max',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbAtRight,
            cCheckValue(200)
          ])
        ),

        Keyboard.sKeydown(doc, Keys.left(), {}),
        sAssertValue('200 -> 190 (step size)', 190),

        Keyboard.sKeydown(doc, Keys.left(), {}),
        sAssertValue('200 -> 180 (step size)', 180),

        Step.sync(function () {
          Slider.resetToMin(component);
        }),

        sAssertValue('min: 50', 50),

        Keyboard.sKeydown(doc, Keys.left(), {}),
        Logger.t(
          'Checking that the thumb is before the min',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbBeforeLeft,
            cCheckValue(49)
          ])
        ),

        Keyboard.sKeydown(doc, Keys.left(), { }),
        Logger.t(
          'Checking that the thumb is *still* before the min',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbBeforeLeft,
            cCheckValue(49)
          ])
        ),

        Keyboard.sKeydown(doc, Keys.right(), {}),
        Logger.t(
          'Checking that the thumb is at the left edge',
          Chain.asStep({}, [
            cGetParts, cCheckThumbAtLeft, cCheckValue(50)
          ])
        ),

        Keyboard.sKeydown(doc, Keys.right(), {}),
        sAssertValue('Checking that the thumb is now one step further right', 60),

        Keyboard.sKeydown(doc, Keys.right(), {}),
        sAssertValue('Checking that the thumb is now one step further right', 70)
      ];
    }, function () { success(); }, failure);
  }
);