import { describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import * as Protect from 'tinymce/plugins/fullpage/core/Protect';

describe('atomic.tinymce.plugins.fullpage.ProtectTest', () => {
  it('protectHtml', () => {
    assert.equal(Protect.protectHtml([ /b/g ], 'abc'), 'a<!--mce:protected b-->c');
    assert.equal(Protect.protectHtml([ /b/g, /f/g ], 'abcdef'), 'a<!--mce:protected b-->cde<!--mce:protected f-->');
    assert.equal(Protect.protectHtml([ /<b>/g ], 'a<b>c'), 'a<!--mce:protected %3Cb%3E-->c');
  });

  it('unprotectHtml', () => {
    assert.equal(Protect.unprotectHtml('a<!--mce:protected b-->c'), 'abc');
    assert.equal(Protect.unprotectHtml('a<!--mce:protected b-->cde<!--mce:protected f-->'), 'abcdef');
    assert.equal(Protect.unprotectHtml('a<!--mce:protected %3Cb%3E-->c'), 'a<b>c');
  });
});
