import { afterEach, describe, it } from '@ephox/bedrock-client';
import { assert } from 'chai';

import { Menu } from 'tinymce/core/api/ui/Ui';
import LocalStorage from 'tinymce/core/api/util/LocalStorage';
import * as ColorCache from 'tinymce/themes/silver/ui/core/color/ColorCache';

describe('browser.tinymce.themes.silver.editor.color.ColorCacheTest', () => {
  afterEach(() => {
    LocalStorage.clear();
    ColorCache.clearStoredCaches();
  });

  it('TINY-9184: An empty cache is created if no legacy default exists', () => {
    const colors = ColorCache.getCurrentColors('default');
    assert.equal(colors.length, 0, 'Color cache should not have any entries');
  });

  it('TINY-9184: A cache should use legacy default if it exists', () => {
    LocalStorage.setItem('tinymce-custom-colors', JSON.stringify([ '#0F00F0' ]));
    const colors = ColorCache.getCurrentColors('default');
    const expectedResult: Menu.ChoiceMenuItemSpec[] = [
      {
        type: 'choiceitem',
        text: '#0F00F0',
        icon: 'checkmark',
        value: '#0F00F0'
      }
    ];
    assert.deepEqual(colors, expectedResult, 'Color cache should have the correct entry');
  });

  it('TINY-9184: A cache should not be tied to the legacy cache', () => {
    LocalStorage.setItem('tinymce-custom-colors', JSON.stringify([ '#0F00F0' ]));
    ColorCache.addColor('another-id', '#F0FF0F');

    const colors = ColorCache.getCurrentColors('default');
    const colorsOther = ColorCache.getCurrentColors('another-id');
    const expectedResultDefault: Menu.ChoiceMenuItemSpec[] = [
      {
        type: 'choiceitem',
        text: '#0F00F0',
        icon: 'checkmark',
        value: '#0F00F0'
      }
    ];
    const expectedResultOther: Menu.ChoiceMenuItemSpec[] = [
      {
        type: 'choiceitem',
        text: '#F0FF0F',
        icon: 'checkmark',
        value: '#F0FF0F'
      },
      {
        type: 'choiceitem',
        text: '#0F00F0',
        icon: 'checkmark',
        value: '#0F00F0'
      }
    ];
    assert.deepEqual(colors, expectedResultDefault, 'Color cache should have separate entries');
    assert.deepEqual(colorsOther, expectedResultOther, 'Color cache should have separate entries');
  });
});
