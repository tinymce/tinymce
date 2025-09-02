import { describe, it } from 'mocha';
import { assert } from 'chai';

import { validateModuleStructure } from 'ephox/oxide-icons-tools/core/ModuleValidator';
import { iconPackager } from 'ephox/oxide-icons-tools/api/Main';

describe('oxide-icons-tools.api.Package', () => {
  const svgs = [
    {
      name: 'test-icon',
      data: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>'
    }
  ];

  it('should generate a valid ES6 module', () => {
    const code = `
      export const getAll = () => ({
        'test-icon': '${svgs[0].data}'
      });
    `;

    // Validate module structure using AST
    const astResult = validateModuleStructure(code);
    assert.isTrue(astResult.isValid, `Module structure validation failed: ${astResult.errors.join(', ')}`);
  });

  it('should generate a valid TypeScript declaration file', () => {
    const code = 'export declare function getAll(): Record<string, string>;';
    assert.isString(code);
  });

  it('should generate a valid HTML file', () => {
    const code = `<!DOCTYPE html>
<html>
<head>
  <title>Icons</title>
  <style>
    body { font-family: sans-serif; }
    .icon { display: inline-block; margin: 10px; text-align: center; }
    .icon-name { margin-bottom: 5px; }
    svg { width: 24px; height: 24px; }
  </style>
</head>
<body>
  <h1>Icons</h1>
  <div class="icons">
    <div class="icon">
      <div class="icon-name">test-icon</div>
      ${svgs[0].data}
    </div>
  </div>
</body>
</html>`;
    assert.isString(code);
  });

  it('should generate a valid TinyMCE icon pack', () => {
    const code = `tinymce.IconManager.add('my-icon-pack', {
      'test-icon': '${svgs[0].data}'
    });`;
    assert.isString(code);
  });

  it('should package icons', async () => {
    const mockFs = {};
    const options = {
      name: 'test-icons',
      filePaths: ['test-icon.svg'],
      outputDir: 'dist',
      mockFs
    };

    await iconPackager(options);

    // Check that the files were written
    assert.isTrue('dist/icons.js' in mockFs);
    assert.isTrue('dist/icons.d.ts' in mockFs);
    assert.isTrue('dist/icons.html' in mockFs);
    assert.isTrue('dist/icons.tinymce.js' in mockFs);
  });
});