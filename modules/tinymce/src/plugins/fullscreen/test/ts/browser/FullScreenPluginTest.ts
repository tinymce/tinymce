import { Assertions, Chain, Log, NamedChain, Pipeline, UiFinder } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { Arr, Cell } from '@ephox/katamari';
import { ApiChains, Editor as McEditor } from '@ephox/mcagar';
import { Attribute, Classes, Css, Insert, Remove, Html, SelectorFind, SugarBody, SugarElement, SugarShadowDom } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

import FullscreenPlugin from 'tinymce/plugins/fullscreen/Plugin';
import LinkPlugin from 'tinymce/plugins/link/Plugin';
import SilverTheme from 'tinymce/themes/silver/Theme';

interface Config {
  label: string;
  setup: () => Chain<Record<string, any>, Record<string, any>>;
  cleanup: () => Chain<any, any>;
}

const getContentContainer = (editor: Editor) =>
  SugarShadowDom.getContentContainer(SugarShadowDom.getRootNode(SugarElement.fromDom(editor.getElement())));

const cCloseOnlyWindow = Chain.label(
  'Close window',
  Chain.fromChains([
    NamedChain.read('editor',
      Chain.op((editor: Editor) => {
        const dialogs = () => UiFinder.findAllIn(getContentContainer(editor), '[role="dialog"]');
        Assertions.assertEq('One window exists', 1, dialogs().length);
        editor.windowManager.close();
        Assertions.assertEq('No windows exist', 0, dialogs().length);
      })
    )
  ])
);

const cWaitForDialog = (ariaLabel: string) =>
  Chain.label(
    'Looking for dialog with an aria-label: ' + ariaLabel,
    Chain.fromChains([
      NamedChain.direct('editor', Chain.mapper(getContentContainer), 'contentContainer'),
      NamedChain.direct('contentContainer', UiFinder.cWaitFor('Waiting for dialog', '[role="dialog"]'), 'dialog'),
      NamedChain.read('dialog',
        Chain.op((dialog) => {
          if (Attribute.has(dialog, 'aria-labelledby')) {
            const labelledby = Attribute.get(dialog, 'aria-labelledby');
            const dialogLabel = SelectorFind.descendant<HTMLLabelElement>(dialog, '#' + labelledby).getOrDie('Could not find labelledby');
            Assertions.assertEq('Checking label text', ariaLabel, Html.get(dialogLabel));
          } else {
            throw new Error('Dialog did not have an aria-labelledby');
          }
        })
      )
    ])
  );

const cAssertHtmlAndBodyState = (label: string, shouldExist: boolean) => {
  const selector = shouldExist ? 'root:.tox-fullscreen' : 'root::not(.tox-fullscreen)';
  return Chain.label(
    `${label}: Body and Html should ${shouldExist ? '' : 'not'} have "tox-fullscreen" class`,
    Chain.fromChains([
      NamedChain.writeValue('docBody', SugarBody.body()),
      NamedChain.read('docBody', UiFinder.cFindIn(selector)),
      NamedChain.writeValue('docHTML', SugarElement.fromDom(document.documentElement)),
      NamedChain.read('docHTML', UiFinder.cFindIn(selector))
    ])
  );
};

const cAsssertEditorContainerAndSinkState = (label: string, shouldExist: boolean) =>
  Chain.label(
    `${label}: Editor container and sink should ${shouldExist ? '' : 'not'} have "tox-fullscreen" class and z-index`,
    Chain.fromChains([
      NamedChain.direct('editor', Chain.mapper((editor: Editor) => SugarElement.fromDom(editor.getContainer())), 'editorContainer'),
      NamedChain.read('editorContainer', UiFinder.cFindIn(shouldExist ? 'root:.tox-fullscreen' : 'root::not(.tox-fullscreen)')),
      NamedChain.read('editorContainer',
        Chain.op((container) => {
          Assertions.assertEq('Editor container z-index', shouldExist ? '1200' : 'auto', Css.get(container, 'z-index'));
        })
      ),
      NamedChain.direct('editor', Chain.mapper(getContentContainer), 'contentContainer'),
      NamedChain.direct('contentContainer', UiFinder.cFindIn('.tox-silver-sink.tox-tinymce-aux'), 'sink'),
      NamedChain.read('sink',
        Chain.op((sink) => {
          Assertions.assertEq('Editor sink z-index', shouldExist ? '1201' : '1300', Css.get(sink, 'z-index'));
        })
      )
    ])
  );

