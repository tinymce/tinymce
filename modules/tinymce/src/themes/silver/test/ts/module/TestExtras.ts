import { Attachment, GuiFactory, DomFactory, Behaviour, Positioning, Gui } from '@ephox/alloy';
import { Fun } from '@ephox/katamari';
import { Body, Class } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';
import TestBackstage from './TestBackstage';
import Editor from 'tinymce/core/api/Editor';

export default () => {

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
  Class.add(uiMothership.element(), 'tox');

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
  Attachment.attachSystem(Body.body(), uiMothership);

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
    mockEditor
  };
};
