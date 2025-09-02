import Settings, { type PluginOptions } from '../Configuration.js';
import type { Svg } from '../core/Core.js';
import type { Template } from '../core/CreateFiles.js';
import { validateModuleStructure } from '../core/ModuleValidator.js';

import { iconPackager } from './IconPackager.js';

export type { PluginOptions, Svg, Template };
export {
  iconPackager,
  Settings,
  validateModuleStructure
};