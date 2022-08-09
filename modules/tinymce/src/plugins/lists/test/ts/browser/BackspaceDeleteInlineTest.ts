import { describe, it } from '@ephox/bedrock-client';
import { Html, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import Plugin from 'tinymce/plugins/lists/Plugin';

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
  }, setupElement, [ Plugin ], true);

  it('TBA: Backspace at beginning of LI on body UL', () => {
    const editor = hook.editor();
    const body = editor.getBody();
    editor.selection.setCursorLocation(body.firstChild?.firstChild as HTMLUListElement, 0);
    editor.plugins.lists.backspaceDelete();
    assert.lengthOf(editor.dom.select('#lists ul'), 3);
    assert.lengthOf(editor.dom.select('#lists li'), 3);
  });

  it('TBA: Delete at end of LI on body UL', () => {
    const editor = hook.editor();
    const body = editor.getBody();
    editor.selection.setCursorLocation(body.firstChild?.firstChild as HTMLUListElement, 1);
    editor.plugins.lists.backspaceDelete(true);
    assert.lengthOf(editor.dom.select('#lists ul'), 3);
    assert.lengthOf(editor.dom.select('#lists li'), 3);
  });
});
