import { describe, it } from '@ephox/bedrock-client';
import { SugarElement, SelectorFind } from '@ephox/sugar';
import { assert } from 'chai';

import * as Empty from 'tinymce/core/dom/Empty';

describe('browser.tinymce.core.dom.EmptyTest', () => {
  const testEmpty = (html: string, expected: boolean) => {
    const elm = SugarElement.fromHtml(html);
    const expectedLabel = expected ? 'empty' : 'not empty';
    assert.equal(Empty.isEmpty(elm), expected, html + ' should be treated as ' + expectedLabel);
  };

  it('Empty elements', () => {
    testEmpty(' ', true);
    testEmpty('\t', true);
    testEmpty('\r', true);
    testEmpty('\n', true);
    testEmpty(' \t\r\n ', true);
    testEmpty('<!-- x -->', true);
    testEmpty('<p></p>', true);
    testEmpty('<b></b>', true);
    testEmpty('<p><b></b></p>', true);
    testEmpty('<p><br></p>', true);
    testEmpty('<p><i><b></b></i><b><i></i></b></p>', true);
    testEmpty('<span></span>', true);
    testEmpty('<p><i><b></b></i><b><i data-mce-bogus="all"><img src="#"></i></b></p>', true);
    testEmpty('<p><br data-mce-bogus="1"><br></p>', true);
    testEmpty('<a id="link" href="http://some.url/"></a>', true);
  });

  it('Non empty elements', () => {
    testEmpty('<br>', false);
    testEmpty('<img src="#">', false);
    testEmpty('<input>', false);
    testEmpty('<textarea></textarea>', false);
    testEmpty('<hr>', false);
    testEmpty('a', false);
    testEmpty('abc', false);
    testEmpty('<p>abc</p>', false);
    testEmpty('<p><br><br></p>', false);
    testEmpty('<p><i><b></b></i><b><i><img src="#"></i></b></p>', false);
    testEmpty('<span data-mce-bookmark="x"></span>', false);
    testEmpty('<span contenteditable="false"></span>', false);
    testEmpty('<div contenteditable="false"><span contenteditable="true"></span></div>', false);
    testEmpty('<a id="anchor"></a>', false);
  });

  it('TINY-10010: table cell with empty CET should not be treated as empty', () => {
    const html = `<table style="border-collapse: collapse; width: 100%;" border="1">
        <tbody>
        <tr>
          <td>
            <div contenteditable="true" style="border: 2px solid red"></div>
          </td>
        </tr>
        </tbody>
      </table>`;
    const table = SugarElement.fromHtml(html);
    const td = SelectorFind.descendant(table, 'td').getOrDie();
    assert.isFalse(Empty.isEmpty(td));
  });
});
