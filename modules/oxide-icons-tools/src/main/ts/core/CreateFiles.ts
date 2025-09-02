import path from 'path';

import { populateGetter, populateGetterDeclarations } from '../templates/IconGetter.js';
import { populateIconProvider } from '../templates/IconProvider.js';
import { populateIconsHtml } from '../templates/IconsHtml.js';

import type { Svg } from './Core.js';

export interface Template {
  readonly base: string;
  readonly path: string;
  readonly relative: string;
  readonly extname: string;
  readonly contents: Buffer;
  readonly toString: () => string;
}

const populateTemplates = (svgs: Svg[], name: string) => [
  {
    path: 'icons/default/icons.js',
    contents: populateGetter(svgs)
  },
  {
    path: 'icons/default/icons.d.ts',
    contents: populateGetterDeclarations(svgs)
  },
  {
    path: 'html/icons.html',
    contents: populateIconsHtml(svgs)
  },
  {
    path: `icons/${name}/icons.js`,
    contents: populateIconProvider(svgs, name)
  }
];

const createFiles = (svgs: Svg[], name: string): Template[] =>
  populateTemplates(svgs, name).map((data) => ({
    base: '.',
    path: data.path,
    relative: path.relative('.', data.path),
    extname: path.extname(data.path),
    contents: Buffer.from(data.contents),
    toString: () => `<File "${data.path}" <Buffer ${data.contents.toString().substring(0, 50)} ... ${data.contents.length - 50} more bytes>>`
  }));

export {
  createFiles
};