import { GeneralSteps, Keys, Log, Pipeline, Step } from '@ephox/agar';
import { Assert, UnitTest } from '@ephox/bedrock-client';
import { TinyActions, TinyApis, TinyLoader } from '@ephox/mcagar';
import Env from 'tinymce/core/api/Env';
import * as CaretContainer from 'tinymce/core/caret/CaretContainer';
import * as NodeType from 'tinymce/core/dom/NodeType';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.core.keyboard.MediaNavigationTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyActions = TinyActions(editor);

    const sAssertStartContainer = (f: (node: Node) => boolean) => Step.sync(() => {
      const startContainer = editor.selection.getRng().startContainer;
      Assert.eq('Check selection is in caret container', true, f(startContainer));
    });

    const sAssertNode = (f: (node: Node) => boolean) => Step.sync(() => {
      const node = editor.selection.getNode();
      Assert.eq('Check selection is node', true, f(node));
    });

    const sTestMedia = (type: string, content: string) => GeneralSteps.sequence([
      Log.stepsAsStep('TINY-4211', `left/right over ${type} element`, [
        tinyApis.sSetContent(content),
        tinyApis.sSelect(type, []),

        tinyActions.sContentKeystroke(Keys.left()),
        tinyApis.sAssertContent(`<p>${content}</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyActions.sContentKeystroke(Keys.right()),
        tinyApis.sAssertContent(`<p>${content}</p>`),
        sAssertNode((node) => node.nodeName.toLowerCase() === type),

        tinyActions.sContentKeystroke(Keys.right()),
        tinyApis.sAssertContent(`<p>${content}</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline)
      ]),
      Log.stepsAsStep('TINY-4211', `up/down over ${type} element`, [
        tinyApis.sSetContent(`<p>a</p><p>${content}</p><p>b</p>`),
        tinyApis.sSetCursor([ 0, 0 ], 1),

        tinyActions.sContentKeystroke(Keys.down()),
        tinyApis.sAssertContent(`<p>a</p><p>${content}</p><p>b</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyActions.sContentKeystroke(Keys.down()),
        tinyApis.sAssertContent(`<p>a</p><p>${content}</p><p>b</p>`),
        sAssertNode((node) => NodeType.isElement(node) && node.innerHTML === 'b'),

        tinyActions.sContentKeystroke(Keys.up()),
        tinyApis.sAssertContent(`<p>a</p><p>${content}</p><p>b</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyActions.sContentKeystroke(Keys.up()),
        tinyApis.sAssertContent(`<p>a</p><p>${content}</p><p>b</p>`),
        sAssertNode((node) => NodeType.isElement(node) && node.innerHTML === 'a')
      ]),
      Log.stepsAsStep('TINY-4211', `up/down/home/end at start/end of single line`, [
        tinyApis.sSetContent(`<p>a${content}</p>`),
        tinyApis.sSetCursor([ 0, 0 ], 0),
        tinyActions.sContentKeystroke(Keys.down()),
        tinyApis.sAssertContent(`<p>a${content}</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyApis.sSetCursor([ 0, 0 ], 0),
        tinyActions.sContentKeystroke(Keys.end()),
        tinyApis.sAssertContent(`<p>a${content}</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyApis.sSetContent(`<p>${content}a</p>`),
        tinyApis.sSetCursor([ 0, 2 ], 1),
        tinyActions.sContentKeystroke(Keys.up()),
        tinyApis.sAssertContent(`<p>${content}a</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline),

        tinyApis.sSetCursor([ 0, 2 ], 1),
        tinyActions.sContentKeystroke(Keys.home()),
        tinyApis.sAssertContent(`<p>${content}a</p>`),
        sAssertStartContainer(CaretContainer.isCaretContainerInline)
      ])
    ]);

    // Firefox won't render without a valid embed/object
    const optionalTests = Env.browser.isFirefox() ? [ ] : [
      sTestMedia('embed', '<embed src="custom/video.mp4" />'),
      sTestMedia('object', '<object data="custom/file.pdf"></object>')
    ];

    Pipeline.async({}, [
      tinyApis.sFocus(),
      sTestMedia('video', '<video controls="controls"><source src="custom/video.mp4" /></video>'),
      sTestMedia('audio', '<audio controls="controls"><source src="custom/audio.mp3" /></audio>'),
      ...optionalTests
    ], onSuccess, onFailure);
  }, {
    height: 400,
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