const cAssertShadowHostState = (label: string, shouldExist: boolean) =>
  Chain.label(
    `${label}: Shadow host should ${shouldExist ? '' : 'not'} have "tox-fullscreen" and "tox-shadowhost" classes and z-index`,
    NamedChain.read('editor',
      Chain.op((editor: Editor) => {
        if (SugarShadowDom.isInShadowRoot(SugarElement.fromDom(editor.getElement()))) {
          const host = SugarShadowDom.getShadowRoot(SugarElement.fromDom(editor.getElement()))
            .map(SugarShadowDom.getShadowHost)
            .getOrDie('Expected shadow host');

          Assertions.assertEq('Shadow host classes', shouldExist, Classes.hasAll(host, [ 'tox-fullscreen', 'tox-shadowhost' ]));
          Assertions.assertEq('Shadow host z-index', shouldExist ? '1200' : 'auto', Css.get(host, 'z-index'));
        }
      })
    )
  );

const cAssertPageState = (label: string, shouldExist: boolean) =>
  Chain.fromChains([
    cAssertHtmlAndBodyState(label, shouldExist),
    cAsssertEditorContainerAndSinkState(label, shouldExist),
    cAssertShadowHostState(label, shouldExist)
  ]);

UnitTest.asynctest('browser.tinymce.plugins.fullscreen.FullScreenPluginTest', (success, failure) => {
  LinkPlugin();
  FullscreenPlugin();
  SilverTheme();

  const lastEventArgs = Cell(null);

  const cAssertApiAndLastEvent = (label: string, state: boolean) =>
    Chain.label(
      `${label}: fullscreen API and event state should return ${state}`,
      Chain.fromChains([
        NamedChain.read('editor', Chain.op((editor) => {
          Assertions.assertEq('Editor isFullscreen', state, editor.plugins.fullscreen.isFullscreen());
        })),
        Chain.op(() => Assertions.assertEq('FullscreenStateChanged event', state, lastEventArgs.get().state))
      ])
    );

  const settings = {
    plugins: 'fullscreen link',
    theme: 'silver',
    base_url: '/project/tinymce/js/tinymce',
    setup: (editor: Editor) => {
      lastEventArgs.set(null);
      editor.on('FullscreenStateChanged', (e: Editor) => {
        lastEventArgs.set(e);
      });
    }
  };

  const standardConfig: Config = {
    label: 'Standard',
    setup: () => NamedChain.write('editor', McEditor.cFromSettings(settings)),
    cleanup: () => NamedChain.read('editor', McEditor.cRemove)
  };

  const shadowRootConfig: Config = {
    label: 'ShadowHost',
    setup: () => {
      const shadowHost = SugarElement.fromTag('div');
      Insert.append(SugarBody.body(), shadowHost);
      const sr = SugarElement.fromDom(shadowHost.dom.attachShadow({ mode: 'open' }));
      const editorDiv = SugarElement.fromTag('div');
      Insert.append(sr, editorDiv);
      return Chain.fromChains([
        NamedChain.writeValue('shadowHost', shadowHost),
        NamedChain.write('editor', McEditor.cFromElement(editorDiv, settings))
      ]);
    },
    cleanup: () => Chain.fromChains([
      NamedChain.read('editor', McEditor.cRemove),
      NamedChain.read('shadowHost', Chain.op(Remove.remove))
    ])
  };

  const configs = [ standardConfig, ...SugarShadowDom.isSupported() ? [ shadowRootConfig ] : [] ];

  const steps = Arr.bind(configs, (config) => {
    const { label, setup, cleanup } = config;
    return [
      Log.chainsAsStep('TBA', `FullScreen (${label}): Toggle fullscreen on, open link dialog, insert link, close dialog and toggle fullscreen off`, [
        NamedChain.asChain([
          setup(),
          cAssertPageState('Before fullscreen command', false),
          NamedChain.read('editor', ApiChains.cExecCommand('mceFullScreen', true)),
          cAssertApiAndLastEvent('After fullscreen command', true),
          cAssertPageState('After fullscreen command', true),
          NamedChain.read('editor', ApiChains.cExecCommand('mceLink', true)),
          cWaitForDialog('Insert/Edit Link'),
          cCloseOnlyWindow,
          cAssertPageState('After window is closed', true),
          NamedChain.read('editor', ApiChains.cExecCommand('mceFullScreen')),
          cAssertApiAndLastEvent('After fullscreen toggled', false),
          cAssertPageState('After fullscreen toggled', false),
          cleanup()
        ])
      ]),
      Log.chainsAsStep('TBA', `FullScreen (${label}): Toggle fullscreen and cleanup editor should clean up classes`, [
        NamedChain.asChain([
          setup(),
          NamedChain.read('editor', ApiChains.cExecCommand('mceFullScreen', true)),
          cAssertApiAndLastEvent('After fullscreen command', true),
          cAssertPageState('After fullscreen command', true),
          cleanup(),
          cAssertHtmlAndBodyState('After editor is closed', false)
        ])
      ])
    ];
  });

  Pipeline.async({}, steps, success, failure);
});
