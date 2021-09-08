import { Assertions } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';
import { TinyAssertions, TinyHooks } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import Theme from 'tinymce/themes/silver/Theme';

const defaultExpectedEvents = [
  'beforesetcontent',
  'setcontent',
  'beforegetcontent',
  'getcontent'
];

describe('browser.tinymce.core.content.EditorContentTest', () => {
  let events: string[] = [];
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    setup: (editor) => {
      editor.on('BeforeGetContent GetContent BeforeSetContent SetContent', (e) => {
        events.push(e.type);
      });
    }
  }, [ Theme ]);

  const getFontTree = (): AstNode => {
    const body = new AstNode('body', 1);
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
    assert.deepEqual(events, expectedEvents, 'Get content events should have been fired');
  };
  const clearEvents = () => events = [];

  beforeEach(() => clearEvents());

  it('TBA: getContent html', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>');
    const html = editor.getContent();
    Assertions.assertHtml('Should be expected html', '<p>html</p>', html);
    assertEventsFiredInOrder();
  });

  it('TINY-6281: getContent html with empty editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    const html = editor.getContent();
    Assertions.assertHtml('Should be expected html', '', html);
    assertEventsFiredInOrder();
  });

  it('TINY-6281: getContent text', () => {
    const editor = hook.editor();
    editor.setContent('<p>Text to be retrieved</p>');
    const text = editor.getContent({ format: 'text' });
    Assertions.assertHtml('Should be expected text', 'Text to be retrieved', text);
    assertEventsFiredInOrder();
  });

  it('TINY-6281: getContent text with empty editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    const text = editor.getContent({ format: 'text' });
    Assertions.assertHtml('Should be expected text', '', text);
    assertEventsFiredInOrder();
  });

  it('TBA: getContent tree', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    const tree = editor.getContent({ format: 'tree' });
    Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));
    assertEventsFiredInOrder();
  });

  it('TINY-6281: getContent tree with empty editor', () => {
    const editor = hook.editor();
    editor.setContent('');
    const tree = editor.getContent({ format: 'tree' });
    // bogus br that sits in an empty editor is replaced with a &nbsp; by the html parser, hence the space
    Assertions.assertHtml('Should be expected tree html', '<p> </p>', toHtml(tree));
    assertEventsFiredInOrder();
  });

  it('TBA: getContent tree filtered', () => {
    const editor = hook.editor();
    editor.setContent('<p><font size="7">x</font></p>', { format: 'raw' });
    const tree = editor.getContent({ format: 'tree' });
    Assertions.assertHtml('Should be expected tree filtered html', '<p><span style="font-size: 300%;">x</span></p>', toHtml(tree));
    assertEventsFiredInOrder();
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
  });

  it('TBA: setContent tree', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    const tree = editor.getContent({ format: 'tree' });
    Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));

    editor.setContent('<p>new html</p>');
    Assertions.assertHtml('Should be expected html', '<p>new html</p>', editor.getContent());

    editor.setContent(tree);
    Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', editor.getContent());
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
  });

  it('TBA: setContent tree filtered', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    editor.setContent(getFontTree());
    Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', editor.getContent());
    assertEventsFiredInOrder([
      'beforesetcontent',
      'setcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ]);
  });

  it('TBA: setContent tree using public api', () => {
    const editor = hook.editor();
    editor.setContent('<p>tree</p>');
    editor.setContent(getFontTree());
    Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', editor.getContent());
    assertEventsFiredInOrder([
      'beforesetcontent',
      'setcontent',
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ]);
  });

  it('TINY-7956: Get content without firing events', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>');
    clearEvents();
    const html = editor.getContent({ no_events: true });
    Assertions.assertHtml('Should be expected html', '<p>html</p>', html);
    assertEventsFiredInOrder([]);
  });

  it('TINY-7956: Set content without firing events', () => {
    const editor = hook.editor();
    editor.setContent('<p>html</p>', { no_events: true });
    assertEventsFiredInOrder([]);
  });
});
