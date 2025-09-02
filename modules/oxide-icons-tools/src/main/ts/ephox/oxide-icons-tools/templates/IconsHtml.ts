import type { Svg } from '../core/Core.js';

export const populateIconsHtml = (svgs: Svg[]): string => {
  const icons = svgs.map(svg => `  <div class="icon">\n    <div class="icon-name">${svg.name}</div>\n    ${svg.data}\n  </div>`).join('\n');
  return `<!DOCTYPE html>
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
${icons}
  </div>
</body>
</html>`;
};