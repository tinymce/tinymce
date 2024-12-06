import {
  SketchSpec
} from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as SizeInput from '../sizeinput/SizeInput';

type SizeInputSpec = Omit<Dialog.SizeInput, 'type'>;

export const renderSizeInput = (spec: SizeInputSpec, providersBackstage: UiFactoryBackstageProviders): SketchSpec => {
  return SizeInput.renderSizeInput({
    label: spec.label,
    enabled: spec.enabled,
    context: spec.context,
    name: spec.name
  }, providersBackstage);
};
