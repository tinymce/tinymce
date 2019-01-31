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

UnitTest.asynctest('Browser Test: ui.slider.TwoDSliderTest', (success, failure) => {

  // Tests requiring 'flex' do not currently work on phantom. Use the remote  to see how it is
  // viewed as an invalid value.
  if (PhantomSkipper.skip()) { return success(); }
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ 'twod-slider-test' ],
          styles: {
            'height': '200px',
            'width': '200px',
            'display': 'flex',
            'flex-wrap': 'wrap'
          }
        },
        model: {
          mode: 'xy',
          minX: 50,
          maxX: 200,
          getInitialValue: Fun.constant({x: Fun.constant(200), y: Fun.constant(200)}),
          minY: 50,
          maxY: 200
        },
        stepSize: 10,
        snapToGrid: true,

        components: [
          Slider.parts()['top-left-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-top-left-edge' ], styles: {
            width: '25px',
            height: '25px',
            background: 'black'
          } } }),
          Slider.parts()['top-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-top-edge' ], styles: {
            width: '150px',
            height: '25px',
            background: 'white'
          } } }),
          Slider.parts()['top-right-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-top-right-edge' ], styles: {
            width: '25px',
            height: '25px',
            background: 'black'
          } } }),
          Slider.parts()['left-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-left-edge' ], styles: {
            width: '25px',
            height: '150px',
            background: 'white'
          } } }),
          Slider.parts().spectrum({ dom: { tag: 'div', classes: [ 'twod-slider-test-spectrum' ], styles: {
            width: '150px',
            height: '150px',
            background: 'green'
          } } }),
          Slider.parts()['right-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-right-edge' ], styles: {
            width: '25px',
            height: '150px',
            background: 'white'
          } } }),
          Slider.parts()['bottom-left-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-bottom-left-edge' ], styles: {
            width: '25px',
            height: '25px',
            background: 'black'
          } } }),
          Slider.parts()['bottom-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-bottom-edge' ], styles: {
            width: '150px',
            height: '25px',
            background: 'white'
          } } }),
          Slider.parts()['bottom-right-edge']({ dom: { tag: 'div', classes: [ 'twod-slider-test-bottom-right-edge' ], styles: {
            width: '25px',
            height: '25px',
            background: 'black'
          } } }),
          Slider.parts().thumb({ dom: { tag: 'div', classes: [ 'twod-slider-test-thumb' ], styles: {
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
      NamedChain.direct('slider', UiFinder.cFindIn('.twod-slider-test-thumb'), 'thumb'),
      NamedChain.direct('slider', UiFinder.cFindIn('.twod-slider-test-top-edge'), 'tedge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.twod-slider-test-left-edge'), 'ledge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.twod-slider-test-right-edge'), 'redge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.twod-slider-test-bottom-edge'), 'bedge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.twod-slider-test-spectrum'), 'spectrum'),

      NamedChain.direct('thumb', cGetComponent, 'thumbComp'),
      NamedChain.direct('ledge', cGetComponent, 'ledgeComp'),
      NamedChain.direct('redge', cGetComponent, 'redgeComp'),
      NamedChain.direct('slider', cGetComponent, 'sliderComp'),
      NamedChain.direct('spectrum', cGetComponent, 'spectrumComp'),

      NamedChain.direct('thumb', cGetBounds, 'thumbRect'),
      NamedChain.direct('ledge', cGetBounds, 'ledgeRect'),
      NamedChain.direct('redge', cGetBounds, 'redgeRect'),
      NamedChain.direct('tedge', cGetBounds, 'tedgeRect'),
      NamedChain.direct('bedge', cGetBounds, 'bedgeRect'),
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

    const cCheckThumbAtTop = Chain.op((parts: any) => {
      RawAssertions.assertEq(
        'Thumb (' + parts.thumbRect.top + '->' + parts.thumbRect.bottom +
          '), Top-Edge: (' + parts.tedgeRect.top + '->' + parts.tedgeRect.bottom + ')',
        true,
        parts.tedgeRect.bottom > parts.thumbRect.top && parts.tedgeRect.top < parts.thumbRect.top
      );
    });

    const cCheckThumbAtBottom = Chain.op((parts: any) => {
      RawAssertions.assertEq(
        'Thumb (' + parts.thumbRect.top + '->' + parts.thumbRect.bottom +
          '), Bottom-Edge: (' + parts.bedgeRect.top + '->' + parts.bedgeRect.bottom + ')',
        true,
        parts.bedgeRect.top < parts.thumbRect.bottom && parts.tedgeRect.top < parts.bedgeRect.top
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

    const cCheckThumbPastBottom = Chain.op((parts: any) => {
      RawAssertions.assertEq('Checking thumb past end of spectrum', true,
        parts.thumbRect.top > parts.spectrumRect.bottom
      );
    });

    const cCheckThumbBeforeTop = Chain.op((parts: any) => {
      RawAssertions.assertEq('Checking thumb before start of spectrum', true,
        parts.thumbRect.bottom < parts.spectrumRect.top
      );
    });

    const cCheckValue = (expected) => {
      return Chain.op((parts: any) => {
        const v = Representing.getValue(parts.sliderComp);
        RawAssertions.assertEq('Checking slider value', expected.x, v.x());
        RawAssertions.assertEq('Checking slider value', expected.y, v.y());
      });
    };

    const sAssertValue = (label, expected) => {
      return Logger.t(label, Step.sync(() => {
        const v = Representing.getValue(component);
        RawAssertions.assertEq(label, expected.x, v.x());
        RawAssertions.assertEq(label, expected.y, v.y());
      }));
    };

    return [

      Logger.t(
        'Initial-Value: Checking that the thumb now overlaps the right and bottom edges at max',
        Waiter.sTryUntil(
          'Initial load can take a while',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbAtRight,
            cCheckThumbAtBottom,
            cCheckValue({x: 200, y: 200})
          ]),
          100,
          1000
        )
      ),

      // Step.wait(10000000),

      Step.sync(() => {
        Slider.resetToMin(component);
      }),

      Logger.t(
        'Checking that the thumb now overlaps the top and left edges at min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbAtLeft,
          cCheckThumbAtTop,
          cCheckValue({x: 50, y: 50})
        ])
      ),

      Step.sync(() => {
        Slider.resetToMax(component);
      }),

      Logger.t(
        'Checking that the thumb now overlaps the right and bottom edges at max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbAtRight,
          cCheckThumbAtBottom,
          cCheckValue({x: 200, y: 200})
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

      FocusTools.sTryOnSelector('Focus should be on spectrum', doc, '.twod-slider-test-spectrum'),
      Keyboard.sKeydown(doc, Keys.right(), {}),

      Logger.t(
        'Checking that the thumb is past the right max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbPastRight,
          cCheckThumbAtBottom,
          cCheckValue({x: 201, y: 200})
        ])
      ),
      Keyboard.sKeydown(doc, Keys.right(), { }),
      Logger.t(
        'Pressed right at right edge. Checking that the thumb is still past the right max and value has not changed',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbPastRight,
          cCheckThumbAtBottom,
          cCheckValue({x: 201, y: 200})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.down(), { }),
      Logger.t(
        'Pressed down at right edge. Checking that the thumb is past the right and bottom max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbPastRight,
          cCheckThumbPastBottom,
          cCheckValue({x: 201, y: 201})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.down(), { }),
      Logger.t(
        'Pressed down at right edge. Checking that the thumb is still past the right and bottom max and value has not changed',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbPastRight,
          cCheckThumbPastBottom,
          cCheckValue({x: 201, y: 201})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.left(), {}),
      Logger.t(
        'Pressed left at the right edge. Thumb should be at max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbAtRight,
          cCheckThumbPastBottom,
          cCheckValue({x: 200, y: 201})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.left(), {}),
      sAssertValue('200 -> 190 (step size)', {x: 190, y: 201}),

      Keyboard.sKeydown(doc, Keys.left(), {}),
      sAssertValue('200 -> 180 (step size)', {x: 180, y: 201}),

      Step.sync(() => {
        Slider.resetToMin(component);
      }),

      sAssertValue('min: 50', {x: 50, y: 50}),

      Keyboard.sKeydown(doc, Keys.left(), {}),
      Logger.t(
        'Checking that the thumb is before the left min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbBeforeLeft,
          cCheckThumbAtTop,
          cCheckValue({x: 49, y: 50})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.left(), { }),
      Logger.t(
        'Checking that the thumb is *still* before the left min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbBeforeLeft,
          cCheckThumbAtTop,
          cCheckValue({x: 49, y: 50})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.up(), { }),
      Logger.t(
        'Checking that the thumb is *still* before the left min and now before the top min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbBeforeLeft,
          cCheckThumbBeforeTop,
          cCheckValue({x: 49, y: 49})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      Logger.t(
        'Checking that the thumb is at the left edge',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbBeforeLeft,
          cCheckThumbAtTop,
          cCheckValue({x: 49, y: 50})
        ])
      ),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      sAssertValue('Checking that the thumb is now one step further right', {x: 49, y: 60}),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      sAssertValue('Checking that the thumb is now one step further right', {x: 49, y: 70})
    ];
  }, () => { success(); }, (err, logs) => {
    failure(err, logs);
  });
});
