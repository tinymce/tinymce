import { UnitTest } from '@ephox/bedrock-client';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { Editor } from 'ephox/mcagar/alien/EditorTypes';
import * as TinyLoader from 'ephox/mcagar/api/pipeline/TinyLoader';

UnitTest.asynctest('TinyLoader should fail (instead of timeout) when exception is thrown in callback function', (success, failure) => {
  const targetElement = SugarElement.fromTag('textarea');
  Insert.append(SugarBody.body(), targetElement);

  let cleanupEditor: Editor;
  TinyLoader.setupFromElement(
    (e: Editor) => {
      cleanupEditor = e;
      throw new Error('boo!');
    },
    { base_url: '/project/tinymce/js/tinymce' },
    targetElement,
    failure,
    () => {
      cleanupEditor?.remove();
      Remove.remove(targetElement);
      success();
    });
});
