import { Assertions, Log, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import AstNode from 'tinymce/core/api/html/Node';
import HtmlSerializer from 'tinymce/core/api/html/Serializer';
import { EditorEvent } from 'tinymce/core/api/util/EventDispatcher';

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

  const defaultExpectedEvents = [
    'beforesetcontent',
    'setcontent',
    'beforegetcontent',
    'getcontent'
  ];
  const sAssertEventsFiredInOrder = (expectedEvents: string[] = defaultExpectedEvents) => Step.sync(() => {
    Assertions.assertEq('Get content events should have been fired', expectedEvents, events);
  });
  const sClearEvents = Step.sync(() => events = []);

  TinyLoader.setupLight(function (editor, onSuccess, onFailure) {
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'getContent html', [
        sClearEvents,
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(() => {
          const html = editor.getContent();
          Assertions.assertHtml('Should be expected html', '<p>html</p>', html);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent html with empty editor', [
        sClearEvents,
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const html = editor.getContent();
          Assertions.assertHtml('Should be expected html', '', html);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent text', [
        sClearEvents,
        tinyApis.sSetContent('<p>Text to be retrieved</p>'),
        Step.sync(() => {
          const text = editor.getContent({ format: 'text' });
          Assertions.assertHtml('Should be expected text', 'Text to be retrieved', text);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent text with empty editor', [
        sClearEvents,
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const text = editor.getContent({ format: 'text' });
          Assertions.assertHtml('Should be expected text', '', text);
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'getContent tree', [
        sClearEvents,
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = editor.getContent({ format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TINY-6281', 'getContent tree with empty editor', [
        sClearEvents,
        tinyApis.sSetContent(''),
        Step.sync(() => {
          const tree = editor.getContent({ format: 'tree' }) as AstNode;
          // bogus br that sits in an empty editor is replaced with a &nbsp; by the html parser, hence the space
          Assertions.assertHtml('Should be expected tree html', '<p> </p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'getContent tree filtered', [
        sClearEvents,
        Step.sync(() => {
          editor.setContent('<p><font size="7">x</font></p>', { format: 'raw' });
          const tree = editor.getContent({ format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree filtered html', '<p><span style="font-size: 300%;">x</span></p>', toHtml(tree));
        }),
        sAssertEventsFiredInOrder()
      ]),

      Log.stepsAsStep('TBA', 'setContent html', [
        sClearEvents,
        tinyApis.sSetContent('<p>html</p>'),
        Step.sync(function () {
          editor.setContent('<p>new html</p>');
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
        sClearEvents,
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          const tree = editor.getContent({ format: 'tree' }) as AstNode;
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', toHtml(tree));

          editor.setContent('<p>new html</p>');
          Assertions.assertHtml('Should be expected html', '<p>new html</p>', editor.getContent());

          editor.setContent(tree);
          Assertions.assertHtml('Should be expected tree html', '<p>tree</p>', editor.getContent());
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
        sClearEvents,
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          editor.setContent(getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', editor.getContent());
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
        sClearEvents,
        tinyApis.sSetContent('<p>tree</p>'),
        Step.sync(() => {
          editor.setContent(getFontTree());
          Assertions.assertHtml('Should be expected filtered html', '<span style="font-size: 300%;">x</span>', editor.getContent());
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
  }, {
    base_url: '/project/tinymce/js/tinymce',
    inline: true,
    setup: (editor) => {
      editor.on('beforegetcontent getcontent beforesetcontent setcontent', logEvent);
    }
  }, success, failure);
});
