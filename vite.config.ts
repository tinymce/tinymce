import {defineConfig} from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import {resolve, basename} from 'path';
import {glob} from 'glob';

const generateDemoIndex = () => {
  const demoList = glob.globSync([resolve(__dirname, 'modules/tinymce/src/**/demo/html/*.html'), resolve(__dirname, 'modules/tinymce/src/**/demo/html/**/*.html')]);
  const filenameStartIndex = __dirname.split('/').length;

  const sortedDemos: Record<string, string[]> = demoList.reduce((acc, link) => {
    const type = link.split('/')[filenameStartIndex + 3];

    if (!acc[type]) {
      acc[type] = [];
    }

    acc[type].push(link);

    return acc;
  }, {});

  const lists = Object.keys(sortedDemos).map(
    type => `
    <h2>${type}</h2>
    <ul>
    ${sortedDemos[type].map(
      link => `<li>${type !== 'core' ? `<strong>${link.split('/')[filenameStartIndex + 4]}</strong> - ` : ''}<a href="${link.split('/').slice(filenameStartIndex).join('/')}">${basename(link)}</a></li>`).join('')
      }
    </ul>`
  ).join('');
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>Demos</title>
  </head>
  <body>
  ${lists}
  </body>
  </html>
  `;

  return html
};

export default defineConfig({
  server: {
    port: 3000
  },
  plugins: [
    tsconfigPaths(),
    {
      name: 'serve-demo-file',
      configureServer(server) {
        server.middlewares.use(
          (req, res, next) => {
            if (req.url === '/') {
              const html = generateDemoIndex();
              res.end(html)
            } else {
              next();
            }
          }
        )
      }
    }
  ]
})
