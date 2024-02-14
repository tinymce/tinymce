import { Optional, Thunk } from '@ephox/katamari';

import * as SchemaElementSets from './SchemaElementSets';
import * as SchemaTypes from './SchemaTypes';

export type PresetName = 'blocks' | 'phrasing' | 'flow';

const cachedSets = {
  'html4': Thunk.cached(() => SchemaElementSets.getElementSets('html4')),
  'html5': Thunk.cached(() => SchemaElementSets.getElementSets('html5')),
  'html5-strict': Thunk.cached(() => SchemaElementSets.getElementSets('html5-strict'))
};

export const getElementsPreset = (type: SchemaTypes.SchemaType, name: PresetName | string): Optional<readonly string[]> => {
  const { blockContent, phrasingContent, flowContent } = cachedSets[type]();

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

