import { populateGetter, populateGetterDeclarations } from '../templates/IconGetter.js';
import { populateIconProvider } from '../templates/IconProvider.js';
import { populateIconsHtml } from '../templates/IconsHtml.js';

import type { Svg } from './Core.js';

export interface Template {
  path: string;
  contents: string;
}

export const populateTemplates = (svgs: Svg[], name: string): Template[] => [
  {
    path: 'dist/icons/default/icons.js',
    contents: populateGetter(svgs)
  },
  {
    path: 'dist/icons/default/icons.d.ts',
    contents: populateGetterDeclarations(svgs)
  },
  {
    path: 'dist/html/icons.html',
    contents: populateIconsHtml(svgs)
  },
  {
    path: `dist/icons/${name}/icons.tinymce.js`,
    contents: populateIconProvider(svgs, name)
  }
];