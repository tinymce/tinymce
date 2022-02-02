import { describe, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { SugarElement, SugarNode } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.core.init.ContentStylePositionTest', () => {
  const contentStyle = '.class {color: blue;}';
  const hook = TinyHooks.bddSetupLight<Editor>({
    content_style: contentStyle,
    base_url: '/project/tinymce/js/tinymce'
  }, [ Theme ]);

  it('content styles should be after content css', () => {
    const editor = hook.editor();
    const headStuff = editor.getDoc().head.querySelectorAll<HTMLElement>('link, style');
    const linkIndex = Arr.findIndex(headStuff, (elm) => {
      return SugarNode.name(SugarElement.fromDom(elm)) === 'link';
    }).getOrDie('could not find link element');
    const styleIndex = Arr.findIndex(headStuff, (elm) => {
      return elm.innerText === contentStyle;
    }).getOrDie('could not find content style tag');

    assert.isBelow(linkIndex, styleIndex, 'style tag should be after link tag');
  });
});
