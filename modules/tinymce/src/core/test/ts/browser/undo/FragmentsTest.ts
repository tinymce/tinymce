import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Fragments from 'tinymce/core/undo/Fragments';

describe('browser.tinymce.core.undo.FragmentsTest', () => {
  const div = (html: string) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  };

  const html = (elm: Element) => {
    return elm.innerHTML;
  };

  it('read', () => {
    assert.deepEqual(Fragments.read(div('')), []);
    assert.deepEqual(Fragments.read(div('a')), [ 'a' ]);
    assert.deepEqual(Fragments.read(div('<!--a-->')), [ '<!--a-->' ]);
    assert.deepEqual(Fragments.read(div('<b>a</b>')), [ '<b>a</b>' ]);
    assert.deepEqual(Fragments.read(div('a<!--b--><b>c</b>')), [ 'a', '<!--b-->', '<b>c</b>' ]);
    assert.deepEqual(Fragments.read(div('<b>a\ufeff</b><b>c</b>'), true), [ '<b>a</b>', '<b>c</b>' ]);
    assert.deepEqual(Fragments.read(div('<b>a\ufeff</b><b>c</b>'), false), [ '<b>a\ufeff</b>', '<b>c</b>' ]);
    assert.deepEqual(Fragments.read(div('<b>a\ufeff</b><b>c</b>')), [ '<b>a\ufeff</b>', '<b>c</b>' ]);
  });

  it('read and exclude zero length text nodes', () => {
    const elm = div('<p>a</p><p>b</p>');
    elm.insertBefore(document.createTextNode(''), elm.lastChild);
    assert.deepEqual(Fragments.read(elm), [ '<p>a</p>', '<p>b</p>' ]);
  });

  it('write', () => {
    assert.deepEqual(html(Fragments.write([], div(''))), '');
    assert.deepEqual(html(Fragments.write([], div('a'))), '');
    assert.deepEqual(html(Fragments.write([ 'a' ], div(''))), 'a');
    assert.deepEqual(html(Fragments.write([ 'a' ], div('a'))), 'a');
    assert.deepEqual(html(Fragments.write([ 'a' ], div('b'))), 'a');
    assert.deepEqual(html(Fragments.write([ 'a', '<b>c</b>' ], div('a<b>b</b>'))), 'a<b>c</b>');
    assert.deepEqual(html(Fragments.write([ '<b>c</b>', '<b>d</b>' ], div('a<b>b</b>'))), '<b>c</b><b>d</b>');
    assert.deepEqual(html(Fragments.write([ '<b>c</b>', '<b>d</b>', '<!--e-->' ], div('a<b>b</b>'))), '<b>c</b><b>d</b><!--e-->');
  });
});
