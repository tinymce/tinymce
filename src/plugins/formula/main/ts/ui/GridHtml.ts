/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

const getHtml = function (formula) {
  let gridHtml, x, y;
  const width = Math.min(formula.length, 25);
  const height = Math.ceil(formula.length / width);

  gridHtml = '<table role="presentation" cellspacing="0" class="mce-charmap"><tbody>';

  for (y = 0; y < height; y++) {
    gridHtml += '<tr>';

    for (x = 0; x < width; x++) {
      const index = y * width + x;
      if (index < formula.length) {
        const chr = formula[index];
        const initial = parseInt(chr[0], 10);
        let chrText = '';

        if (chr[0].length === undefined) {
          chrText = String.fromCharCode(initial);
        } else {
          for (let i = 0; i < chr[0].length; i++) {
            chrText += String.fromCharCode(parseInt(chr[0][i], 10));
          }
        }
        gridHtml += (
          '<td title="' + chr[1] + '">' +
          '<div tabindex="-1" title="' + chr[1] + '" role="button" data-chr="' + chr[0] + '">' +
          chrText +
          '</div>' +
          '</td>'
        );
      } else {
        gridHtml += '<td />';
      }
    }

    gridHtml += '</tr>';
  }

  gridHtml += '</tbody></table>';

  return gridHtml;
};

export default {
  getHtml
};