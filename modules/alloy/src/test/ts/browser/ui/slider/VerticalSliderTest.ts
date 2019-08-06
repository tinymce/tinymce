import { Chain, FocusTools, Keyboard, Keys, Logger, NamedChain, RawAssertions, Step, UiFinder, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Fun, Result } from '@ephox/katamari';
import { Element } from '@ephox/sugar';

import { Keying } from 'ephox/alloy/api/behaviour/Keying';
import { Representing } from 'ephox/alloy/api/behaviour/Representing';
import * as GuiFactory from 'ephox/alloy/api/component/GuiFactory';
import { Slider } from 'ephox/alloy/api/ui/Slider';
import * as GuiSetup from 'ephox/alloy/api/testhelpers/GuiSetup';
import * as PhantomSkipper from 'ephox/alloy/test/PhantomSkipper';

UnitTest.asynctest('Browser Test: ui.slider.VerticalSliderTest', (success, failure) => {

  // Tests requiring 'flex' do not currently work on phantom. Use the remote  to see how it is
  // viewed as an invalid value.
  if (PhantomSkipper.skip()) { return success(); }
  GuiSetup.setup((store, doc, body) => {
    return GuiFactory.build(
      Slider.sketch({
        dom: {
          tag: 'div',
          classes: [ 'vertical-slider-test' ],
          styles: {
            'border': '1px solid black',
            'width': '20px',
            'display': 'flex',
            'flex-direction': 'column'
          }
        },
        model: {
          mode: 'y',
          minY: 50,
          getInitialValue: Fun.constant({y: Fun.constant(200)}),
          maxY: 200
        },
        stepSize: 10,
        snapToGrid: true,

        components: [
          Slider.parts()['top-edge']({ dom: { tag: 'div', classes: [ 'vertical-slider-test-top-edge' ], styles: {
            height: '40px',
            width: '20px',
            background: 'black'
          } } }),
          Slider.parts().spectrum({ dom: { tag: 'div', classes: [ 'vertical-slider-test-spectrum' ], styles: {
            height: '150px',
            background: 'green'
          } } }),
          Slider.parts()['bottom-edge']({ dom: { tag: 'div', classes: [ 'vertical-slider-test-bottom-edge' ], styles: {
            height: '40px',
            width: '20px',
            background: 'white'
          } } }),
          Slider.parts().thumb({ dom: { tag: 'div', classes: [ 'vertical-slider-test-thumb' ], styles: {
            height: '20px',
            width: '20px',
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
      NamedChain.direct('slider', UiFinder.cFindIn('.vertical-slider-test-thumb'), 'thumb'),
      NamedChain.direct('slider', UiFinder.cFindIn('.vertical-slider-test-top-edge'), 'tedge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.vertical-slider-test-bottom-edge'), 'bedge'),
      NamedChain.direct('slider', UiFinder.cFindIn('.vertical-slider-test-spectrum'), 'spectrum'),

      NamedChain.direct('thumb', cGetComponent, 'thumbComp'),
      NamedChain.direct('tedge', cGetComponent, 'tedgeComp'),
      NamedChain.direct('bedge', cGetComponent, 'bedgeComp'),
      NamedChain.direct('slider', cGetComponent, 'sliderComp'),
      NamedChain.direct('spectrum', cGetComponent, 'spectrumComp'),

      NamedChain.direct('thumb', cGetBounds, 'thumbRect'),
      NamedChain.direct('tedge', cGetBounds, 'tedgeRect'),
      NamedChain.direct('bedge', cGetBounds, 'bedgeRect'),
      NamedChain.direct('slider', cGetBounds, 'sliderRect'),
      NamedChain.direct('spectrum', cGetBounds, 'spectrumRect'),
      NamedChain.bundle(Result.value)
    ]);

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
        RawAssertions.assertEq('Checking slider value', expected, v.y());
      });
    };

    const sAssertValue = (label, expected) => {
      return Logger.t(label, Step.sync(() => {
        RawAssertions.assertEq(label, expected, Representing.getValue(component).y());
      }));
    };

    return [
      Logger.t(
        'Initial-Value: Checking that the thumb now overlaps the bottom edge at max',
        Waiter.sTryUntil(
          'Initial load can take a while',
          Chain.asStep({}, [
            cGetParts,
            cCheckThumbAtBottom,
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
        'Checking that the thumb now overlaps the top edge at min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbAtTop,
          cCheckValue(50)
        ])
      ),

      Step.sync(() => {
        Slider.resetToMax(component);
      }),

      Logger.t(
        'Checking that the thumb now overlaps the bottom edge at max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbAtBottom,
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

      FocusTools.sTryOnSelector('Focus should be on spectrum', doc, '.vertical-slider-test-spectrum'),
      Keyboard.sKeydown(doc, Keys.down(), {}),

      Logger.t(
        'Checking that the thumb is past the max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbPastBottom,
          cCheckValue(201)
        ])
      ),
      Keyboard.sKeydown(doc, Keys.down(), { }),
      Logger.t(
        'Pressed bottom at bottom edge. Checking that the thumb is still past the max and value has not changed',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbPastBottom,
          cCheckValue(201)
        ])
      ),

      Keyboard.sKeydown(doc, Keys.up(), {}),
      Logger.t(
        'Pressed top at the bottom edge. Thumb should be at max',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbAtBottom,
          cCheckValue(200)
        ])
      ),

      Keyboard.sKeydown(doc, Keys.up(), {}),
      sAssertValue('200 -> 190 (step size)', 190),

      Keyboard.sKeydown(doc, Keys.up(), {}),
      sAssertValue('200 -> 180 (step size)', 180),

      Step.sync(() => {
        Slider.resetToMin(component);
      }),

      sAssertValue('min: 50', 50),

      Keyboard.sKeydown(doc, Keys.up(), {}),
      Logger.t(
        'Checking that the thumb is before the min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbBeforeTop,
          cCheckValue(49)
        ])
      ),

      Keyboard.sKeydown(doc, Keys.up(), { }),
      Logger.t(
        'Checking that the thumb is *still* before the min',
        Chain.asStep({}, [
          cGetParts,
          cCheckThumbBeforeTop,
          cCheckValue(49)
        ])
      ),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      Logger.t(
        'Checking that the thumb is at the top edge',
        Chain.asStep({}, [
          cGetParts, cCheckThumbAtTop, cCheckValue(50)
        ])
      ),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      sAssertValue('Checking that the thumb is now one step further bottom', 60),

      Keyboard.sKeydown(doc, Keys.down(), {}),
      sAssertValue('Checking that the thumb is now one step further bottom', 70)
    ];
  }, () => { success(); }, failure);
});
