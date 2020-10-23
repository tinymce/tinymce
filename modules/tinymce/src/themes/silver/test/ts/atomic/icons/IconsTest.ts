import { Assertions, Pipeline, Step } from '@ephox/agar';
import { UnitTest } from '@ephox/bedrock-client';
import { TinyLoader } from '@ephox/mcagar';
import { getAll as getAllOxide } from '@tinymce/oxide-icons-default';
import Theme from 'tinymce/themes/silver/Theme';
import { get, IconProvider } from 'tinymce/themes/silver/ui/icons/Icons';

UnitTest.asynctest('IconsTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const iconIndent = getAllOxide().indent;
    const iconDefault = getAllOxide()['temporary-placeholder'];
    const myCustomIcon = '<svg></svg>';

    const iconProvider = () => editor.ui.registry.getAll().icons;
    const emptyIconProvider: IconProvider = () => ({ });
    const lowerCaseProvider: IconProvider = () => ({ mycustomicon: '<svg></svg>' });

    const getTest = Step.sync(() => {
      Assertions.assertEq(
        'When an icon exists as a default icon or provided, it should be returned',
        iconIndent,
        get('indent', iconProvider)
      );

      Assertions.assertEq(
        'When a lowercase version of a mixed-case name exists, it should be returned',
        myCustomIcon,
        get('myCustomIcon', lowerCaseProvider)
      );

      Assertions.assertEq(
        'When an icon does not exist as a default icon, the temporary placeholder or fallback icon should be returned',
        iconDefault,
        get('temp_icon', iconProvider)
      );

      Assertions.assertEq(
        'When a default icon or fallback does not exist, !not found! should be returned',
        '!not found!',
        get('indent', emptyIconProvider)
      );
    });

    Pipeline.async({}, [
      getTest
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
