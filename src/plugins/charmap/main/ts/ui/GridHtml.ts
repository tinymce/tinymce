/**
 * GridHtml.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

const getHtml = function (charmap) {
  let gridHtml, x, y;
  const width = Math.min(charmap.length, 25);
  const height = Math.ceil(charmap.length / width);

  gridHtml = '<table role="presentation" cellspacing="0" class="mce-charmap"><tbody>';

  for (y = 0; y < height; y++) {
    gridHtml += '<tr>';

    for (x = 0; x < width; x++) {
      const index = y * width + x;
      if (index < charmap.length) {
        const chr = charmap[index];
        let chrText = '';
        let charCode = 0;
        const charCode4DataAttr = [];
        if (chr[0] instanceof Array || chr[0] instanceof Object) {
          for (let c = 0; c < chr[0].length; c++) {
            charCode = parseInt(chr[0][c], 10);
            charCode4DataAttr.push(charCode.toString());
            chrText += chr[0] ? String.fromCharCode(charCode) : '&nbsp;';
          }
        } else {
          charCode = parseInt(chr[0], 10);
          charCode4DataAttr.push(charCode.toString());
          chrText = chr ? String.fromCharCode(charCode) : '&nbsp;';
        }

        const title = chr[2] && typeof chr[2] === 'string' ? chr[2] : '';
        gridHtml += (
          '<td title="' + title + '">' +
          '<div tabindex="-1" title="' + title + '" role="button" data-chr="' + charCode4DataAttr.join(';') + '">' +
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
