import { Assertions } from '@ephox/agar';
import * as Features from 'tinymce/themes/mobile/features/Features';
import { UnitTest } from '@ephox/bedrock-client';

UnitTest.test('features.IdentifyToolbarTest', function () {
  const check = function (label, expected, input) {
    const actual = Features.identify(input);
    Assertions.assertEq(label, expected, actual);
  };

  check('Default toolbar', [ 'undo', 'bold', 'italic', 'link', 'image', 'bullist', 'styleselect' ], { });
  check('Empty toolbar', [ ], { toolbar: '' });
  check('Empty toolbar (array)', [ ], { toolbar: [ ] });

  check('Flat toolbar', [ 'undo', 'bold' ], { toolbar: 'undo bold' });
  check('Flat toolbar (array)', [ 'undo', 'bold' ], { toolbar: [ 'undo', 'bold' ] });

  check('Nested toolbar (array)', [ 'undo', 'bold', 'italic' ], { toolbar: [[ 'undo' ], [ 'bold', 'italic' ]] });

  check('Mixed toolbar (array)', [ 'undo', 'bold', 'redo', 'italic' ], { toolbar: [[ 'undo' ], [ ], [ 'bold redo', 'italic' ]] });

  check('Toolbar with pipes', [ 'undo', 'bold', 'italic', 'bullist', 'styleselect' ], { toolbar: [[ 'undo | bold | italic' ], [ 'bullist styleselect' ]] });

  check('Unknown identifiers', [
    'undo', 'redo', 'styleselect', 'bold', 'italic', 'alignleft', 'aligncenter', 'alignright', 'alignjustify',
    'bullist', 'numlist', 'outdent', 'indent', 'link', 'image'
  ], { toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image' });
});
