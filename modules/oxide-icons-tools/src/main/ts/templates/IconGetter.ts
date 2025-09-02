import type { Svg } from '../core/Core.js';

const getter = `export var getAll = function () { return ({
/* inject */}); };`;

const definitions = `export declare const getAll: () => {
/* inject */};`;

const populateGetter = (svgs: Svg[]): string => {
  const body = svgs.map((svg) => `  '${svg.name}': '${svg.data}',\n`).join('');
  return getter.replace('/* inject */', body);
};

const populateGetterDeclarations = (svgs: Svg[]): string => {
  const body = svgs.map((svg) => `  '${svg.name}': string;\n`).join('');
  return definitions.replace('/* inject */', body);
};

export {
  populateGetter,
  populateGetterDeclarations
};