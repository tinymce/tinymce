import { describe, it } from '@ephox/bedrock-client';
import { LegacyUnit, TinyHooks } from '@ephox/mcagar';
import { SugarElement } from '@ephox/sugar';

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.BackspaceDeleteInlineTest', () => {
  const setupElement = () => {
    const div = document.createElement('div');
    div.innerHTML = (
      '<div id="lists">' +
      '<ul><li>before</li></ul>' +
      '<ul id="inline"><li>x</li></ul>' +
      '<ul><li>after</li></ul>' +
      '</div>'
    );
    document.body.appendChild(div);

    return {
      element: SugarElement.fromDom(div),
      teardown: () => {
        document.body.removeChild(div);
      },
    };
  };

  const hook = TinyHooks.bddSetupFromElement<Editor>({
    selector: '#inline',
    inline: true,
    add_unload_trigger: false,
    skin: false,
    plugins: 'lists',
    disable_nodechange: true,
    valid_styles: {
      '*': 'color,font-size,font-family,background-color,font-weight,font-style,text-decoration,float,' +
      'margin,margin-top,margin-right,margin-bottom,margin-left,display,position,top,left,list-style-type'
    }
  }, setupElement, [ Plugin, Theme ], true);

  it('TestCase-TBA: Lists: Backspace at beginning of LI on body UL', () => {
    const editor = hook.editor();
    const body = editor.getBody();
    editor.selection.setCursorLocation(body.firstChild.firstChild, 0);
    editor.plugins.lists.backspaceDelete();
    LegacyUnit.equal(DomQuery('#lists ul').length, 3);
    LegacyUnit.equal(DomQuery('#lists li').length, 3);
  });

  it('TestCase-TBA: Lists: Delete at end of LI on body UL', () => {
    const editor = hook.editor();
    const body = editor.getBody();
    editor.selection.setCursorLocation(body.firstChild.firstChild, 1);
    editor.plugins.lists.backspaceDelete(true);
    LegacyUnit.equal(DomQuery('#lists ul').length, 3);
    LegacyUnit.equal(DomQuery('#lists li').length, 3);
  });
});
