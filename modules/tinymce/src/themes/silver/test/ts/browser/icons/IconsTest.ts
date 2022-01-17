import { SimpleOrSketchSpec } from '@ephox/alloy';
import { context, describe, it } from '@ephox/bedrock-client';
import { Optional } from '@ephox/katamari';
import { TinyHooks } from '@ephox/wrap-mcagar';
import { getAll as getAllOxide } from '@tinymce/oxide-icons-default';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';
import I18n from 'tinymce/core/api/util/I18n';
import * as Icons from 'tinymce/themes/silver/ui/icons/Icons';

type IconProvider = Icons.IconProvider;

describe('browser.tinymce.themes.silver.icons.IconsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    setup: () => {
      I18n.add('rtllang', { _dir: 'rtl' });
    }
  }, []);

  const iconIndent = getAllOxide().indent;
  const iconDefault = getAllOxide()['temporary-placeholder'];
  const myCustomIcon = '<svg></svg>';
  const myCustomRtlIcon = '<svg dir="rtl"></svg>';
  const iconSpec = { tag: 'span', classes: [ 'tox-icon' ] };

  const iconProvider: IconProvider = () => hook.editor().ui.registry.getAll().icons;
  const emptyIconProvider: IconProvider = () => ({ });
  const lowerCaseProvider: IconProvider = () => ({ mycustomicon: myCustomIcon });
  const rtlProvider: IconProvider = () => ({ 'mycustomicon': myCustomIcon, 'mycustomicon-rtl': myCustomRtlIcon });

  const assertIconSpec = (spec: SimpleOrSketchSpec, svg: string, flip: boolean = false) => {
    assert.deepEqual(spec.dom, {
      tag: 'span',
      classes: [ 'tox-icon' ].concat(flip ? [ 'tox-icon--flip' ] : []),
      attributes: {},
      innerHtml: svg
    });
    assert.property(spec.behaviours, 'add-focusable');
  };

  const testWithRtl = (fn: () => void) => () => {
    I18n.setCode('rtllang');
    fn();
    I18n.setCode('en');
  };

  context('get', () => {
    it('When an icon exists as a default icon or provided, it should be returned', () => {
      assert.equal(Icons.get('indent', iconProvider), iconIndent);
    });

    it('When a lowercase version of a mixed-case name exists, it should be returned', () => {
      assert.equal(Icons.get('myCustomIcon', lowerCaseProvider), myCustomIcon);
    });

    it('When an icon does not exist as a default icon, the temporary placeholder or fallback icon should be returned', () => {
      assert.equal(Icons.get('temp_icon', iconProvider), iconDefault);
    });

    it('When a default icon or fallback does not exist, !not found! should be returned', () => {
      assert.equal(Icons.get('indent', emptyIconProvider), '!not found!');
    });

    it('TINY-7782: should use an RTL icon if present when in RTL mode', testWithRtl(() => {
      assert.equal(Icons.get('mycustomicon', rtlProvider), myCustomRtlIcon);
    }));
  });

  context('render', () => {
    it('TINY-7782: should render a valid icon', () => {
      const spec = Icons.render('indent', iconSpec, iconProvider);
      assertIconSpec(spec, iconIndent);
    });

    it('TINY-7782: should use fallback icon html if provided', () => {
      const spec = Icons.render('invalid', iconSpec, iconProvider, Optional.some(myCustomIcon));
      assertIconSpec(spec, myCustomIcon);
    });

    it('TINY-7782: should fallback to rendering the placeholder for an invalid icon', () => {
      const spec = Icons.render('invalid', iconSpec, iconProvider);
      assertIconSpec(spec, iconDefault);
    });

    it('TINY-7782: should render with a custom icon spec', () => {
      const spec = Icons.render('indent', {
        tag: 'div',
        classes: [ 'custom-class' ],
        attributes: {
          title: 'test title'
        }
      }, iconProvider);

      assert.deepEqual(spec.dom, {
        tag: 'div',
        classes: [ 'custom-class' ],
        attributes: {
          title: 'test title'
        },
        innerHtml: iconIndent
      });
    });

    it('TINY-7782: should render using an RTL icon if present', testWithRtl(() => {
      const spec = Icons.render('mycustomicon', iconSpec, rtlProvider);
      assertIconSpec(spec, myCustomRtlIcon, false);
    }));

    it('TINY-7782: should include the flip transform icon class for certain icons when in RTL mode', testWithRtl(() => {
      const spec = Icons.render('indent', iconSpec, iconProvider);
      assertIconSpec(spec, iconIndent, true);
    }));
  });

  context('renderFirst', () => {
    it('TINY-7782: should render the first valid icon', () => {
      const spec = Icons.renderFirst([ 'invalid', 'indent', 'outdent' ], iconSpec, iconProvider);
      assertIconSpec(spec, iconIndent);
    });

    it('TINY-7782: should fallback to rendering the placeholder when no icons are valid', () => {
      const spec = Icons.renderFirst([ 'invalid' ], iconSpec, iconProvider);
      assertIconSpec(spec, iconDefault);
    });
  });
});
