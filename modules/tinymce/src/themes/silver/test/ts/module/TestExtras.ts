import { Attachment, Behaviour, DomFactory, Gui, GuiFactory, Positioning } from '@ephox/alloy';
import { after, before } from '@ephox/bedrock-client';
import { Fun, Obj, Optional } from '@ephox/katamari';
import { Class, SugarBody, SugarElement } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';
import { UiFactoryBackstage, UiFactoryBackstageShared } from 'tinymce/themes/silver/backstage/Backstage';

import TestBackstage from './TestBackstage';

export interface TestExtras {
  readonly backstage: UiFactoryBackstage;
  readonly shared: UiFactoryBackstageShared;
  readonly extras: {
    readonly editor: Editor;
    readonly backstage: UiFactoryBackstage;
  };
  readonly destroy: () => void;
  readonly uiMothership: Gui.GuiSystem;
  readonly mockEditor: Editor;
  readonly sink: SugarElement<HTMLDivElement>;
}

interface BddTestExtras {
  readonly backstage: () => UiFactoryBackstage;
  readonly shared: () => UiFactoryBackstageShared;
  readonly extras: () => {
    readonly editor: Editor;
    readonly backstage: UiFactoryBackstage;
  };
  readonly uiMothership: () => Gui.GuiSystem;
  readonly mockEditor: () => Editor;
  readonly sink: () => SugarElement<HTMLDivElement>;
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

  const backstage = TestBackstage(sink);
  const settings = {};

  const mockEditor = {
    setContent: (_content) => {},
    insertContent: (_content: string, _args?: any) => {},
    execCommand: (_cmd: string, _ui?: boolean, _value?: any) => {},
    getParam: (name: string, defaultVal?: any, _type?: string) => settings[name] || defaultVal
  } as Editor;

  const extras = {
    editor: mockEditor,
    backstage
  };

  uiMothership.add(sink);
  Attachment.attachSystem(SugarBody.body(), uiMothership);

  const destroy = () => {
    uiMothership.remove(sink);
    uiMothership.destroy();
  };

  return {
    backstage,
    shared: backstage.shared,
    extras,
    destroy,
    uiMothership,
    mockEditor,
    sink: sink.element
  };
};

export const bddSetup = (): BddTestExtras => {
  let helpers: Optional<TestExtras> = Optional.none();

  before(() => {
    helpers = Optional.some(TestExtras());
  });

  after(() => {
    helpers.each((h) => h.destroy());
    helpers = Optional.none();
  });

  const get = <K extends keyof BddTestExtras>(name: K) => (): TestExtras[K] => helpers
    .bind((h) => Obj.get(h, name))
    .getOrDie('The setup hooks have not run yet');

  return {
    backstage: get('backstage'),
    shared: get('shared'),
    extras: get('extras'),
    uiMothership: get('uiMothership'),
    mockEditor: get('mockEditor'),
    sink: get('sink')
  };
};

export default TestExtras;
