import type { Svg } from '../core/Core.js';

export const populateGetter = (svgs: Svg[]): string => {
  const icons = svgs.map(svg => `  '${svg.name}': '${svg.data}'`).join(',\n');
  return `export const getAll = () => ({
${icons}
});`;
};

export const populateGetterDeclarations = (_svgs: Svg[]): string => {
  return 'export declare function getAll(): Record<string, string>;';
};