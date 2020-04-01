import { Log, Pipeline, ApproxStructure } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyApis, TinyLoader } from '@ephox/mcagar';
import { ImageData } from 'tinymce/plugins/image/core/ImageData';
import Plugin from 'tinymce/plugins/image/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('browser.tinymce.plugins.image.api.CommandsTest', (success, failure) => {
  SilverTheme();
  Plugin();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const api = TinyApis(editor);

    const sUpdateImage = (data: Partial<ImageData>) => api.sExecCommand('mceUpdateImage', data);

    Pipeline.async({}, [
      Log.stepsAsStep('TBA', 'Insert image with all data specified except caption and isDecorative', [
        api.sSetContent('<p>a</a>'),
        api.sSetCursor([ 0, 0 ], 1),
        sUpdateImage({
          src: '#2',
          alt: 'alt',
          title: 'title',
          width: '100',
          height: '200',
          class: 'cls1',
          style: 'color: red',
          caption: false,
          hspace: '1',
          vspace: '2',
          border: '3',
          borderStyle: 'solid',
          isDecorative: false
        }),
        api.sSetCursor([ 0, 0 ], 1),
        api.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.text(str.is('a')),
                  s.element('img', {
                    attrs: {
                      class: str.is('cls1'),
                      title: str.is('title'),
                      src: str.is('#2'),
                      alt: str.is('alt'),
                      width: str.is('100'),
                      height: str.is('200')
                    },
                    styles: {
                      'color': str.is('red'),
                      'border-width': str.is('3px'),
                      'border-style': str.is('solid'),
                      'margin': str.is('2px 1px')
                    }
                  }),
                ]
              })
            ]
          }))
        )
      ]),
      Log.stepsAsStep('TBA', 'Update image with all data specified except caption and isDecorative', [
        api.sSetContent('<p><img src="#1" /></p>'),
        api.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sUpdateImage({
          src: '#2',
          alt: 'alt',
          title: 'title',
          width: '100',
          height: '200',
          class: 'cls1',
          style: 'color: red',
          caption: false,
          hspace: '1',
          vspace: '2',
          border: '3',
          borderStyle: 'solid',
          isDecorative: false
        }),
        api.sSetCursor([ 0 ], 1),
        api.sAssertContentStructure(
          ApproxStructure.build((s, str, _arr) => s.element('body', {
            children: [
              s.element('p', {
                children: [
                  s.element('img', {
                    attrs: {
                      class: str.is('cls1'),
                      title: str.is('title'),
                      src: str.is('#2'),
                      alt: str.is('alt'),
                      width: str.is('100'),
                      height: str.is('200')
                    },
                    styles: {
                      'color': str.is('red'),
                      'border-width': str.is('3px'),
                      'border-style': str.is('solid'),
                      'margin': str.is('2px 1px')
                    }
                  }),
                ]
              })
            ]
          }))
        )
      ]),
      Log.stepsAsStep('TBA', 'Update image with null alt value', [
        api.sSetContent('<p><img src="#1" alt="alt1" /></p>'),
        api.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sUpdateImage({
          alt: null
        }),
        api.sAssertContent('<p><img src="#1" /></p>')
      ]),
      Log.stepsAsStep('TBA', 'Update image with empty alt value', [
        api.sSetContent('<p><img src="#1" alt="alt1" /></p>'),
        api.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sUpdateImage({
          alt: ''
        }),
        api.sAssertContent('<p><img src="#1" alt="" /></p>')
      ]),
      Log.stepsAsStep('TBA', 'Update image with empty title, width, height should not produce empty attributes', [
        api.sSetContent('<p><img src="#1" title="title" width="100" height="200" /></p>'),
        api.sSetSelection([ 0 ], 0, [ 0 ], 1),
        sUpdateImage({
          title: '',
          width: '',
          height: ''
        }),
        api.sAssertContent('<p><img src="#1" /></p>')
      ]),
    ], onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'image',
    toolbar: 'image',
    indent: false,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
