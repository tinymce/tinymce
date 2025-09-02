import type { Svg } from '../core/Core.js';

const template = `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      margin: 2rem;
    }
    section {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
    }
    article {
      margin: 3px;
    }
    svg {
      display: block;
    }
  </style>
</head>
<body>
  <h1>Tiny Oxide Theme Icons</h1>
  <p>Hover over an icon to display it's name</p>
  <section>
  /* inject */
  </section>
</body>
</html>`;

const createArticle = (svg: Svg): string =>
  `  <article title="${svg.name}">\n    ${svg.data}\n  </article>\n\n`;

const populateIconsHtml = (svgs: Svg[]): string => {
  const body = svgs.map(createArticle).join('');
  return template.replace('/* inject */', body);
};

export {
  populateIconsHtml
};