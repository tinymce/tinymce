import { UnitTest } from '@ephox/bedrock';
import { IconProvider, get } from 'tinymce/themes/silver/ui/icons/Icons';
import { Assertions, Pipeline, Step } from '@ephox/agar';
import { getAll as getAllOxide } from '@tinymce/oxide-icons-default';
import { TinyLoader } from '@ephox/mcagar';
import Theme from 'tinymce/themes/silver/Theme';

UnitTest.asynctest('IconsTest', (success, failure) => {
  Theme();

  TinyLoader.setupLight((editor, onSuccess, onFailure) => {
    const iconIndent = getAllOxide().indent;
    const iconDefault = getAllOxide()['temporary-placeholder'];

    const iconProvider = () => editor.ui.registry.getAll().icons;
    const emptyIconProvider: IconProvider = () => ({ });

    const getTest = Step.sync(() => {
      Assertions.assertEq(
        'When an icon exists as a default icon or provided, it should be returned',
        iconIndent,
        get('indent', iconProvider)
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
      getTest,
    ], onSuccess, onFailure);
  }, {
    base_url: '/project/tinymce/js/tinymce'
  }, success, failure);
});
