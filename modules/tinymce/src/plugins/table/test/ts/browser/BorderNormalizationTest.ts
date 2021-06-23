import { describe, context, it } from '@ephox/bedrock-client';
import { Arr } from '@ephox/katamari';
import { Attribute, SugarElement } from '@ephox/sugar';
import { assert } from 'chai';
import * as BorderNormalizer from 'tinymce/plugins/table//core/BorderNormalizer';
import { DomModifier } from 'tinymce/plugins/table/ui/DomModifier';

type Normalizer = (modifier: DomModifier, cell: SugarElement<HTMLTableCellElement>, color: string) => void;

describe('browser.tinymce.plugins.table.BorderNormalizationTest', () => {
  const doubleBorderStyles = [ 'dashed', 'dotted', 'double', 'groove', 'ridge', 'inset', 'outset' ];
  const invisibleBorderStyles = [ 'hidden', 'none' ];
  const visibleBorderStyles = doubleBorderStyles.concat([ 'solid' ]);
  const allBorderStyles = visibleBorderStyles.concat(invisibleBorderStyles);

  const makeTestDomModifier = (): [Array<[string, string]>, DomModifier] => {
    const state: Array<[string, string]> = [];
    const api: DomModifier = {
      setAttrib: (_name, _attr) => assert.fail('Unexpected setAttrib call'),
      setStyle: (_prop, _value) => assert.fail('Unexpected setStyle call'),
      setFormat: (name, value) => state.push([ name, value ])
    };
    return [ state, api ];
  };

  const testNormalizeSetValue = (normalizer: Normalizer) => (initialStyles: string, value: string, expectedFormats: Array<[string, string]>) => {
    const cell = SugarElement.fromTag('td');
    Attribute.set(cell, 'style', initialStyles);

    const [ state, modifier ] = makeTestDomModifier();

    normalizer(modifier, cell, value);

    assert.deepEqual(state, expectedFormats, `Expected normalization to match when appling ${value} to a cell with styles ${initialStyles}`);
  };

  context('border-color', () => {
    const testNormalizeSetCellBorderColor = testNormalizeSetValue(BorderNormalizer.normalizeSetCellBorderColor);

    it('TINY-7593: should set border-style to double if we set a color on a cell with border-width: 1px', () => {
      Arr.each(
        visibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderColor(`border: 1px ${borderStyle} red`, 'blue', [[ 'tablecellborderstyle', 'double' ]])
      );
    });

    it('TINY-7593: should not normalize if we set a border-color on a cell with an border-style that is invisible', () => {
      Arr.each(
        invisibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderColor(`border: 1px ${borderStyle} red`, 'blue', [])
      );
    });

    it('TINY-7593: should set unset border-style if we are removing a color on a cell with border-width: 1px since the double would otherwise overlap', () => {
      Arr.each(
        visibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderColor(`border: 1px ${borderStyle} red`, '', [[ 'tablecellborderstyle', '' ]])
      );
    });

    it('TINY-7593: should not normalize if we set a border-color to an empty string since that should remove the color', () => {
      Arr.each(
        allBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderColor(`border: 2px ${borderStyle} red`, '', [])
      );
    });

    it('TINY-7593: should not normalize if we set a border-color on a cell with border-width: 2px since that would already render the border', () => {
      Arr.each(
        allBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderColor(`border: 2px ${borderStyle} red`, 'blue', [])
      );
    });
  });

  context('border-width', () => {
    const testNormalizeSetCellBorderWidth = testNormalizeSetValue(BorderNormalizer.normalizeSetCellBorderWidth);

    it('TINY-7593: should set border-style to double if the border-width is set to 1px on a cell with a border-color in the style attribute', () => {
      Arr.each(
        visibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderWidth(`border: 2px ${borderStyle} red`, '1px', [[ 'tablecellborderstyle', 'double' ]])
      );
    });

    it('TINY-7593: should unset the border-style if the border-width is set to 1px on a cell without a border-color in the style attribute', () => {
      Arr.each(
        visibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderWidth(`border-width: 2px; border-style: ${borderStyle}`, '1px', [[ 'tablecellborderstyle', '' ]])
      );
    });

    it('TINY-7593: should set the border-style back to solid if the border-width is set to 2px or above', () => {
      testNormalizeSetCellBorderWidth(`border: 1px double red`, '2px', [[ 'tablecellborderstyle', 'solid' ]]);
      testNormalizeSetCellBorderWidth(`border: 1px double red`, '3px', [[ 'tablecellborderstyle', 'solid' ]]);
    });

    it('TINY-7593: should not normalize if border-width is set to 1px on a cell with an invisible border-style', () => {
      Arr.each(
        invisibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderWidth(`border: 2px ${borderStyle} red`, '1px', [])
      );
    });

    it('TINY-7593: should not normalize if border-width is set to a value grater than 1px unless it is double', () => {
      Arr.each(
        Arr.filter(allBorderStyles, (style) => style !== 'double'),
        (borderStyle) => testNormalizeSetCellBorderWidth(`border-width: 1px; border-style: ${borderStyle}`, '2px', [])
      );
    });
  });

  context('border-style', () => {
    const testNormalizeSetCellBorderStyle = testNormalizeSetValue(BorderNormalizer.normalizeSetCellBorderStyle);

    it('TINY-7593: should set border-width to 2px if the border-style is set to one that requires double border to show', () => {
      Arr.each(
        doubleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderStyle('border: 1px solid red', borderStyle, [[ 'tablecellborderwidth', '2px' ]])
      );
    });

    it('TINY-7593: should not normalize if the border-style is set to a invisible one', () => {
      Arr.each(
        invisibleBorderStyles,
        (borderStyle) => testNormalizeSetCellBorderStyle('border: 1px solid red', borderStyle, [])
      );
    });

    it('TINY-7593: should set border-width to 2px if the border-style is set to solid on a cell that has border-color in the style attribute', () => {
      testNormalizeSetCellBorderStyle('border: 1px dashed red', 'solid', [[ 'tablecellborderwidth', '2px' ]]);
    });

    it('TINY-7593: should unset border-width if border-style is set to empty on a cell with border-width: 1px', () => {
      testNormalizeSetCellBorderStyle('border: 1px dashed red', '', [[ 'tablecellborderwidth', '' ]]);
    });

    it('TINY-7593: should not normalize if the border-style is set to solid on a cell that does not have border-color in the style attribute', () => {
      testNormalizeSetCellBorderStyle('border-width: 1px; border-style: dashed', 'solid', []);
    });
  });
});
