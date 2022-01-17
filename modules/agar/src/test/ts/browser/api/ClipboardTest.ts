import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Singleton } from '@ephox/katamari';
import { DomEvent, Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';

import { Chain } from 'ephox/agar/api/Chain';
import * as ChainSequence from 'ephox/agar/api/ChainSequence';
import { cCopy, cCut, sPasteDataTransfer, sPasteFiles, sPasteItems } from 'ephox/agar/api/Clipboard';
import { createFileFromString } from 'ephox/agar/api/Files';
import * as Logger from 'ephox/agar/api/Logger';
import { Pipeline } from 'ephox/agar/api/Pipeline';
import { Step } from 'ephox/agar/api/Step';
import * as StepSequence from 'ephox/agar/api/StepSequence';

UnitTest.asynctest('ClipboardTest', (success, failure) => {
  const pastebin = SugarElement.fromHtml('<div class="pastebin"></div>');
  const pasteState = Singleton.value<DataTransfer>();

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

  Pipeline.runStep({}, StepSequence.sequenceSame([
    Logger.t('Paste text and html items', StepSequence.sequenceSame([
      sPasteItems({
        'text/plain': 'Hello world!',
        'text/html': '<b>Hello world!</b>'
      }, '.pastebin'),
      Step.sync(() => {
        const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

        Assert.eq('Should be expected plain text', 'Hello world!', dataTransfer.getData('text/plain'));
        Assert.eq('Should be expected html', '<b>Hello world!</b>', dataTransfer.getData('text/html'));
      })
    ])),

    Logger.t('Paste text and html files', StepSequence.sequenceSame([
      sPasteFiles([
        createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'),
        createFileFromString('a.html', 123, '<b>Hello world!</b>', 'text/html')
      ], '.pastebin'),
      Step.sync(() => {
        const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

        Assert.eq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
        Assert.eq('Should be expected mime type', 'text/plain', dataTransfer.files[0].type);

        Assert.eq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
        Assert.eq('Should be expected mime type', 'text/html', dataTransfer.files[1].type);
      })
    ])),

    Logger.t('Paste using dataTransfer mutator', StepSequence.sequenceSame([
      sPasteDataTransfer((dataTransfer) => {
        dataTransfer.items.add(createFileFromString('a.txt', 123, 'Hello world!', 'text/plain'));
        dataTransfer.items.add('<b>Hello world!</b>', 'text/html');
      }, '.pastebin'),
      Step.sync(() => {
        const dataTransfer = pasteState.get().getOrDie('Could not get dataTransfer from state');

        Assert.eq('Should be expected mime type', 'text/plain', dataTransfer.items[0].type);
        Assert.eq('Should be expected mime type', 'file', dataTransfer.items[0].kind);

        Assert.eq('Should be expected mime type', 'text/html', dataTransfer.items[1].type);
        Assert.eq('Should be expected mime type', 'string', dataTransfer.items[1].kind);
      })
    ])),

    Logger.t('Cut', Chain.isolate(pastebin, ChainSequence.sequence([
      cCut,
      Chain.op((dataTransfer: DataTransfer) => {
        Assert.eq('Should be extracted cut data', 'cut-data', dataTransfer.getData('text/plain'));
      })
    ]))),

    Logger.t('Copy', Chain.isolate(pastebin, ChainSequence.sequence([
      cCopy,
      Chain.op((dataTransfer: DataTransfer) => {
        Assert.eq('Should be extracted copy data', 'copy-data', dataTransfer.getData('text/plain'));
      })
    ])))
  ]), () => {
    cutUnbinder.unbind();
    copyUnbinder.unbind();
    pasteUnbinder.unbind();
    Remove.remove(pastebin);
    success();
  }, failure);
});
