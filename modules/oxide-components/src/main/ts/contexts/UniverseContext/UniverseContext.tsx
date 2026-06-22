import { createContext } from 'react';

import type { Universe } from './UniverseTypes';

export const UniverseContext = createContext<Universe | null>(null);
