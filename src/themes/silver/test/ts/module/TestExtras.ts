import { Attachment, GuiFactory, DomFactory, Behaviour, Positioning, Gui } from '@ephox/alloy';
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
        useFixed: true
      })
    ])
  });

  const uiMothership = Gui.create();
  Class.add(uiMothership.element(), 'tox');

  const backstage = TestBackstage(sink);

  const mockEditor = {
    setContent: (content) => {},
    insertContent: (content: string, args?: any) => {},
    execCommand: (cmd: string, ui?: boolean, value?: any) => {}
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