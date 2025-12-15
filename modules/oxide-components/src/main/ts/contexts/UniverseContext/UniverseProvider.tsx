import React from 'react';

import { UniverseContext } from './UniverseContext';
import type { UniverseResources } from './UniverseTypes';

interface UniverseContextProvider {
  readonly resources: UniverseResources;
  readonly children: React.ReactNode;
}

export const UniverseProvider = ({
  resources,
  children
}: UniverseContextProvider): React.ReactElement => {
  return (
    <UniverseContext.Provider value={resources}>
      {children}
    </UniverseContext.Provider>
  );
};
