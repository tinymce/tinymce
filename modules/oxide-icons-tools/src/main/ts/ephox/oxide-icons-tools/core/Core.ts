import * as fsPromises from 'fs/promises';
import * as path from 'path';
import { optimize, type Config } from 'svgo';

import type { PluginOptions } from '../Configuration.js';

import { populateTemplates } from './CreateFiles.js';
import { verifyClasses } from './VerifyClasses.js';
import { verifySet } from './VerifySet.js';

export interface Svg {
  name: string;
  data: string;
}

const readSvg = async (filePath: string): Promise<Svg> => {
  const data = await fsPromises.readFile(filePath, 'utf8');
  return {
    name: path.basename(filePath, '.svg'),
    data
  };
};

const optimizeSvg = (svg: Svg, config: Config): Svg => {
  const result = optimize(svg.data, config);
  if ('data' in result) {
    return {
      name: svg.name,
      data: result.data
    };
  }
  throw new Error(`Failed to optimize SVG ${svg.name}`);
};

const createDirectory = async (filePath: string): Promise<void> => {
  const dir = path.dirname(filePath);
  await fsPromises.mkdir(dir, { recursive: true });
};

const writeFiles = async (filesToWrite: Array<{ path: string; contents: string }>, mockFs?: Record<string, { contents: Buffer }>): Promise<void> => {
  const writePromises = filesToWrite.map(async (file: { path: string; contents: string }) => {
    await createDirectory(file.path);
    if (mockFs) {
      mockFs[file.path] = { contents: Buffer.from(file.contents) };
    } else {
      await fsPromises.writeFile(file.path, file.contents);
    }
  });
  await Promise.all(writePromises);
};

export const iconPackager = async (options: PluginOptions & { filePaths: string[] }, mockFs?: Record<string, { contents: Buffer }>): Promise<void> => {
  const svgs = await Promise.all(options.filePaths.map(readSvg));
  const optimizedSvgs = svgs.map((svg) => optimizeSvg(svg, options.svgo ?? {}));

  verifyClasses(optimizedSvgs);
  await verifySet(optimizedSvgs, options.diffIgnore ?? []);

  const templates = populateTemplates(optimizedSvgs, options.name);
  await writeFiles(templates, mockFs);
};