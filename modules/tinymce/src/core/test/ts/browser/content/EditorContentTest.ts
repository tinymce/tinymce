import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { Arr, Type } from '@ephox/katamari';
import { PlatformDetection } from '@ephox/sand';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import { BeforeGetContentEvent, BeforeSetContentEvent, GetContentEvent, SetContentEvent } from 'tinymce/core/api/EventTypes';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

const defaultExpectedEvents = [
  'beforesetcontent',
  'setcontent',
  'beforegetcontent',
  'getcontent'
];

describe('browser.tinymce.core.content.EditorContentTest', () => {
  let events: EditorEvent<SetContentEvent | GetContentEvent | BeforeSetContentEvent | BeforeGetContentEvent>[] = [];
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    setup: (editor) => {
      editor.on('BeforeGetContent GetContent BeforeSetContent SetContent', (e) => {
        events.push(e);
      });
    }
  }, []);

  const getFontTree = (): AstNode => {
    const body = new AstNode('body', 11);
    const font = new AstNode('font', 1);
    const text = new AstNode('#text', 3);

    text.value = 'x';
    font.attr('size', '7');
    font.append(text);
    body.append(font);

    return body;
  };

  const toHtml = (node: AstNode): string => {
    const htmlSerializer = HtmlSerializer({});
    return htmlSerializer.serialize(node);
  };

  const assertEventsFiredInOrder = (expectedEvents: string[] = defaultExpectedEvents) => {
    const names = Arr.map(events, (e) => e.type);
    assert.deepEqual(names, expectedEvents, 'Get content events should have been fired');
  };

  const assertEventsContentType = () => {
    const isExpectedTypes = Arr.forall(events, (e) => e.type === 'beforegetcontent' ? Type.isUndefined(e.content) : Type.isString(e.content));
    assert.isTrue(isExpectedTypes);
  };

  const isSafari = () => PlatformDetection.detect().browser.isSafari();

  const testGetTextContent = (content: string, expected: string) => {
    const editor = hook.editor();
    editor.setContent(content);
    TinyAssertions.assertContent(editor, expected, { format: 'text' });
    assertEventsFiredInOrder();
    assertEventsContentType();
  };

  const clearEvents = () => events = [];

  beforeEach(() => clearEvents());

  it('TBA: getContent html', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>');
    const html = editor.getContent();
    assert.equal(html, '<p>html</p>', 'Should be expected html');
    assertEventsFiredInOrder();
    assertEventsContentType();
  });

  it('TINY-6281: getContent html with empty editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    const html = editor.getContent();
    assert.equal(html, '', 'Should be expected html');
    assertEventsFiredInOrder();
    assertEventsContentType();
  });

  // TODO: TINY-8367 The table plugin code has been moved to core so there is now always an extra DIV in the dom for the table resize bars
  // Safari differs in behaviour compared to the other browsers when getting text content for inline mode.
  // When the resize bar div is included in the DOM, editor.getBody().innerText includes two extra \n at the end
  it('TINY-6281: getContent text', () => testGetTextContent('<p>Text to be retrieved</p>', 'Text to be retrieved' + (isSafari() ? '\n\n' : '')));

  it('TINY-8578: getContent text, empty line in div', () => testGetTextContent('<div><p></p></div>', ''));

  it('TINY-8578: getContent text, empty line', () => testGetTextContent('<p></p>', ''));

  it('TINY-8578: getContent text, two empty lines in div', () => testGetTextContent('<div><p></p><p></p></div>', isSafari() ? '\n\n' : '\n\n\n\n'));

  it('TINY-8578: getContent text, two empty lines', () => testGetTextContent('<p></p><p></p>', isSafari() ? '\n\n' : '\n\n\n\n'));

  it('TINY-6281: getContent text with empty editor', () => testGetTextContent('', ''));

  it('TBA: getContent tree', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    const tree = editor.getContent({ format: 'tree' });
    assert.equal(toHtml(tree), '<p>tree</p>', 'Should be expected tree html');
    assertEventsFiredInOrder();
    assertEventsContentType();
  });

  it('TINY-6281: getContent tree with empty editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    const tree = editor.getContent({ format: 'tree' });
    // bogus br that sits in an empty editor is replaced with a &nbsp; by the html parser, hence the space
    assert.equal(toHtml(tree), '<p> </p>', 'Should be expected tree html');
    assertEventsFiredInOrder();
    assertEventsContentType();
  });

  it('TBA: getContent tree filtered', () => {
    const editor = hook.editor();
    editor.setContent('<p><font size="7">x</font></p>', { format: 'raw' });
    const tree = editor.getContent({ format: 'tree' });
    assert.equal(toHtml(tree), '<p><span style="font-size: 300%;">x</span></p>', 'Should be expected tree filtered html');
    assertEventsFiredInOrder();
    assertEventsContentType();
  });

  it('TBA: setContent html', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>');
    editor.setContent('<p>new html</p>');
    TinyAssertions.assertContent(editor, '<p>new html</p>');
    assertEventsFiredInOrder([
      'beforesetcontent',
      'setcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ]);
    assertEventsContentType();
  });

  it('TBA: setContent tree', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    const tree = editor.getContent({ format: 'tree' });
    assert.equal(toHtml(tree), '<p>tree</p>', 'Should be expected tree html');

    editor.setContent('<p>new html</p>');
    assert.equal(editor.getContent(), '<p>new html</p>', 'Should be expected html');

    editor.setContent(tree);
    assert.equal(editor.getContent(), '<p>tree</p>', 'Should be expected tree html');
    assertEventsFiredInOrder([
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ]);
    assertEventsContentType();
  });

  it('TBA: setContent tree filtered', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    editor.setContent(getFontTree());
    assert.equal(editor.getContent(), '<span style="font-size: 300%;">x</span>', 'Should be expected filtered html');
    assertEventsFiredInOrder([
      'beforesetcontent',
      'setcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ]);
    assertEventsContentType();
  });

  it('TBA: setContent tree using public api', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    editor.setContent(getFontTree());
    assert.equal(editor.getContent(), '<span style="font-size: 300%;">x</span>', 'Should be expected filtered html');
    assertEventsFiredInOrder([
      'beforesetcontent',
      'setcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ]);
    assertEventsContentType();
  });

  it('TINY-7956: Get content without firing events', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>');
    clearEvents();
    const html = editor.getContent({ no_events: true });
    assert.equal(html, '<p>html</p>', 'Should be expected html');
    assertEventsFiredInOrder([]);
    assertEventsContentType();
  });

  it('TINY-7956: Set content without firing events', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>', { no_events: true });
    assertEventsFiredInOrder([]);
    assertEventsContentType();
  });

  it('TINY-7996: Set tree content with content altered in BeforeSetContent', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    editor.once('BeforeSetContent', (e) => {
      assert.equal(e.content, '<font size="7">x</font>');
      e.content = '<p>replaced</p>';
    });
    editor.setContent(getFontTree());
    assert.equal(editor.getContent(), '<p>replaced</p>', 'Should be replaced html');
  });

  it('TINY-7996: Get tree content with content altered in GetContent', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    editor.once('GetContent', (e) => {
      assert.equal(e.content, '<p>tree</p>');
      e.content = '<p>replaced</p>';
    });
    const tree = editor.getContent({ format: 'tree' });
    assert.equal(toHtml(tree), '<p>replaced</p>', 'Should be replaced html');
  });
});
