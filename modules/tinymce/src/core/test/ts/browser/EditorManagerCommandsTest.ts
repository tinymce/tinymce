import { after, afterEach, before, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import 'tinymce';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

import * as ViewBlock from '../module/test/ViewBlock';

describe('browser.tinymce.core.EditorManagerCommandsTest', () => {
  const viewBlock = ViewBlock.bddSetup();

  before(() => {
    Theme();
    EditorManager._setBaseUrl('/project/tinymce/js/tinymce');
  });

  after(() => {
    EditorManager.remove();
  });

  afterEach((done) => {
    setTimeout(() => {
      EditorManager.remove();
      done();
    }, 0);
  });

  it('mceToggleEditor', (done) => {
    viewBlock.update('<textarea class="tinymce"></textarea>');
    EditorManager.init({
      selector: 'textarea.tinymce',
      init_instance_callback: (editor1) => {
        assert.isFalse(editor1.isHidden(), 'editor should be visible');
        EditorManager.execCommand('mceToggleEditor', false, 0);
        assert.isTrue(editor1.isHidden(), 'editor should be hidden');
        EditorManager.execCommand('mceToggleEditor', false, 0);
        assert.isFalse(editor1.isHidden(), 'editor should be visible');
        done();
      }
    });
  });

  it('mceRemoveEditor', (done) => {
    viewBlock.update('<textarea class="tinymce"></textarea>');
    EditorManager.init({
      selector: 'textarea.tinymce',
      init_instance_callback: (_editor1) => {
        assert.lengthOf(EditorManager.get(), 1);
        EditorManager.execCommand('mceRemoveEditor', false, 0);
        assert.lengthOf(EditorManager.get(), 0);
        done();
      }
    });
  });

  it('mceAddEditor - passing id directly as value', (done) => {
    viewBlock.update('<textarea id="ed_1" class="tinymce"></textarea><textarea id="ed_2" class="tinymce"></textarea>');
    EditorManager.init({
      selector: 'textarea#ed_1',
      init_instance_callback: (_editor1) => {
        assert.lengthOf(EditorManager.get(), 1);
        EditorManager.execCommand('mceAddEditor', false, 'ed_2');
        assert.lengthOf(EditorManager.get(), 2);
        done();
      }
    });
  });

  it('mceAddEditor - passing id and options as value', (done) => {
    viewBlock.update('<textarea id="ed_1" class="tinymce"></textarea><textarea id="ed_2" class="tinymce"></textarea>');
    EditorManager.init({
      selector: 'textarea#ed_1',
      init_instance_callback: (_editor1) => {
        assert.lengthOf(EditorManager.get(), 1);
        assert.isFalse(EditorManager.get('ed_1').mode.isReadOnly());
        EditorManager.execCommand('mceAddEditor', false, {
          id: 'ed_2',
          options: {
            readonly: true,
            init_instance_callback: (editor2) => {
              assert.lengthOf(EditorManager.get(), 2);
              assert.isTrue(editor2.mode.isReadOnly());
              done();
            }
          }
        });
      }
    });
  });
});
