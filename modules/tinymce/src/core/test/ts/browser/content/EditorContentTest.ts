import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import * as EditorContent from 'tinymce/core/content/EditorContent';
import EditorManager from 'tinymce/core/api/EditorManager';
import { EditorEvent } from 'tinymce/core/api/PublicApi';

import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.content.EditorContentTest', (success, failure) => {
  const getFontTree = () => {
    const body = new AstNode('body', 1);
    const font = new AstNode('font', 1);
    const text = new AstNode('#text', 3);

    text.value = 'x';
    font.attr('size', '7');
    font.append(text);
    body.append(font);

    return body;
  };

  Theme();

  const toHtml = (node: AstNode) => {
    const htmlSerializer = HtmlSerializer({});
    return htmlSerializer.serialize(node);
  };

  let events = [];
  const logEvent = (event: EditorEvent<{}>) => {
    events.push(event.type);
  };
  EditorManager.on('beforegetcontent getcontent beforesetcontent setcontent', logEvent);

  const sAssertEventsFiredInOrder = (expectedEvents?: string[]) => Step.sync(() => {
    Assertions.assertEq('Get content events should have been fired', expectedEvents || [
      'beforesetcontent',
      'setcontent',
      'beforegetcontent',
      'getcontent'
    ], events);
  });
  const sClearEvents = () => Step.sync(() => events = []);
  const teardown = () => EditorManager.off('beforegetcontent getcontent beforesetcontent setcontent', logEvent);

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);
    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'getContent html', [
        sClearEvents(),
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const html = <string> EditorContent.getContent(editor);
          Assertions.assertHtml('Should be expected html', '<p>html</p>', html);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent html with empty editor', [
        sClearEvents(),
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const html = <string> EditorContent.getContent(editor);
          Assertions.assertHtml('Should be expected html', '', html);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent text', [
        sClearEvents(),
        tinyApis.sSetContent('<p>Text to be retrieved</p>'),
        Step.sync(() => {
          const text = <string> EditorContent.getContent(editor, { format: 'text' });
          Assertions.assertHtml('Should be expected text', 'Text to be retrieved', text);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent text with empty editor', [
        sClearEvents(),
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const text = <string> EditorContent.getContent(editor, { format: 'text' });
          Assertions.assertHtml('Should be expected text', '', text);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'getContent tree', [
        sClearEvents(),
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent tree with empty editor', [
        sClearEvents(),
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          // bogus br that sits in an empty editor is replaced with a &nbsp; by the html parser, hence the space
          Assertions.assertHtml('Should be expected tree html', '<p> </p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'getContent tree filtered', [
        sClearEvents(),
        Step.sync(() => {
          EditorContent.setContent(editor, '<p><font size="7">x</font></p>', { format: 'raw' });
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree filtered html', '<p><span style="font-size: 300%;">x</span></p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'getContent tree using public api', [
        sClearEvents(),
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const tree = editor.getContent({ format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected filtered html', '<p>html</p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'setContent html', [
        sClearEvents(),
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(function () {
          EditorContent.setContent(editor, '<p>new html</p>');
        }),
        tinyApis.sAssertContent('<p>new html</p>'),
        sAssertEventsFiredInOrder([
          'beforesetcontent',
          'setcontent',
          'beforesetcontent',
          'setcontent',
          'beforegetcontent',
          'getcontent'
        ])
      ]),

      Log.stepsAsStep('TBA', 'setContent tree', [
        sClearEvents(),
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = EditorContent.getContent(editor, { format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));

          EditorContent.setContent(editor, '<p>new html</p>');
          Assertions.assertHtml('Should be expected html', '<p>new html</p>', <string> EditorContent.getContent(editor));

          EditorContent.setContent(editor, tree);
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', <string> EditorContent.getContent(editor));
        }),
        sAssertEventsFiredInOrder([
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
        ])
      ]),

      Log.stepsAsStep('TBA', 'setContent tree filtered', [
        sClearEvents(),
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          EditorContent.setContent(editor, getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', <string> EditorContent.getContent(editor));
        }),
        sAssertEventsFiredInOrder([
          'beforesetcontent',
          'setcontent',
          'beforesetcontent',
          'setcontent',
          'beforegetcontent',
          'getcontent'
        ])
      ]),

      Log.stepsAsStep('TBA', 'setContent tree using public api', [
        sClearEvents(),
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          editor.setContent(getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', <string> EditorContent.getContent(editor));
        }),
        sAssertEventsFiredInOrder([
          'beforesetcontent',
          'setcontent',
          'beforesetcontent',
          'setcontent',
          'beforegetcontent',
          'getcontent'
        ])
      ])
    ], onSuccess, onFailure);
    teardown();
  }, {
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    setup: (editor) => {
      editor.on('beforegetcontent getcontent beforesetcontent setcontent', logEvent);
    }
  }, success, failure);
});
