// import { ApproxStructure, Assertions, FocusTools, RealMouse, UiFinder } from '@ephox/agar';
import { RealMouse, UiFinder } from '@ephox/agar';
import { Assert, describe, it } from '@ephox/bedrock-client';
// import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
// import { Arr } from '@ephox/katamari';
// import { SugarBody } from '@ephox/sugar';
import { McEditor } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

describe('browser.tinymce.themes.silver.editor.core.SimpleControlsInlineTests', () => {
  const settings = {
    inline: true,
    base_url: '/project/tinymce/js/tinymce'
  };

  it('TINY-8594: Toolbar is rendered synchrously when switching between editors', async () => {
    const editorOne = await McEditor.pFromHtml<Editor>('<div><p id="number1"><strong>Editor one</strong></p></div>', settings);
    const editorTwo = await McEditor.pFromHtml<Editor>('<div><p id="number2"><strong>Editor two</strong></p></div>', settings);

    await RealMouse.pClickOn('#number1');
    // FocusTools.setFocus(SugarBody.body(), "#number1");

    let inlineToolbars = UiFinder.findAllIn(SugarBody.body(), '.tox-tinymce-inline');
    Assert.eq('The inline toolbar of first editor', inlineToolbars[0].dom.attributes.getNamedItem('style').value.includes('display: flex'), true);
    // Arr.each(inlineToolbars, (item) => {
    //   console.log('inlinetoolbars', item.dom.attributes.getNamedItem('style').value.includes('display:  flex'));
    // });
    // Assertions.assertStructure('Assert inline toolbar for the first editor is rendered', ApproxStructure.build((s, str, arr) =>
    //   s.element('div', {
    //     classes: [
    //       arr.has('tox-tinymce-inline')
    //     ],
    //     styles: {
    //       display: str.contains('flex')
    //     }
    //   })
    // ), TinyDom.container(editorOne));
    await RealMouse.pClickOn('#number2');
    // FocusTools.setFocus(SugarBody.body(), "#number2");
    inlineToolbars = UiFinder.findAllIn(SugarBody.body(), '.tox-tinymce-inline');
    Assert.eq('The inline toolbar of first editor', inlineToolbars[0].dom.attributes.getNamedItem('style').value.includes('display: none'), true);
    Assert.eq('The inline toolbar of second editor', inlineToolbars[1].dom.attributes.getNamedItem('style').value.includes('display: flex'), true);
    // Assertions.assertStructure('Assert inline toolbar for the second editor is rendered', ApproxStructure.build((s, str, arr) =>
    //   s.element('div', {
    //     classes: [
    //       arr.has('tox-tinymce-inline')
    //     ],
    //     styles: {
    //       display: str.contains('flex')
    //     }
    //   })
    // ), TinyDom.container(editorTwo));
    // Assertions.assertStructure('Assert inline toolbar for the first editor is hidden', ApproxStructure.build((s, str, arr) =>
    //   s.element('div', {
    //     classes: [
    //       arr.has('tox-tinymce-inline')
    //     ],
    //     styles: {
    //       display: str.contains('none')
    //     }
    //   })
    // ), TinyDom.container(editorOne));
    // await UiFinder.pWaitFor('Waited for context toolbar', SugarBody.body(), '.tox-tinymce-inline');
    // Arr.each(inlineToolbars, (item) => {
    //   console.log('inlinetoolbars', item.dom.attributes.getNamedItem('style').value.indexOf('display: flex'));
    // });
    // await RealMouse.pClickOn('#number2');
    // Assertions.assertPresence('Check that the inline toolbar exists', { 'display: none': 1 }, SugarBody.body());
    McEditor.remove(editorOne);
    McEditor.remove(editorTwo);
  });
});
