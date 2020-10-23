import { Assert, UnitTest } from '@ephox/bedrock-client';
import { Cell, Optional } from '@ephox/katamari';
import { Insert, Remove, SugarBody, SugarElement } from '@ephox/sugar';
import { cRunOnPatchedFileInput, sRunOnPatchedFileInput } from 'ephox/agar/api/FileInput';
import { createFile } from 'ephox/agar/api/Files';
import { Chain, GeneralSteps, Logger, Pipeline, Step } from 'ephox/agar/api/Main';

UnitTest.asynctest('PatchFileInputTest', (success, failure) => {
  const files = [ createFile('a.txt', 0, new Blob([ 'x' ])) ];
  const filesState = Cell(Optional.none<FileList>());

  const pickFiles = (body: SugarElement<any>, next: (files: FileList) => void) => {
    const elm = SugarElement.fromHtml<HTMLInputElement>('<input type="file">');
    elm.dom.onchange = () => {
      Remove.remove(elm);
      next(elm.dom.files);
    };
    Insert.append(body, elm);
    elm.dom.click();
  };

  const cPickFiles = Chain.async<SugarElement, FileList>((input, next, _die) => pickFiles(input, next));
  const sPickFiles = Step.async((next, _die) => pickFiles(SugarBody.body(), (files) => {
    filesState.set(Optional.some(files));
    next();
  }));

  const assetFiles = (files: FileList) => {
    Assert.eq('Should be expected number of files', 1, files.length);
    Assert.eq('Should be expected file name', 'a.txt', files[0].name);
    Assert.eq('Should be expected file size', 1, files[0].size);
  };

  Pipeline.async({}, /phantom/i.test(navigator.userAgent) ? [] : [
    Logger.t('Patch file input step', GeneralSteps.sequence([
      sRunOnPatchedFileInput(files, sPickFiles),
      Step.sync(() => {
        const files = filesState.get().getOrDie('Failed to get files state');
        assetFiles(files);
        filesState.set(Optional.none());
      })
    ])),

    Logger.t('Patch file input chain', Chain.asStep(SugarBody.body(), [
      cRunOnPatchedFileInput(files, cPickFiles),
      Chain.op(assetFiles)
    ]))
  ], success, failure);
});
