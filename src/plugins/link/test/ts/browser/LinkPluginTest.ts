import { ApproxStructure, Assertions, Chain, GeneralSteps, Log, Pipeline, Step, Waiter } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock';
import { Arr, Merger } from '@ephox/katamari';
import { TinyLoader, TinyApis, TinyUi } from '@ephox/mcagar';

import { Editor } from 'tinymce/core/api/Editor';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import Theme from 'tinymce/themes/silver/Theme';
import { TestLinkUi } from 'src/plugins/link/test/ts/module/TestLinkUi';

UnitTest.asynctest('browser.tinymce.plugins.link.LinkPluginTest', (success, failure) => {
  Theme();
  LinkPlugin();

  const nonRelativeRegex = /^\w+:/i;

  const emptyData = {
    url: {
      value: ''
    },
    text: '',
    title: '',
    target: ''
  };

  const getFrontmostDialog = (editor: Editor) => {
    const windows = editor.windowManager.getWindows();
    return windows[ windows.length - 1 ];
  };

  const sFillAndSubmitDialog = (editor: Editor, data) => {
    return GeneralSteps.sequence([
      Step.sync(() => {
        getFrontmostDialog(editor).setData(data);
      }),
      TestLinkUi.sClickSave
    ]);
  };

  const sTeardown = (editor: Editor) => {
    return Step.sync(() => {
      delete editor.settings.file_browser_callback;
      delete editor.settings.link_list;
      delete editor.settings.link_class_list;
      delete editor.settings.link_target_list;
      delete editor.settings.rel_list;

      const win = getFrontmostDialog(editor);
      if (win) {
        win.close();
      }
    });
  };

  const appendTeardown = (editor, steps) => {
    return Arr.bind(steps, (step) => {
      return [step, sTeardown(editor)];
    });
  };

  TinyLoader.setup((editor, onSuccess, onFailure) => {
    const tinyApis = TinyApis(editor);
    const tinyUi = TinyUi(editor);

    const sWaitForDialog = () => {
      return tinyUi.sWaitForPopup('Waiting for link dialog to show', '[role="dialog"]');
    };

    const sAssertContentStructure = (structure) => {
      return Waiter.sTryUntil(
        'Waiting for content to have expected structure',
        tinyApis.sAssertContentStructure(ApproxStructure.build((s, str) => {
          return s.element('body', {
            children: structure(s, str)
          });
        })), 100, 1000);
    };

    const sAssertDialogData = (data) => {
      return Chain.asStep({}, [
        Chain.mapper(() => {
          const data = getFrontmostDialog(editor).getData();
          delete data.url.meta;
          return data;
        }),
        Assertions.cAssertEq('Link dialog data should match', data)
      ]);
    };

    const steps = [
      Log.stepsAsStep('TBA', 'Default link dialog on empty editor', [
        tinyApis.sSetContent(''),
        tinyApis.sExecCommand('mceLink'),
        sWaitForDialog(),
        sAssertDialogData(emptyData),
        sFillAndSubmitDialog(editor, {
          url: { value: 'href' },
          target: '_blank',
          text: 'text',
          title: 'title'
        }),
        sAssertContentStructure((s, str) => {
          return [
            s.element('p', {
              children: [
                s.element('a', {
                  attrs: {
                    title: str.is('title'),
                    href: str.is('href'),
                    target: str.is('_blank'),
                    rel: str.is('noopener')
                  },
                  children: [
                    s.text(str.is('text'))
                  ]
                })
              ]
            })
          ];
        })
      ]),
      Log.stepsAsStep('TBA', 'Default link dialog on text selection', [
        tinyApis.sSetContent('<p>abc</p>'),
        tinyApis.sSetSelection([0, 0], 1, [0, 0], 2),
        tinyApis.sExecCommand('mceLink'),
        sWaitForDialog(),
        sAssertDialogData(Merger.merge(emptyData, { text: 'b' })),
        sFillAndSubmitDialog(editor, {
          url: { value: 'href' },
          target: '_blank',
          title: 'title'
        }),
        sAssertContentStructure((s, str) => {
          return [
            s.element('p', {
              children: [
                s.text(str.is('a')),
                s.element('a', {
                  attrs: {
                    title: str.is('title'),
                    href: str.is('href'),
                    target: str.is('_blank'),
                    rel: str.is('noopener')
                  },
                  children: [
                    s.text(str.is('b'))
                  ]
                }),
                s.text(str.is('c'))
              ]
            })
          ];
        })
      ]),
      Log.stepsAsStep('TBA', 'Default link dialog on non pure text selection', [
        tinyApis.sSetContent('<p>a</p><p>bc</p>'),
        tinyApis.sSetSelection([0, 0], 0, [1, 0], 2),
        tinyApis.sExecCommand('mceLink'),
        sWaitForDialog(),
        sAssertDialogData({
          url: {
            value: ''
          },
          title: '',
          target: ''
        }),
        sFillAndSubmitDialog(editor, {
          url: { value: 'href' },
          target: '_blank',
          title: 'title'
        }),
        sAssertContentStructure((s, str) => {
          return [
            s.element('p', {
              children: [
                s.element('a', {
                  attrs: {
                    title: str.is('title'),
                    href: str.is('href'),
                    target: str.is('_blank'),
                    rel: str.is('noopener')
                  },
                  children: [
                    s.text(str.is('a'))
                  ]
                })
              ]
            }),
            s.element('p', {
              children: [
                s.element('a', {
                  attrs: {
                    title: str.is('title'),
                    href: str.is('href'),
                    target: str.is('_blank'),
                    rel: str.is('noopener')
                  },
                  children: [
                    s.text(str.is('bc'))
                  ]
                })
              ]
            })
          ];
        })
      ]),
      Log.stepsAsStep('TBA', 'All lists link dialog on empty editor', [
        tinyApis.sSetSetting('link_list', [
          { title: 'link1', value: 'link1' },
          { title: 'link2', value: 'link2' }
        ]),
        tinyApis.sSetSetting('link_class_list', [
          { title: 'class1', value: 'class1' },
          { title: 'class2', value: 'class2' }
        ]),
        tinyApis.sSetSetting('target_list', [
          { title: 'target1', value: 'target1' },
          { title: 'target2', value: 'target2' }
        ]),
        tinyApis.sSetSetting('rel_list', [
          { title: 'rel1', value: 'rel1' },
          { title: 'rel2', value: 'rel2' }
        ]),
        tinyApis.sSetContent(''),
        tinyApis.sExecCommand('mceLink'),
        sWaitForDialog(),
        sAssertDialogData(Merger.merge(emptyData, {
          classz: 'class1',
          target: 'target1',
          rel: 'rel1',
          link: 'link1'
        })),
        sFillAndSubmitDialog(editor, {
          url: { value: 'href' },
          title: 'title',
          text: 'text'
        }),
        sAssertContentStructure((s, str) => {
          return [
            s.element('p', {
              children: [
                s.element('a', {
                  attrs: {
                    class: str.is('class1'),
                    title: str.is('title'),
                    href: str.is('href'),
                    target: str.is('target1'),
                    rel: str.is('rel1')
                  },
                  children: [
                    s.text(str.is('text'))
                  ]
                }),
              ]
            })
          ];
        })
      ]),
      // Since there's no capability to use the confirm dialog with unit tests, simply test the regex we're using,
      Log.stepsAsStep('TBA', 'Test new regex for non relative link setting ftp', [
        Assertions.sAssertEq('', true, nonRelativeRegex.test('ftp://testftp.com'))
      ]),
      Log.stepsAsStep('TBA', 'Test new regex for non relative link setting http', [
        Assertions.sAssertEq('', true, nonRelativeRegex.test('http://testhttp.com'))
      ]),
      Log.stepsAsStep('TBA', 'Test new regex for non relative link setting relative', [
        Assertions.sAssertEq('', false, nonRelativeRegex.test('testhttp.com'))
      ]),
      Log.stepsAsStep('TBA', 'Test new regex for non relative link setting relative base', [
        Assertions.sAssertEq('', false, nonRelativeRegex.test('/testjpg.jpg'))
      ])
    ];

    Pipeline.async({}, [tinyApis.sFocus].concat(appendTeardown(editor, steps)), onSuccess, onFailure);
  }, {
    theme: 'silver',
    plugins: 'link',
    toolbar: 'link',
    skin_url: '/project/js/tinymce/skins/oxide'
  }, success, failure);
});
