import { Attachment, Behaviour, DomFactory, Gui, GuiFactory, Positioning } from '@ephox/alloy';
import { after, afterEach, before } from '@ephox/bedrock-client';
import { Fun, Optional } from '@ephox/katamari';
import { Class, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstagePair } from 'tinymce/themes/silver/backstage/Backstage';

import TestBackstage from './TestBackstage';

export interface TestExtras {
  readonly extras: {
    readonly editor: Editor;
    readonly backstages: UiFactoryBackstagePair;
  };
  readonly destroy: () => void;
  readonly mockEditor: Editor;
  readonly getPopupSink: () => SugarElement<HTMLElement>;
  readonly getPopupMothership: () => Gui.GuiSystem;
  readonly getDialogSink: () => SugarElement<HTMLElement>;
}

interface BddTestExtrasHook {
  readonly access: () => TestExtras;
}

export const TestExtras = (): TestExtras => {

  const oldSink = document.querySelectorAll('.mce-silver-sink');
  if (oldSink.length > 0) {
    throw Error('old sinks found, a previous test did not call helpers.destroy() leaving artifacts, found: ' + oldSink.length);
  }

  const sink = GuiFactory.build({
    dom: DomFactory.fromHtml('<div class="mce-silver-sink"></div>'),
    behaviours: Behaviour.derive([
      Positioning.config({
        useFixed: Fun.always
      })
    ])
  });

  const uiMothership = Gui.create();
  Class.add(uiMothership.element, 'tox');

  const backstages = {
    popup: TestBackstage(sink),
    dialog: TestBackstage(sink)
  };
  const options: Record<string, any> = {};

  const mockEditor = {
    setContent: (_content) => {},
    insertContent: (_content: string, _args?: any) => {},
    execCommand: (_cmd: string, _ui?: boolean, _value?: any) => {},
    ui: {
      show: Fun.noop
    },
    options: {
      get: (name: string) => options[name]
    }
  } as Editor;

  const extras = {
    editor: mockEditor,
    backstages
  };

  uiMothership.add(sink);
  Attachment.attachSystem(SugarBody.body(), uiMothership);

  const getPopupSink = () => sink.element;
  const getDialogSink = () => sink.element;
  const getPopupMothership = Fun.constant(uiMothership);

  const destroy = () => {
    uiMothership.remove(sink);
    uiMothership.destroy();
  };

  return {
    extras,
    destroy,
    mockEditor,
    getPopupSink,
    getDialogSink,
    getPopupMothership
  };
};

export const bddSetup = (): BddTestExtrasHook => {
  let helpers: Optional<TestExtras> = Optional.none();
  let hasFailure = false;

  before(() => {
    helpers = Optional.some(TestExtras());
  });

  afterEach(function () {
    if (this.currentTest?.isFailed() === true) {
      hasFailure = true;
    }
  });

  after(() => {
    if (!hasFailure) {
      helpers.each((h) => h.destroy());
      helpers = Optional.none();
    }
  });

  const access = (): TestExtras => helpers.getOrDie(
    'The setup hooks have not run yet'
  );

  return {
    access
  };
};
