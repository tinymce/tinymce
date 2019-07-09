import { UnitTest } from '@ephox/bedrock';
import { DataTransfer, navigator } from '@ephox/dom-globals';
import { Cell, Option } from '@ephox/katamari';
import { Body, DomEvent, Element, Insert, Remove } from '@ephox/sugar';
import { cCopy, cCut, sPasteDataTransfer, sPasteFiles, sPasteItems } from 'ephox/agar/api/Clipboard';
import { createFileFromString } from 'ephox/agar/api/Files';
import { Chain, GeneralSteps, Logger, RawAssertions, Step } from 'ephox/agar/api/Main';
import { Pipeline } from 'ephox/agar/api/Pipeline';

UnitTest.asynctest('ClipboardTest', (success, failure) => {
  const pastebin = Element.fromHtml('<div class="pastebin"></div>');
  const pasteState = Cell(Option.none<DataTransfer>());

  Insert.append(Body.body(), pastebin);

  const cutUnbinder = DomEvent.bind(pastebin, 'cut', (evt) => {
    const dataTransfer = evt.raw().clipboardData;
    dataTransfer.setData('text/plain', 'cut-data');
  });

  const copyUnbinder = DomEvent.bind(pastebin, 'copy', (evt) => {
    const dataTransfer = evt.raw().clipboardData;
    dataTransfer.setData('text/plain', 'copy-data');
  });

  const pasteUnbinder = DomEvent.bind(pastebin, 'paste', (evt) => {
    const dataTransfer = evt.raw().clipboardData;
    pasteState.set(Option.some(dataTransfer));
  });

  Pipeline.async({}, /phantom/i.test(navigator.userAgent) ? [] : [
    Logger.t('Paste text and html items', GeneralSteps.sequence([
      sPasteItems({
        'text/plain': 'Hello world!',
        'text/html': '<b>Hello world!</b>'
      }, '.pastebin'),
      Step.sync(() => {
        const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

        RawAssertions.assertEq('Should be expected plain text', 'Hello world!', dataTransfer.getData('text/plain'));
        RawAssertions.assertEq('Should be expected html', '<b>Hello world!</b>', dataTransfer.getData('text/html'));
      })
    ])),

    Logger.t('Paste text and html files', GeneralSteps.sequence([
      sPasteFiles([
        createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'),
        createFileFromString('a.html', 123, '<b>Hello world!</b>', 'text/html')
      ], '.pastebin'),
      Step.sync(() => {
        const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

        RawAssertions.assertEq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
        RawAssertions.assertEq('Should be expected mime type', 'text/plain', dataTransfer.files[0].type);

        RawAssertions.assertEq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
        RawAssertions.assertEq('Should be expected mime type', 'text/html', dataTransfer.files[1].type);
      })
    ])),

    Logger.t('Paste using dataTransfer mutator', GeneralSteps.sequence([
      sPasteDataTransfer((dataTransfer) => {
        dataTransfer.items.add(createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'));
        dataTransfer.items.add('<b>Hello world!</b>', 'text/html');
      }, '.pastebin'),
      Step.sync(() => {
        const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

        RawAssertions.assertEq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
        RawAssertions.assertEq('Should be expected mime type', 'file', dataTransfer.items[0].kind);

        RawAssertions.assertEq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
        RawAssertions.assertEq('Should be expected mime type', 'string', dataTransfer.items[1].kind);
      })
    ])),

    Logger.t('Cut', Chain.asStep(pastebin, [
      cCut,
      Chain.op((dataTransfer: DataTransfer) => {
        RawAssertions.assertEq('Should be extected cut data', 'cut-data', dataTransfer.getData('text/plain'));
      })
    ])),

    Logger.t('Copy', Chain.asStep(pastebin, [
      cCopy,
      Chain.op((dataTransfer: DataTransfer) => {
        RawAssertions.assertEq('Should be extected copy data', 'copy-data', dataTransfer.getData('text/plain'));
      })
    ]))
  ], () => {
    cutUnbinder.unbind();
    copyUnbinder.unbind();
    pasteUnbinder.unbind();
    Remove.remove(pastebin);
    success();
  }, failure);
});
