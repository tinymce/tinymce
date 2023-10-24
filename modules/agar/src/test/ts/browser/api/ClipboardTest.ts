import { after, Assert, before, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { DomEvent, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { copy, cut, pasteDataTransfer, pasteFiles, pasteItems } from 'ephox/agar/api/Clipboard';
import { createFileFromString } from 'ephox/agar/api/Files';

describe('ClipboardTest', () => {
  const pasteState = Singleton.value<DataTransfer>();
  const pastebinState = Singleton.value<SugarElement<HTMLElement>>();
  const unbinderState = Singleton.value<() => void>();

  before(() => {
    pastebinState.set(SugarElement.fromHtml('<div class="pastebin"></div>'));
    pastebinState.on((pastebin) => {
      Insert.append(SugarBody.body(), pastebin);

      const cutUnbinder = DomEvent.bind(pastebin, 'cut', (evt) => {
        const dataTransfer = evt.raw.clipboardData;
        dataTransfer.clearData();
        dataTransfer.setData('text/plain', 'cut-data');
      });

      const copyUnbinder = DomEvent.bind(pastebin, 'copy', (evt) => {
        const dataTransfer = evt.raw.clipboardData;
        dataTransfer.clearData();
        dataTransfer.setData('text/plain', 'copy-data');
      });

      const pasteUnbinder = DomEvent.bind(pastebin, 'paste', (evt) => {
        const dataTransfer = evt.raw.clipboardData;
        pasteState.set(dataTransfer);
      });

      unbinderState.set(() => {
        cutUnbinder.unbind();
        copyUnbinder.unbind();
        pasteUnbinder.unbind();
      });
    });
  });

  after(() => {
    pastebinState.on(Remove.remove);
    pastebinState.clear();
    unbinderState.on((unbind) => unbind());
    unbinderState.clear();
  });

  it('Paste text and html items', () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    pasteItems(pastebin, {
      'text/plain': 'Hello world!',
      'text/html': '<b>Hello world!</b>'
    });

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    Assert.eq('Should be expected plain text', 'Hello world!', dataTransfer.getData('text/plain'));
    Assert.eq('Should be expected html', '<b>Hello world!</b>', dataTransfer.getData('text/html'));
  });

  it('Paste text and html files', () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    pasteFiles(pastebin, [
      createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'),
      createFileFromString('a.html', 123, '<b>Hello world!</b>', 'text/html')
    ]);

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    Assert.eq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
    Assert.eq('Should be expected mime type', 'text/plain', dataTransfer.files[0].type);

    Assert.eq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
    Assert.eq('Should be expected mime type', 'text/html', dataTransfer.files[1].type);
  });

  it('Paste using dataTransfer mutator', () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    pasteDataTransfer(pastebin, (dataTransfer) => {
      dataTransfer.items.add(createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'));
      dataTransfer.items.add('<b>Hello world!</b>', 'text/html');
    });

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    Assert.eq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
    Assert.eq('Should be expected mime type', 'file', dataTransfer.items[0].kind);

    Assert.eq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
    Assert.eq('Should be expected mime type', 'string', dataTransfer.items[1].kind);
  });

  it('Cut', () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');
    const dataTransfer = cut(pastebin);
    Assert.eq('Should be extracted cut data', 'cut-data', dataTransfer.getData('text/plain'));
  });

  it('Copy', () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');
    const dataTransfer = copy(pastebin);
    Assert.eq('Should be extracted copy data', 'copy-data', dataTransfer.getData('text/plain'));
  });
});
