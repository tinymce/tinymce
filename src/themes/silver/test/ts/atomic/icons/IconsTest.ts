import { UnitTest } from '@ephox/bedrock';
import { IconProvider, get } from '../../../../main/ts/ui/icons/Icons';
import { Assertions, Pipeline, Step } from '@ephox/agar';
import { getAll as getAllOxide } from '@tinymce/oxide-icons-default';

UnitTest.asynctest('IconsTest', (success, failure) => {
  const iconIndent = getAllOxide().indent;
  const iconProvider: IconProvider = () => ({ indent: `<svg data-mce-name='indent'></svg>` });
  const emptyIconProvider: IconProvider = () => ({ });

  const getTest = Step.sync(() => {
    Assertions.assertEq(
      'When an icon exist both as a default and as a provided icon it should return the provided icon',
      get('indent', iconProvider),
      iconProvider().indent
    );

    Assertions.assertEq(
      'When an icon only exist as a default icon it should return the default icon',
      get('indent', emptyIconProvider),
      iconIndent
    );
  });

  Pipeline.async({}, [
    getTest,
  ], () => {
    success();
  }, failure);
});