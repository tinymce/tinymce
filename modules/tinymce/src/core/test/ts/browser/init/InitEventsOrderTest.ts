import { Pipeline, Step } from '@ephox/agar';
import { TinyLoader } from '@ephox/mcagar';
import { UnitTest, Assert } from '@ephox/bedrock-client';

import Theme from 'tinymce/themes/silver/Theme';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';
import EditorManager from 'tinymce/core/api/EditorManager';

UnitTest.asynctest('Init events order test', (success, failure) => {
  const events: string[] = [];

  const addEvent = (evt: EditorEvent<{}>) => {
    events.push(evt.type);
  };

  const teardown = () => {
    EditorManager.off('setupeditor addeditor', addEvent);
  };

  Theme();

  EditorManager.on('setupeditor addeditor', addEvent);

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    Pipeline.async({}, [
      Step.sync(() => {
        Assert.eq('Should be expected order of events', [
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
        ], events);
      })
    ], onSuccess, onFailure);

    teardown();
  }, {
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor) => {
      editor.on('preinit addeditor scriptsloaded init visualaid loadcontent beforesetcontent setcontent postrender', addEvent);
    }
  }, success, failure);
});
