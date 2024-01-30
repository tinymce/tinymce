import { Optional } from '@ephox/katamari';

import { getElementSets } from './SchemaElementSets';
import * as SchemaTypes from './SchemaTypes';

export type PresetName = 'blocks' | 'phrasing' | 'flow';

export const getElementsPreset = (type: SchemaTypes.SchemaType, name: PresetName | string): Optional<readonly string[]> => {
  const { blockContent, phrasingContent, flowContent } = getElementSets(type);

  if (name === 'blocks') {
    return Optional.some(blockContent);
  } else if (name === 'phrasing') {
    return Optional.some(phrasingContent);
  } else if (name === 'flow') {
    return Optional.some(flowContent);
  } else {
    return Optional.none();
  }
};

