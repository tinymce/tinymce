import { AlloyTriggers, Behaviour, Focusing, GuiFactory, SimpleSpec, Slider } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun, Optional } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { formChangeEvent } from '../general/FormEvents';

type SliderSpec = Omit<Dialog.Slider, 'type'>;

export const renderSlider = (spec: SliderSpec, providerBackstage: UiFactoryBackstageProviders, initialData: Optional<number>): SimpleSpec => {
  const labelPart = Slider.parts.label({
    dom: {
      tag: 'label',
      classes: [ 'tox-label' ]
    },
    components: [
      GuiFactory.text(providerBackstage.translate(spec.label))
    ]
  });

  const spectrum = Slider.parts.spectrum({
    dom: {
      tag: 'div',
      classes: [ 'tox-slider__rail' ],
      attributes: {
        role: 'presentation'
      }
    }
  });

  const thumb = Slider.parts.thumb({
    dom: {
      tag: 'div',
      classes: [ 'tox-slider__handle' ],
      attributes: {
        role: 'presentation'
      }
    }
  });

  return Slider.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-slider' ],
      attributes: {
        role: 'presentation'
      }
    },
    model: {
      mode: 'x',
      minX: spec.min,
      maxX: spec.max,
      getInitialValue: Fun.constant(initialData.getOrThunk(() => (Math.abs(spec.max) - Math.abs(spec.min)) / 2))
    },
    components: [
      labelPart,
      spectrum,
      thumb
    ],
    sliderBehaviours: Behaviour.derive([
      ComposingConfigs.self(),
      Focusing.config({})
    ]),
    onChoose: (component, thumb, value) => {
      AlloyTriggers.emitWith(component, formChangeEvent, { name: spec.name, value } );
    }
  });
};
