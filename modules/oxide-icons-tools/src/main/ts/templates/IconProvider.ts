import type { Svg } from '../core/Core.js';

const template = `tinymce.IconManager.add('/* name */', {
  icons: {
/* inject */  }
});`;

const populateIconProvider = (svgs: Svg[], name: string): string => {
  const body = svgs.map((svg) => `    '${svg.name}': '${svg.data}',\n`).join('');
  return template.replace('/* name */', name).replace('/* inject */', body);
};

export {
  populateIconProvider
};