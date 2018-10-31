import { UnitTest } from '@ephox/bedrock';
import TinyLoader from 'ephox/mcagar/api/TinyLoader';
import { sAssertVersion } from '../../module/AssertVersion';
import { Pipeline, GeneralSteps, Assertions } from '@ephox/agar';

declare const tinymce;

tinymce.PluginManager.urls.test = '/project/dist/test';
tinymce.PluginManager.add('test', (editor, url) => {
  return { url }
});

const sTestVersion = (loadVersion: string, expectedMajor: number, expectedMinor: number) => {
  return TinyLoader.sSetupVersion(loadVersion, ['test'], (editor) => {
    return GeneralSteps.sequence([
      sAssertVersion(expectedMajor, expectedMinor),
      Assertions.sAssertEq('Should be the expected url', '/project/dist/test', editor.plugins.test.url)
    ]);
  }, {
    plugins: ['test', 'code']
  });
};

UnitTest.asynctest('TinyLoaderVersionTest', (success, failure) => {
  Pipeline.async({}, [
    sTestVersion('4.5.x', 4, 5),
    sTestVersion('4.8.x', 4, 8)
  ], () => success(), failure);
});
