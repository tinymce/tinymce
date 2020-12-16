import { Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import * as Bidi from 'tinymce/core/text/Bidi';

UnitTest.asynctest('atomic.tinymce.core.text.BidiTest', (success, failure) => {

  const sTestHasStrongRtl = Step.sync(() => {
    Assertions.assertEq('Hebrew is strong rtl', true, Bidi.hasStrongRtl('\u05D4\u05E7\u05D3\u05E9'));
    Assertions.assertEq('Abc is not strong rtl', false, Bidi.hasStrongRtl('abc'));
    Assertions.assertEq('Dots are neutral', false, Bidi.hasStrongRtl('.'));
  });

  Pipeline.async({}, [
    sTestHasStrongRtl
  ], success, failure);
});
