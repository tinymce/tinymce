import { DOMParser } from '@xmldom/xmldom';
import { assert } from 'chai';
import fs from 'fs';
import fsPromises from 'fs/promises';
import { describe } from 'mocha';
import path from 'path';

import { iconPackager } from '../../main/ts/api/Main.js';
import type { PluginOptions } from '../../main/ts/Configuration.js';
import type { Svg } from '../../main/ts/core/Core.js';
import type { Template } from '../../main/ts/core/CreateFiles.js';

import { validateModule } from './utils/ModuleValidator.js';

const readFilesRecursively = async (dir: string, mockFs: Record<string, Template>) => {
  const files = await fsPromises.readdir(dir, { withFileTypes: true });

  const promises = files.map(async (file) => {
    const filePath = path.join(dir, file.name);
    if (file.isDirectory()) {
      return readFilesRecursively(filePath, mockFs);
    } else {
      const contents = await fsPromises.readFile(filePath);
      mockFs[filePath] = {
        base: '.',
        path: filePath,
        relative: file.name,
        extname: path.extname(filePath),
        contents: Buffer.from(contents),
        toString: () => `<File "${filePath}" <Buffer ${contents.toString().substring(0, 50)} ... ${contents.length - 50} more bytes>>`,
      };
    }
  });

  await Promise.all(promises);
};

const runPlugin = async (options: PluginOptions, svgs: Svg[]): Promise<Record<string, Template>> => {
  const mockFs: Record<string, Template> = {};

  if (!fs.existsSync('./dist')) {
    fs.mkdirSync('./dist');
  }

  options.filePaths = svgs.map((svg) => `./${svg.name}.svg`);

  const writePromises = svgs.map((svg) => {
    const tmpPath = `./${svg.name}.svg`;
    return fsPromises.writeFile(tmpPath, svg.data);
  });

  await Promise.all(writePromises);

  await ((iconPackager as unknown) as (options: PluginOptions) => Promise<void>)(options);

  const outputDir = './dist';
  await readFilesRecursively(outputDir, mockFs);

  return mockFs;
};

describe('PluginTest', () => {
  const svgs = [
    { name: 'highlight-bg-color', data: '<svg class="tox-icon-highlight-bg-color__color" width="24" height="24"></svg>' },
    { name: 'text-color', data: '<svg class="tox-icon-text-color__color" width="24" height="24"></svg>' },
    { name: 'align-left', data: '<svg width="24" height="24"><g id="a-invalid-id"></g></svg>' },
    { name: 'align-right', data: '<svg width="24" height="24"></svg>' }
  ];

  const validateIcons = (icons: Record<string, string>) => {
    const hasId = (rawSvg: string, id: string): boolean => {
      const dom = new DOMParser().parseFromString(rawSvg, 'image/svg+xml');
      return !!dom.getElementById(id);
    };

    const hasClass = (rawSvg: string, id: string): boolean => {
      const dom = new DOMParser().parseFromString(rawSvg, 'image/svg+xml');
      return dom.getElementsByClassName(id).length > 0;
    };

    const testColorIcon = (id: string, className: string) => {
      assert.isTrue(hasClass(icons[id], className), `Should preserve "${className}" class`);
      assert.isFalse(hasId(icons[id], className), `Should preserve "${className}" class`);
    };

    assert.hasAllKeys(icons, svgs.map((svg) => svg.name), 'Should have all icons');
    testColorIcon('highlight-bg-color', 'tox-icon-highlight-bg-color__color');
    testColorIcon('text-color', 'tox-icon-text-color__color');
    assert.isFalse(
      hasId(icons['align-left'], 'a-invalid-id'),
      'Should not preserve "a-invalid-id" id'
    );
  };

  afterEach(async () => {
    await fsPromises.rm('./dist', { recursive: true, force: true });
    await Promise.all(svgs.map((svg) => fsPromises.unlink(`./${svg.name}.svg`)));
  });

  it('Should output files on correct paths', async () => {
    const mockFs = await runPlugin({ name: 'my-icon-pack' }, svgs);
    assert.hasAllKeys(
      mockFs,
      [
        'dist/html/icons.html',
        'dist/icons/my-icon-pack/icons.js',
        'dist/js/icons.d.ts',
        'dist/js/icons.js'
      ],
      'Should output all files on correct paths'
    );
  });

  it('"js/icons.js" should be a ES6 module with named export "getAll"', async () => {
    const mockFs = await runPlugin({ name: 'my-icon-pack' }, svgs);
    const file = mockFs['dist/js/icons.js'];

    if (!file) {
      throw new Error('File js/icons.js not found in mockFs');
    }

    const exprt = await validateModule((file.contents as Buffer).toString());
    assert.isFunction(exprt?.getAll, 'Should have named export "getAll"');
    if (!exprt?.getAll) {
      throw new Error('getAll function not found in module exports');
    }
    validateIcons(exprt.getAll());
  });

  it('"icons/my-icon-pack/icons.js" should add an icon pack to tinymce global', async () => {
    const mockFs = await runPlugin({ name: 'my-icon-pack' }, svgs);
    const file = mockFs['dist/icons/my-icon-pack/icons.js'];

    Object.defineProperty(global, 'tinymce', {
      value: {
        IconManager: {
          add: (name: string, iconPack: { icons: Record<string, string> }) => {
            assert.strictEqual(name, 'my-icon-pack', 'Should be correct icon pack name');
            validateIcons(iconPack.icons);
          }
        }
      }
    });

    await validateModule((file.contents as Buffer).toString());
  });
});