import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Singleton } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { SetContentEvent, GetContentEvent } from 'tinymce/core/api/EventTypes';
import { ContentFormat } from 'tinymce/core/content/ContentTypes';

describe('browser.tinymce.core.content.EditorContentEventsTest', () => {
  const initialContent = '<p>Some initial content</p>';
  let events: string[] = [];

  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      editor.on('BeforeGetContent GetContent BeforeSetContent SetContent', (e) => {
        events.push(e.type);
      });
    }
  }, []);

  beforeEach(() => {
    const editor = hook.editor();
    editor.setContent(initialContent);
    TinySelections.select(editor, 'p', [ 0 ]);
    clearEvents();
  });

  const clearEvents = () => events = [];
  const assertEvents = (expected: string[]) => {
    assert.deepEqual(events, expected);
  };

  const overrideGetContent = (content: string) => {
    hook.editor().once('BeforeGetContent', (e) => {
      e.preventDefault();
      e.content = content;
    });
  };

  const preventSetContent = () => {
    hook.editor().once('BeforeSetContent', (e) => {
      e.preventDefault();
    });
  };

  it('TINY-8018: get content APIs can be overridden by using the before event', () => {
    const editor = hook.editor();

    clearEvents();
    overrideGetContent('<h1>new content</h1>');
    TinyAssertions.assertContent(editor, '<h1>new content</h1>');
    assertEvents([ 'beforegetcontent', 'getcontent' ]);

    clearEvents();
    overrideGetContent('selection content');
    assert.equal(editor.selection.getContent(), 'selection content');
    assertEvents([ 'beforegetcontent', 'getcontent' ]);
  });

  it('TINY-8018: get content APIs should not fire events when no_events is passed', () => {
    const editor = hook.editor();

    clearEvents();
    TinyAssertions.assertContent(editor, '<p>Some initial content</p>', { no_events: true });
    assertEvents([]);

    clearEvents();
    assert.equal(editor.selection.getContent({ no_events: true }), 'Some initial content');
    assertEvents([]);
  });

  it('TINY-8018: Get content events should be fired regardless of the format', () => {
    const editor = hook.editor();
    const formats: ContentFormat[] = [ 'tree', 'text', 'html' ];

    Arr.each(formats, (format) => {
      clearEvents();
      editor.getContent({ format });
      assertEvents([ 'beforegetcontent', 'getcontent' ]);
    });

    Arr.each(formats, (format) => {
      clearEvents();
      editor.selection.getContent({ format });
      assertEvents([ 'beforegetcontent', 'getcontent' ]);
    });
  });

  it('TINY-8018: set/insert content APIs can be prevented by using the before event', () => {
    const editor = hook.editor();

    clearEvents();
    preventSetContent();
    editor.setContent('<p>New content</p>');
    assertEvents([ 'beforesetcontent', 'setcontent' ]);
    TinyAssertions.assertContent(editor, initialContent);

    clearEvents();
    preventSetContent();
    editor.selection.setContent('New content');
    assertEvents([ 'beforesetcontent', 'setcontent' ]);
    TinyAssertions.assertContent(editor, initialContent);

    clearEvents();
    preventSetContent();
    editor.insertContent('Inserted content');
    assertEvents([ 'beforesetcontent', 'setcontent' ]);
    TinyAssertions.assertContent(editor, initialContent);
  });

  it('TINY-8018: set content APIs should not fire events when no_events is passed', () => {
    const editor = hook.editor();

    clearEvents();
    editor.setContent('<p>New content</p>', { no_events: true });
    assertEvents([]);
    TinyAssertions.assertContent(editor, '<p>New content</p>');

    clearEvents();
    TinySelections.select(editor, 'p', [ 0 ]);
    editor.selection.setContent('Selection content', { no_events: true });
    assertEvents([]);
    TinyAssertions.assertContent(editor, '<p>Selection content</p>');
  });

  const data = { hello: 'world', test: 132 };
  Arr.each([ 'BeforeSetContent', 'SetContent' ], (action) => {
    it(`TINY-9143: Can pass custom data object to "${action}" event`, () => {
      const editor = hook.editor();
      const lastEventState = Singleton.value<SetContentEvent>();
      editor.setContent('<p>initial</p>');
      editor.once(action, (e) => lastEventState.set(e));
      editor.setContent('<p>new</p>', data);
      const lastEvent = lastEventState.get().getOrDie('Should be set');
      assert.equal(lastEvent.hello, data.hello);
      assert.equal(lastEvent.test, data.test);
    });
  });
  Arr.each([ 'BeforeGetContent', 'GetContent' ], (action) => {
    it(`TINY-9143: Can pass custom data object to "${action}" event`, () => {
      const editor = hook.editor();
      const lastEventState = Singleton.value<GetContentEvent>();
      editor.setContent('<p>initial</p>');
      editor.once(action, (e) => lastEventState.set(e));
      editor.getContent(data);
      const lastEvent = lastEventState.get().getOrDie('Should be set');
      assert.equal(lastEvent.hello, data.hello);
      assert.equal(lastEvent.test, data.test);
    });
  });
});
