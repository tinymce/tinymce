import { AlloySpec, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Fun } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { renderIconFromPack } from '../button/ButtonSlices';

type DummySpec = Omit<Dialog.Dummy, 'type'>;

export const renderDummy = (spec: DummySpec, providersBackstage: UiFactoryBackstageProviders): SimpleSpec => {

  const simpleInput: AlloySpec = {
    dom: {
      tag: 'input',
      classes: [ 'poc-dummy-input' ],
    }
  };

  const inputComponent: AlloySpec =
  spec.inputLabel.fold(Fun.constant(simpleInput), (labelText) => ({
    dom: {
      tag: 'label',
      classes: [ 'poc-dummy-input-label' ],
      innerHtml: labelText
    },
    components: [
      simpleInput
    ]
  }));

  const icon = spec.buttonIcon.map((iconName) => renderIconFromPack(iconName, providersBackstage.icons)).getOr({}) as AlloySpec;

  const buttonComponent: AlloySpec = {
    dom: {
      tag: 'button',
      classes: [ 'poc-dummy-button', `poc-dummy-button-icon-${spec.buttonIconPlacement}` ],
    },
    components: [
      {
        dom: {
          tag: 'span',
          classes: [ 'poc-dummy-button-text' ],
          innerHtml: spec.buttonText.getOr(''),
        }
      },
      icon
    ]
  };

  return {
    dom: {
      tag: 'div',
      classes: [ 'poc-dummy-container' ]
    },
    components: [
      inputComponent,
      buttonComponent
    ] };
};