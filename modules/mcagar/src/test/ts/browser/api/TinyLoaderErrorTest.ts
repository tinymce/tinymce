import { UnitTest } from '@ephox/bedrock-client';
import * as TinyLoader from 'ephox/mcagar/api/TinyLoader';
import Theme from 'tinymce/lib/themes/silver/main/ts/Theme';

UnitTest.asynctest('TinyLoader should fail (instead of timeout) when exception is thrown in callback function', (success, failure) => {
  Theme();

  TinyLoader.setup(() => {
    throw new Error('boo!');
  }, { base_url: '/project/tinymce/js/tinymce' }, failure, success);
});
