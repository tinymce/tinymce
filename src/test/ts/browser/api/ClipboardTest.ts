import { UnitTest } from '@ephox/bedrock';
import { Element, Insert, Remove, Body, DomEvent, SelectorFind } from '@ephox/sugar';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Logger, GeneralSteps, Step, RawAssertions } from 'ephox/agar/api/Main';
import { Cell, Option } from '@ephox/katamari';
import { sPasteItems, sPasteFiles, sPasteDataTransfer } from 'ephox/agar/api/Clipboard';
import { createFile } from 'ephox/agar/api/Files';
import { Blob, DataTransfer } from '@ephox/dom-globals';

UnitTest.asynctest('ClipboardTest', (success, failure) => {
  const pastebin = Element.fromHtml('<div class="pastebin"></div>');
  const state = Cell(Option.none<DataTransfer>());

  Insert.append(Body.body(), pastebin);

  const pasteUnbinder = DomEvent.bind(pastebin, 'paste', (evt) => {
    const dataTransfer = evt.raw().dataTransfer;
    state.set(Option.some(dataTransfer))
  });

  Pipeline.async({}, [
    Logger.t('Paste text and html items', GeneralSteps.sequence([
      sPasteItems({
        'text/plain': 'Hello world!',
        'text/html': '<b>Hello world!</b>'
      }, '.pastebin'),
      Step.sync(() => {
        const dataTransfer = state.get().getOrDie('Could not get dataTransfer from state');

        RawAssertions.assertEq('Should be expected plain text', 'Hello world!', dataTransfer.getData('text/plain'));
        RawAssertions.assertEq('Should be expected html', '<b>Hello world!</b>', dataTransfer.getData('text/html'));
      })
    ])),

    Logger.t('Paste text and html files', GeneralSteps.sequence([
      sPasteFiles([
        createFile('a.txt', 123, new Blob(['Hello world!'], { type: 'text/plain' })),
        createFile('a.html', 123, new Blob(['<b>Hello world!</b>'], { type: 'text/html' }))
      ], '.pastebin'),
      Step.sync(() => {
        const dataTransfer = state.get().getOrDie('Could not get dataTransfer from state');

        RawAssertions.assertEq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
        RawAssertions.assertEq('Should be expected mime type', 'text/plain', dataTransfer.files[0].type);

        RawAssertions.assertEq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
        RawAssertions.assertEq('Should be expected mime type', 'text/html', dataTransfer.files[1].type);
      })
    ])),

    Logger.t('Paste using dataTransfer mutator', GeneralSteps.sequence([
      sPasteDataTransfer((dataTransfer) => {
        dataTransfer.items.add(createFile('a.txt', 123, new Blob(['Hello world!'], { type: 'text/plain' })));
        dataTransfer.items.add('<b>Hello world!</b>', 'text/html');
      }, '.pastebin'),
      Step.sync(() => {
        const dataTransfer = state.get().getOrDie('Could not get dataTransfer from state');

        RawAssertions.assertEq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
        RawAssertions.assertEq('Should be expected mime type', 'file', dataTransfer.items[0].kind);

        RawAssertions.assertEq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
        RawAssertions.assertEq('Should be expected mime type', 'string', dataTransfer.items[1].kind);
      })
    ])),
  ], () => {
    Remove.remove(pastebin);
    pasteUnbinder.unbind();
    success();
  }, failure);
});

