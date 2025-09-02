import fs from 'fs';
import fsPromises from 'fs/promises';
import path from 'path';
import PluginError from 'plugin-error';

import Settings, { type PluginOptions } from '../Configuration.js';

import { createFiles } from './CreateFiles.js';
import { optimizeSvgs } from './Optimize.js';
import { verifyClasses } from './VerifyClasses.js';
import { verifySet } from './VerifySet.js';

export interface Svg {
  readonly name: string;
  readonly data: string;
}

const bufferFiles = async (filePaths: string[]) => {
  const svgs: Svg[] = [];
  const promises = filePaths.map(async (filePath) => {
    const name = path.basename(filePath, path.extname(filePath));
    const data = await fsPromises.readFile(filePath, 'utf8');
    return { name, data };
  });

  const results = await Promise.all(promises);
  svgs.push(...results);

  return svgs;
};

const transform = async (svgs: Svg[], rawOptions: PluginOptions) => {
  const options = Settings.getPluginOptions(rawOptions);

  const optimizedSvgs = (typeof rawOptions.svgo === 'boolean' && rawOptions.svgo === false)
    ? svgs
    : await optimizeSvgs(svgs, options.svgo);

  verifyClasses(optimizedSvgs);

  if (options.diffDefault) {
    await verifySet(optimizedSvgs, options.diffIgnore);
  }

  const filesToWrite = createFiles(optimizedSvgs, options.name);

  const writePromises = filesToWrite.map(async (file) => {
    if (!file.path || !Buffer.isBuffer(file.contents)) {
      // eslint-disable-next-line no-console
      console.error('Unexpected file object:', file);
      return;
    }
    const outputDir = './dist';
    const fullPath = `${outputDir}/${file.relative}`;
    const dirName = path.dirname(fullPath);

    // Ensure the directory exists
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    return fsPromises.writeFile(
      fullPath,
      file.extname === '.js' && options.licenseHeader !== '' && options.licenseHeader
        ? `${options.licenseHeader}\n${file.contents}`
        : file.contents
    );
  });

  await Promise.all(writePromises);

};

const iconPackager = async (options: PluginOptions): Promise<void> => {
  try {
    const svgs = await bufferFiles(options.filePaths ?? []);
    await transform(svgs, options);
  } catch (err) {
    if (err instanceof Error) {
      throw new PluginError(Settings.pluginName, err.message);
    }
    throw new PluginError(Settings.pluginName, 'Unknown error occurred');
  }
};

export { iconPackager };
