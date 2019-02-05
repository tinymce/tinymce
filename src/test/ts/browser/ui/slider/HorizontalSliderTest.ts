import { Chain, FocusTools, Keyboard, Keys, Logger, NamedChain, RawAssertions, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Fun, Result } from '@ephox/katamari';
import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Slider } from 'ephox/alloy/api/ui/Slider';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';
import { Element } from '@ephox/sugar';

UnitTest.asynctest('Browser Test: ui.slider.HorizontalSliderTest', (success, failure) => {

  // Tests requiring 'flex' do not currently work on phantom. Use the remote  to see how it is
  // viewed as an invalid value.
  if (PhantomSkipper.skip()) { return success(); }
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ 'horizontal-slider-test' ],
          styles: {
            border: '1px solid black',
            height: '20px',
            display: 'flex'
          }
        },
        model: {
          mode: 'x',
          minX: 50,
          getInitialValue: Fun.constant({x: Fun.constant(200)}),
          maxX: 200
        },
        stepSize: 10,
        snapToGrid: true,

        components: [
          Slider.parts()['left-edge']({ dom: { tag: 'div', classes: [ 'horizontal-slider-test-left-edge' ], styles: {
            width: '40px',
            height: '20px',
            background: 'black'
          } } }),
          Slider.parts().spectrum({ dom: { tag: 'div', classes: [ 'horizontal-slider-test-spectrum' ], styles: {
            height: '150px',
            background: 'green'
          } } }),
          Slider.parts()['right-edge']({ dom: { tag: 'div', classes: [ 'horizontal-slider-test-right-edge' ], styles: {
            width: '40px',
            height: '20px',
            background: 'white'
          } } }),
          Slider.parts().thumb({ dom: { tag: 'div', classes: [ 'horizontal-slider-test-thumb' ], styles: {
            width: '20px',
            height: '20px',
            background: 'gray'
          } } })
        ]
      })
    );
  }, (doc, body, gui, component, store) => {

    const cGetBounds = Chain.mapper((elem: Element) => {
      return elem.dom().getBoundingClientRect();
    });

    const cGetComponent = Chain.binder((elem: Element) => {
      return component.getSystem().getByDom(elem);
    });

    const cGetParts = NamedChain.asChain([
      NamedChain.writeValue('slider', component.element()),
      NamedChain.direct('slider', UiFinder.cFindIn('.horizontal-slider-test-thumb'), 'thumb'),
      NamedChain.direct('slider', UiFinder.cFindIn('.horizontal-slider-test-left-edge'), 'ledge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.horizontal-slider-test-right-edge'), 'redge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.horizontal-slider-test-spectrum'), 'spectrum'),

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

    const cCheckThumbAtLeft = Chain.op((parts: any) => {
      RawAssertions.assertEq(
        'Thumb (' + parts.thumbRect.left + '->' + parts.thumbRect.right +
          '), Left-Edge: (' + parts.ledgeRect.left + '->' + parts.ledgeRect.right + ')',
        true,
        parts.ledgeRect.right > parts.thumbRect.left && parts.ledgeRect.left < parts.thumbRect.left
      );
    });

    const cCheckThumbAtRight = Chain.op((parts: any) => {
      RawAssertions.assertEq(
        'Thumb (' + parts.thumbRect.left + '->' + parts.thumbRect.right +
          '), Right-Edge: (' + parts.redgeRect.left + '->' + parts.redgeRect.right + ')',
        true,
        parts.redgeRect.left < parts.thumbRect.right && parts.ledgeRect.left < parts.redgeRect.left
      );
    });

    const cCheckThumbPastRight = Chain.op((parts: any) => {
      RawAssertions.assertEq('Checking thumb past end of spectrum', true,
        parts.thumbRect.left > parts.spectrumRect.right
      );
    });

    const cCheckThumbBeforeLeft = Chain.op((parts: any) => {
      RawAssertions.assertEq('Checking thumb before start of spectrum', true,
        parts.thumbRect.right < parts.spectrumRect.left
      );
    });

    const cCheckValue = (expected) => {
      return Chain.op((parts: any) => {
        const v = Representing.getValue(parts.sliderComp);
        RawAssertions.assertEq('Checking slider value', expected, v.x());
      });
    };

    const sAssertValue = (label, expected) => {
      return Logger.t(label, Step.sync(() => {
        RawAssertions.assertEq(label, expected, Representing.getValue(component).x());
      }));
    };

    return [
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

      Step.sync(() => {
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

      Step.sync(() => {
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
          Chain.op((parts) => {
            Keying.focusIn(parts.sliderComp);
          })
        ])
      ),

      FocusTools.sTryOnSelector('Focus should be on spectrum', doc, '.horizontal-slider-test-spectrum'),
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

      Step.sync(() => {
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
  }, () => { success(); }, failure);
});
