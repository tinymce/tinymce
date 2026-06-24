import * as React from 'react';

import { GlobalTooltipContext } from '../../components/tooltip/internals/Context';

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
  const [ currentTooltipId, setCurrentTooltipId ] = React.useState<string | null>(null);

  return (
    <UniverseContext.Provider value={resources}>
      <GlobalTooltipContext.Provider value={{ currentTooltipId, setCurrentTooltipId }}>
        {children}
      </GlobalTooltipContext.Provider>
    </UniverseContext.Provider>
  );
};
