import * as React from 'react';

import { UniverseContext } from './UniverseContext';
import type { Universe, UniverseResources } from './UniverseTypes';

interface UniverseContextProvider {
  readonly resources: UniverseResources;
  readonly children: React.ReactNode;
}

export const UniverseProvider = ({
  resources,
  children
}: UniverseContextProvider): React.ReactElement => {
  const [ currentTooltipId, setCurrentTooltipId ] = React.useState<string | null>(null);
  const value = React.useMemo<Universe>(
    () => ({ ...resources, currentTooltipId, setCurrentTooltipId }),
    [ resources, currentTooltipId ]
  );
  return (
    <UniverseContext.Provider value={value}>
      {children}
    </UniverseContext.Provider>
  );
};
