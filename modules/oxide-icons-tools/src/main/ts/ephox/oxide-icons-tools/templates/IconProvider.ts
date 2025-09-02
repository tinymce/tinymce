import type { Svg } from '../core/Core.js';

export const populateIconProvider = (svgs: Svg[], name: string): string => {
  const icons = svgs.map((svg) => `  '${svg.name}': '${svg.data}'`).join(',\n');
  return `tinymce.IconManager.add('${name}', {\n${icons}\n});`;
};