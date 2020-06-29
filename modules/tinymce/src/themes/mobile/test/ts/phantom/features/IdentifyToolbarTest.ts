import { Assertions } from '@ephox/agar';
import * as Features from 'tinymce/themes/mobile/features/Features';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('features.IdentifyToolbarTest', function () {
  const check = function (label: string, expected: string[], input: string | string[] | string[][] | undefined) {
    const dummyEditor = {
      getParam: (_name: string, defaultValue: any) => input !== undefined ? input : defaultValue
    };
    const actual = Features.identify(dummyEditor as any);
    Assertions.assertEq(label, expected, actual);
  };

  check('Default toolbar', [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist', 'styleselect' ], undefined);
  check('Empty toolbar', [ ], '' );
  check('Empty toolbar (array)', [ ], [ ] );

  check('Flat toolbar', [ 'undo', 'bold' ], 'undo bold' );
  check('Flat toolbar (array)', [ 'undo', 'bold' ], [ 'undo', 'bold' ] );

  check('Nested toolbar (array)', [ 'undo', 'bold', 'italic' ], [[ 'undo' ], [ 'bold', 'italic' ]] );

  check('Mixed toolbar (array)', [ 'undo', 'bold', 'redo', 'italic' ], [[ 'undo' ], [ ], [ 'bold redo', 'italic' ]] );

  check('Toolbar with pipes', [ 'undo', 'bold', 'italic', 'bullist', 'styleselect' ], [[ 'undo | bold | italic' ], [ 'bullist styleselect' ]] );

  check('Unknown identifiers', [
    'undo', 'redo', 'styleselect', 'bold', 'italic', 'alignleft', 'aligncenter', 'alignright', 'alignjustify',
    'bullist', 'numlist', 'outdent', 'indent', 'link', 'image'
  ], 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image' );
});
