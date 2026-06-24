import { createContext } from 'react';

import type { UniverseResources } from './UniverseTypes';

export const UniverseContext = createContext<UniverseResources | null>(null);
