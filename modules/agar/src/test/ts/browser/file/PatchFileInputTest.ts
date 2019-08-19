import { UnitTest } from '@ephox/bedrock';
import { Pipeline, Step, Chain, RawAssertions, Logger, GeneralSteps } from 'ephox/agar/api/Main';
import { createFile } from 'ephox/agar/api/Files';
import { Blob, FileList, navigator, HTMLInputElement } from '@ephox/dom-globals';
import { sRunOnPatchedFileInput, cRunOnPatchedFileInput } from 'ephox/agar/api/FileInput';
import { Element, Body, Insert, Remove } from '@ephox/sugar';
import { Cell, Option } from '@ephox/katamari';

UnitTest.asynctest('PatchFileInputTest', (success, failure) => {
  const files = [ createFile('a.txt', 0, new Blob(['x'])) ];
  const filesState = Cell(Option.none());

  const pickFiles = (body: Element, next: (files: FileList) => void) => {
    const elm = Element.fromHtml<HTMLInputElement>('<input type="file">');
    elm.dom().onchange = () => {
      Remove.remove(elm);
      next(elm.dom().files);
    };
    Insert.append(body, elm);
    elm.dom().click();
  };

  const cPickFiles = Chain.async<Element, FileList>((input, next, die) => pickFiles(input, next));
  const sPickFiles = Step.async((next, die) => pickFiles(Body.body(), (files) => {
    filesState.set(Option.some(files));
    next();
  }));

  const assetFiles = (files: FileList) => {
    RawAssertions.assertEq('Should be expected number of files', 1, files.length);
    RawAssertions.assertEq('Should be expected file name', 'a.txt', files[0].name);
    RawAssertions.assertEq('Should be expected file size', 1, files[0].size);
  };

  Pipeline.async({}, /phantom/i.test(navigator.userAgent) ? [] : [
    Logger.t('Patch file input step', GeneralSteps.sequence([
      sRunOnPatchedFileInput(files, sPickFiles),
      Step.sync(() => {
        const files = filesState.get().getOrDie('Failed to get files state');
        assetFiles(files);
        filesState.set(Option.none());
      })
    ])),

    Logger.t('Patch file input chain', Chain.asStep(Body.body(), [
      cRunOnPatchedFileInput(files, cPickFiles),
      Chain.op(assetFiles)
    ]))
  ], success, failure);
});
