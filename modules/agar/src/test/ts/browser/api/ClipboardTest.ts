import { after, before, beforeEach, describe, it } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { DomEvent, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';

import { copy, cut, pasteDataTransfer, pasteFiles, pasteItems, pPasteUrlItems } from 'ephox/agar/api/Clipboard';
import { createFileFromString, getFileDataAsString } from 'ephox/agar/api/Files';

describe('ClipboardTest', () => {
  const pasteState = Singleton.value<DataTransfer>();
  const pastebinState = Singleton.value<SugarElement<HTMLElement>>();
  const unbinderState = Singleton.value<() => void>();

  const getItemData = async (item: DataTransferItem) => {
    if (item.kind === 'string') {
      return new Promise((resolve) => {
        item.getAsString((data) => {
          resolve(data);
        });
      });
    } else {
      return getFileDataAsString(item.getAsFile());
    }
  };

  const assertStringItem = async (item: DataTransferItem, expected: { type: string; data: string }): Promise<void> => {
    assert.equal(item.type, expected.type);
    assert.equal(item.kind, 'string');
    assert.equal(await getItemData(item), expected.data);
  };

  const assertFileItem = async (item: DataTransferItem, expected: { type: string; name: string; data: string }): Promise<void> => {
    assert.equal(item.type, expected.type);
    assert.equal(item.kind, 'file');
    assert.equal(item.getAsFile().name, expected.name);
    assert.equal(await getItemData(item), expected.data);
  };

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

  beforeEach(() => {
    pasteState.clear();
  });

  after(() => {
    pastebinState.on(Remove.remove);
    pastebinState.clear();
    unbinderState.on((unbind) => unbind());
    unbinderState.clear();
  });

  it('Paste text and html items', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    pasteItems(pastebin, {
      'text/plain': 'Hello world!',
      'text/html': '<b>Hello world!</b>'
    });

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    assert.equal(dataTransfer.items.length, 2);
    await assertStringItem(dataTransfer.items[0], { type: 'text/plain', data: 'Hello world!' });
    await assertStringItem(dataTransfer.items[1], { type: 'text/html', data: '<b>Hello world!</b>' });
  });

  it('Paste text and html files', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    pasteFiles(pastebin, [
      createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'),
      createFileFromString('a.html', 123, '<b>Hello world!</b>', 'text/html')
    ]);

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    assert.equal(dataTransfer.items.length, 2);
    await assertFileItem(dataTransfer.items[1], { type: 'text/html', name: 'a.html', data: '<b>Hello world!</b>' });
    await assertFileItem(dataTransfer.items[0], { type: 'text/plain', name: 'a.txt', data: 'Hello world!' });
  });

  it('Paste using dataTransfer mutator', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    pasteDataTransfer(pastebin, (dataTransfer) => {
      dataTransfer.items.add(createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'));
      dataTransfer.items.add('<b>Hello world!</b>', 'text/html');
    });

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    assert.equal(dataTransfer.items.length, 2);
    await assertFileItem(dataTransfer.items[0], { type: 'text/plain', name: 'a.txt', data: 'Hello world!' });
    await assertStringItem(dataTransfer.items[1], { type: 'text/html', data: '<b>Hello world!</b>' });
  });

  it('Cut', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');
    const dataTransfer = cut(pastebin);

    assert.equal(dataTransfer.items.length, 1);
    await assertStringItem(dataTransfer.items[0], { type: 'text/plain', data: 'cut-data' });
  });

  it('Copy', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');
    const dataTransfer = copy(pastebin);

    assert.equal(dataTransfer.items.length, 1);
    await assertStringItem(dataTransfer.items[0], { type: 'text/plain', data: 'copy-data' });
  });

  it('PasteUrlItems as strings', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    await pPasteUrlItems(pastebin, [
      { kind: 'string', url: 'project/@ephox/agar/src/test/resources/clipboard.html' },
      { kind: 'string', url: 'project/@ephox/agar/src/test/resources/clipboard.txt' },
    ]);

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    assert.equal(dataTransfer.items.length, 2);
    assertStringItem(dataTransfer.items[0], { type: 'text/html', data: '<!DOCTYPE html>\n<html>\n<body>\n<p>Hello world</p>\n</body>\n</html>\n' });
    assertStringItem(dataTransfer.items[1], { type: 'text/plain', data: 'Hello world\n' });
  });

  it('PasteUrlItems as files', async () => {
    const pastebin = pastebinState.get().getOrDie('Could not get pastebin from state');

    await pPasteUrlItems(pastebin, [
      { kind: 'file', url: 'project/@ephox/agar/src/test/resources/clipboard.html' },
      { kind: 'file', url: 'project/@ephox/agar/src/test/resources/clipboard.txt' },
    ]);

    const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

    assert.equal(dataTransfer.items.length, 2);
    await assertFileItem(dataTransfer.items[0], { type: 'text/html', name: 'clipboard.html', data: '<!DOCTYPE html>\n<html>\n<body>\n<p>Hello world</p>\n</body>\n</html>\n' });
    await assertFileItem(dataTransfer.items[1], { type: 'text/plain', name: 'clipboard.txt', data: 'Hello world\n' });
  });
});
