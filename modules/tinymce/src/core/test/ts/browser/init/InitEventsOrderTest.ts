import { after, before, describe, it } from '@ephox/bedrock-client';
import { TinyHooks } from '@ephox/mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import Theme from 'tinymce/themes/silver/Theme';

describe('Init events order test', () => {
  const events: string[] = [];

  const addEvent = (evt: EditorEvent<{}>) => {
    events.push(evt.type);
  };

  before(() => {
    EditorManager.on('setupeditor addeditor', addEvent);
  });

  TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor) => {
      editor.on('preinit addeditor scriptsloaded init visualaid loadcontent beforesetcontent setcontent postrender', addEvent);
    }
  }, [ Theme ]);

  after(() => {
    EditorManager.off('setupeditor addeditor', addEvent);
  });

  it('Event order during init', () => {
    assert.deepEqual(events, [
      'setupeditor',
      'addeditor',
      'scriptsloaded',
      'preinit',
      'postrender',
      'beforesetcontent',
      'setcontent',
      'visualaid',
      'loadcontent',
      'init'
    ], 'Should be expected order of events');
  });
});
