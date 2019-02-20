import TestProviders from './TestProviders';
import { UiFactoryBackstage } from '../../../main/ts/backstage/Backstage';
import { Result, Fun } from '@ephox/katamari';
import { Attachment, GuiFactory, DomFactory, Behaviour, Positioning, Gui } from '@ephox/alloy';
import { Body, Class } from '@ephox/sugar';
import { document } from '@ephox/dom-globals';

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

  const shared = {
    providers: TestProviders,
    interpreter: Fun.identity,
    getSink: () => Result.value(sink),
  };

  const backstage: UiFactoryBackstage = {
    shared
  };

  const extras = {
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
    shared,
    extras,
    destroy
  };
};