const fs = require('node:fs/promises');
const { default: DtsCreator } = require('typed-css-modules');

let creator = new DtsCreator();

fs.readdir(process.argv[2], {
  recursive: true,
}).then(files => {
  files.forEach(file => {
    if (file.endsWith('.css')) {
      creator.create(process.argv[2] + '/' + file).then(content => {
        let result = 'export default {\n';
        content.tokens.forEach((token) => {
          result += `  "${token}": "${token}",\n`;
        });
        result += '};\n';
        fs.writeFile(process.argv[2] + '/' + file.replace('.css', '.ts'), result);
      }).catch(err => {
        console.error(`Error creating CSS module for ${file.name}:`, err);
      });
    }
  })
});
