import { ApproxStructure, Log, Pipeline, RealKeys } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Unicode } from '@ephox/katamari';
import { TinyApis, TinyLoader, TinyUi } from '@ephox/mcagar';
import { PlatformDetection } from '@ephox/sand';
import NonbreakingPlugin from 'tinymce/plugins/nonbreaking/Plugin';
import VisualCharsPlugin from 'tinymce/plugins/visualchars/Plugin';
import theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('webdriver.tinymce.plugins.nonbreaking.NonbreakingVisualCharsTypingTest', (success, failure) => {
  // Note: Uses RealKeys, so needs a browser. Headless won't work.

  const detection = PlatformDetection.detect();

  // TODO TINY-4129: this currently fails on IE 11 and Edge 18 or above and needs to be investigated
  if (detection.browser.isIE() || detection.browser.isEdge()) {
    return success();
  }

  theme();
  NonbreakingPlugin();
  VisualCharsPlugin();

  const isIE = detection.browser.isIE();
  const getNbspText = (text: string) => {
    if (detection.browser.isFirefox()) {
      return Unicode.zeroWidth + text + ' ';
    } else if (isIE) {
      return text + ' ';
    } else {
      return Unicode.zeroWidth + text + Unicode.nbsp;
    }
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyUi = TinyUi(editor);
    const tinyApis = TinyApis(editor);

    Pipeline.async({}, [
      Log.stepsAsStep('TINY-3647', '1. NonBreaking: Click on the nbsp button then type some text, and assert content is correct', [
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(Unicode.zeroWidth + 'test'))
              ]
            })
          ]
        })))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '2. NonBreaking: Add text to editor, click on the nbsp button, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([ 0, 0 ], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(Unicode.zeroWidth))
              ]
            })
          ]
        })))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '3. NonBreaking: Add content to editor, click on the nbsp button then type some text, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([ 0, 0 ], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(isIE ? 'test' : Unicode.zeroWidth + 'test'))
              ]
            })
          ]
        })))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '4. NonBreaking: Click on the nbsp button then type a space, and assert content is correct', [
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text(' ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(getNbspText('')))
              ].concat(detection.browser.isFirefox() ? [ s.element('br', {}) ] : [])
            })
          ]
        })))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '5. NonBreaking: Add text to editor, click on the nbsp button and add content plus a space, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([ 0, 0 ], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(Unicode.zeroWidth))
              ]
            })
          ]
        }))),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(getNbspText('test')))
              ].concat(detection.browser.isFirefox() ? [ s.element('br', {}) ] : [])
            })
          ]
        })))
      ]),

      tinyApis.sSetContent(''), // reset content

      Log.stepsAsStep('TINY-3647', '6. NonBreaking: Add text to editor, click on the nbsp button and add content plus a space, repeat, and assert content is correct', [
        tinyApis.sSetContent('test'),
        tinyApis.sSetCursor([ 0, 0 ], 4),
        tinyUi.sClickOnToolbar('click on nbsp button', 'button[aria-label="Nonbreaking space"]'),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(Unicode.zeroWidth))
              ]
            })
          ]
        }))),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(getNbspText('test')))
              ].concat(detection.browser.isFirefox() ? [ s.element('br', {}) ] : [])
            })
          ]
        }))),
        RealKeys.sSendKeysOn(
          'iframe => body => p',
          [
            RealKeys.text('test ')
          ]
        ),
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str, arr) => s.element('body', {
          children: [
            s.element('p', {
              children: [
                s.text(str.is('test')),
                s.element('span', {
                  classes: [ arr.has('mce-nbsp-wrap'), arr.has('mce-nbsp') ],
                  children: [
                    s.text(str.is(Unicode.nbsp))
                  ]
                }),
                s.text(str.is(getNbspText('test test')))
              ].concat(detection.browser.isFirefox() ? [ s.element('br', {}) ] : [])
            })
          ]
        })))
      ])

    ], onSuccess, onFailure);
  }, {
    plugins: 'nonbreaking visualchars',
    toolbar: 'nonbreaking visualchars',
    visualchars_default_state: true,
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
