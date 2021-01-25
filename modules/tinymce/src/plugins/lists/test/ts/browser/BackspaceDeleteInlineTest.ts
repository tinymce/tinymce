import { describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { Html, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import DomQuery from 'tinymce/core/api/dom/DomQuery';
import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';
import Theme from 'tinymce/themes/silver/Theme';

describe('browser.tinymce.plugins.lists.BackspaceDeleteInlineTest', () => {
  const setupElement = () => {
    const div = SugarElement.fromTag('div');
    Html.set(div, (
      '<div id="lists">' +
      '<ul><li>before</li></ul>' +
      '<ul id="inline"><li>x</li></ul>' +
      '<ul><li>after</li></ul>' +
      '</div>'
    ));
    Insert.append(SugarBody.body(), div);

    return {
      element: div,
      teardown: () => {
        Remove.remove(div);
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

  it('TBA: Backspace at beginning of LI on body UL', () => {
    const editor = hook.editor();
    const body = editor.getBody();
    editor.selection.setCursorLocation(body.firstChild.firstChild, 0);
    editor.plugins.lists.backspaceDelete();
    assert.lengthOf(DomQuery('#lists ul'), 3);
    assert.lengthOf(DomQuery('#lists li'), 3);
  });

  it('TBA: Delete at end of LI on body UL', () => {
    const editor = hook.editor();
    const body = editor.getBody();
    editor.selection.setCursorLocation(body.firstChild.firstChild, 1);
    editor.plugins.lists.backspaceDelete(true);
    assert.lengthOf(DomQuery('#lists ul'), 3);
    assert.lengthOf(DomQuery('#lists li'), 3);
  });
});
