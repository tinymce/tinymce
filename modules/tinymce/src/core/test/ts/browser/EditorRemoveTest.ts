import { Chain, Logger, Pipeline } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Editor as McEditor } from '@ephox/mcagar';

import Editor from 'tinymce/core/api/Editor';
import EditorManager from 'tinymce/core/api/EditorManager';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.EditorRemoveTest', (success, failure) => {
  Theme();

  const settings = {
    base_url: '/project/tinymce/js/tinymce'
  };

  const cAssertTextareaDisplayStyle = (expected) => Chain.op((editor: any) => {
    const textareaElement = editor.getElement();

    Assert.eq('element does not have the expected style', expected, textareaElement.style.display);
  });

  let uncaughtErrors: PromiseRejectionEvent[] = [];
  const recordError = (ev: PromiseRejectionEvent) => {
    uncaughtErrors.push(ev);
  };

  const cCreateEditor = Chain.injectThunked(() => new Editor('editor', {}, EditorManager));

  const cRemoveEditor = Chain.op((editor: any) => editor.remove());

  Pipeline.async({}, [
    Logger.t('remove editor without initializing it', Chain.asStep({}, [
      cCreateEditor,
      cRemoveEditor
    ])),

    Logger.t('remove editor after stylesheets load', Chain.asStep({}, [
      Chain.op(() => {
        // setup monitoring for uncaught errors
        uncaughtErrors = [];
        window.addEventListener('unhandledrejection', recordError);
      }),
      Chain.control(
        McEditor.cFromHtml('<textarea></textarea>', {
          ...settings,
          setup: (editor: Editor) => {
            editor.on('LoadContent', () => {
              // Hook the function called when stylesheets are loaded
              // so we can remove the editor right after starting to load them.
              const realLoadAll = editor.ui.styleSheetLoader.loadAll;
              editor.ui.styleSheetLoader.loadAll = (...args) => {
                realLoadAll.apply(editor.ui.styleSheetLoader, args);
                editor.remove();
              };
            });
          }
        }), (f, value, next, die, logs) => {
          f(value, (value2, logs2) => {
            die('Expected editor would not load completely', logs2);
          }, (err, logs2) => {
            // As we have deliberately removed the editor during the loading process
            // we have to intercept the error that is thrown by McEditor.cFromHtml.
            if (err === McEditor.errorMessageEditorRemoved) {
              next(value, logs2);
            } else {
              die(err, logs2);
            }
          }, logs);
        }
      ),
      Chain.wait(50), // to allow the stylesheet loading to finish
      Chain.op(() => {
        // teardown monitoring for uncaught errors
        window.removeEventListener('unhandledrejection', recordError);
        // check for uncaught promise errors
        if (uncaughtErrors.length > 0) {
          throw uncaughtErrors[0].reason;
        }
      })
    ])),

    Logger.t('remove editor where the body has been removed', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea></textarea>', settings),
      Chain.mapper((value) => {
        const body = value.getBody();
        body.parentNode.removeChild(body);
        return value;
      }),
      McEditor.cRemove
    ])),

    Logger.t('init editor with no display style', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea id="tinymce"></textarea>', settings),
      cAssertTextareaDisplayStyle('none'),
      cRemoveEditor,
      cAssertTextareaDisplayStyle(''),
      Chain.op((_editor) => {
        EditorManager.init({ selector: '#tinymce' });
      }),
      cAssertTextareaDisplayStyle(''),
      McEditor.cRemove
    ])),

    Logger.t('init editor with display: none', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea id="tinymce" style="display: none;"></textarea>', settings),
      cAssertTextareaDisplayStyle('none'),
      cRemoveEditor,
      cAssertTextareaDisplayStyle('none'),
      Chain.op((_editor) => {
        EditorManager.init({ selector: '#tinymce' });
      }),
      cAssertTextareaDisplayStyle('none'),
      McEditor.cRemove
    ])),

    Logger.t('init editor with display: block', Chain.asStep({}, [
      McEditor.cFromHtml('<textarea id="tinymce" style="display: block;"></textarea>', settings),
      cAssertTextareaDisplayStyle('none'),
      cRemoveEditor,
      cAssertTextareaDisplayStyle('block'),
      Chain.op((_editor) => {
        EditorManager.init({ selector: '#tinymce' });
      }),
      cAssertTextareaDisplayStyle('block'),
      McEditor.cRemove
    ]))
  ], success, failure);
});
