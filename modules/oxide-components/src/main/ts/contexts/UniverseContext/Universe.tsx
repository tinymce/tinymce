import { Type } from '@ephox/katamari';
import { useContext } from 'react';

import { UniverseContext } from './UniverseContext';
import type { UniverseResources } from './UniverseTypes';

export const useUniverse = (): UniverseResources => {
  const context = useContext(UniverseContext);
  if (Type.isNullable(context)) {
    throw new Error('useUniverse must be used within a UniverseProvider');
  }
  return context;
};
