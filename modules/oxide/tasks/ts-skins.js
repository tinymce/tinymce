const fs = require('node:fs');
const { default: DtsCreator } = require('typed-css-modules');

let creator = new DtsCreator();

const files = fs.readdirSync(process.argv[2], {
  recursive: true,
});

files.forEach(file => {
  if (file.endsWith('.css')) {
    creator.create(process.argv[2] + '/' + file).then(content => {
      let result = 'export default {\n';
      content.tokens.forEach((token) => {
        result += `  "${token}": "${token}",\n`;
      });
      result += '};\n';
      fs.writeFileSync(process.argv[2] + '/' + file.replace('.css', '.ts'), result);
    }).catch(err => {
      console.error(`Error creating CSS module for ${file.name}:`, err);
    });
  }
});
