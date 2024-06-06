import { context, describe, it } from '@ephox/bedrock-client';
import { Arr, Obj } from '@ephox/katamari';
import { TinyAssertions, TinyHooks, TinySelections } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';
import * as InsertContent from 'tinymce/core/content/InsertContent';

describe('browser.tinymce.core.content.insert.MergeInsertedInlineElementsTest', () => {
  const hook = TinyHooks.bddSetupLight<Editor>({
    base_url: '/project/tinymce/js/tinymce',
    license_key: 'gpl'
  }, [], true);

  const validInlineElements = [ 'span', 'strong', 'code' ];
  const colorStyles = [ 'color', 'background-color' ];
  const pixelStyles = [ 'font-size', 'line-height' ];

  const nonInheritableColorStyles = [ 'border-color' ];
  const nonInheritablePixelStyles = [ 'padding', 'margin', 'border-width' ];
  const conditionalNonInheritableStyle = 'background-color';

  const colorStyleValues = [ '#ff0000', '#00ff00', '#0000ff', '#000000' ];
  const pixelStyleValues = [ '10px', '20px', '30px', '40px' ];

  const buildInlineStyles = (inlineStyles: Record<string, string>) => Obj.mapToArray(inlineStyles, (value, style) => `${style}: ${value};`);
  const buildNestedInlineElements = (elementType: string, elements: Record<string, string>[], text: string): string =>
    Arr.foldr(elements, (acc, styles) => `<${elementType} style="${buildInlineStyles(styles).join(' ')}">${acc}</${elementType}>`, text);
  const testMergeNestedElements = (initial: string, inserted: string, expected: string, path: number[], offset: number) => {
    const editor = hook.editor();
    editor.setContent(`<p>${initial}</p>`);
    TinySelections.setCursor(editor, path, offset);
    InsertContent.insertAtCaret(editor, {
      content: inserted,
      merge: true
    });
    TinyAssertions.assertContent(editor, `<p>${expected}</p>`);
  };

  it('TINY-10869: Styled "a" element inserted into same styled "a" element, results in entire content split between "a" tags', () => {
    const initial = buildNestedInlineElements('a', [{ ['color']: colorStyleValues[0] }], 'test');
    const inserted = buildNestedInlineElements('a', [{ ['color']: colorStyleValues[0] }], 'test');
    const expected = buildNestedInlineElements('a', [{ ['color']: colorStyleValues[0] }], 'te') + inserted + buildNestedInlineElements('a', [{ ['color']: colorStyleValues[0] }], 'st');
    testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
  });

  Arr.each(validInlineElements, (elementType) => {
    const testMergingSameStyle = (style: string, valueArr: string[]) => context(`Inserting ${elementType} elements with ${style} styles`, () => {
      it(`TINY-10869: Merging one styled ${elementType} inserted into ${elementType} with same style`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging one different styled ${elementType} inserted into initial ${elementType}`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging one different and one identical styled ${elementType}s inserted into initial ${elementType}s`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }, { [style]: valueArr[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two different styled ${elementType}s inserted into initial ${elementType}s`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[3] }, { [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }], `te${buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'test')}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging three identical styled ${elementType}s inserted into initial ${elementType}s`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }, { [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }, { [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }, { [style]: valueArr[1] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0, 0 ], 2);
      });
    });

    const testMergingDifferentStyles = (styleA: string, valueArrA: string[], styleB: string, valueArrB: string[]) => context(`Inserting ${elementType} elements with ${styleA} and ${styleB} styles`, () => {
      it(`TINY-10869: Merging one styled ${elementType}s inserted into different styled initial ${elementType}`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleB]: valueArrB[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two ${elementType}s of same style into two different styled initial ${elementType}s`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleA]: valueArrA[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleB]: valueArrB[1] }, { [styleB]: valueArrB[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleA]: valueArrA[1] }], `te${buildNestedInlineElements(elementType, [{ [styleB]: valueArrB[0] }], 'test')}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two different styled ${elementType}s inserted into two identical styled initial ${elementType}s`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleB]: valueArrB[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleB]: valueArrB[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleB]: valueArrB[1] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two different styled ${elementType}s inserted into two different styled initial ${elementType}s`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleB]: valueArrB[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleB]: valueArrB[2] }, { [styleA]: valueArrA[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0] }, { [styleB]: valueArrB[1] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging four different styled ${elementType}s inserted into four different styled initial spans, with some ${elementType}s identical`, () => {
        const initial = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0] },
          { [styleA]: valueArrA[2] },
          { [styleB]: valueArrB[2] },
          { [styleB]: valueArrB[1] }
        ], 'test');
        const inserted = buildNestedInlineElements(elementType, [
          { [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0] },
          { [styleA]: valueArrA[0] },
          { [styleA]: valueArrA[1] },
        ], 'test');
        const expectedInserted = buildNestedInlineElements(elementType, [
          { [styleB]: valueArrB[0] },
          { [styleA]: valueArrA[1] },
        ], 'test');
        const expected = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0] },
          { [styleA]: valueArrA[2] },
          { [styleB]: valueArrB[2] },
          { [styleB]: valueArrB[1] },
        ], 'te' + expectedInserted + 'st');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging ${elementType} with two styles inserted into initial ${elementType} with different styles`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[0], [styleB]: valueArrB[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging ${elementType} with two styles inserted into initial ${elementType} with identical styles`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'test');
        const inserted = initial;
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two nested ${elementType}s with different styles inserted into one initial ${elementType} with same style as one ${elementType}`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleA]: valueArrA[1], [styleB]: valueArrB[0] }
        ], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two nested ${elementType}s with different styles inserted into one initial ${elementType} with same style as one ${elementType} but different order`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] }
        ], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two nested ${elementType}s with different styles inserted into one initial ${elementType} with both styles`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1] }, { [styleB]: valueArrB[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging one ${elementType} with two styles into nested ${elementType}s each with one same style`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1] }, { [styleB]: valueArrB[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1], [styleB]: valueArrB[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [styleA]: valueArrA[1] }, { [styleB]: valueArrB[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two ${elementType}s with different styles into two nested ${elementType}s with matching styles`, () => {
        const initial = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] }
        ], 'test');
        const inserted = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] }
        ], 'test');
        const expected = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] }
        ], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Merging two ${elementType}s with different styles into two nested ${elementType}s with matching styles but reversed order`, () => {
        const initial = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] }
        ], 'test');
        const inserted = buildNestedInlineElements(elementType, [
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] },
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] }
        ], 'test');
        const expected = buildNestedInlineElements(elementType, [
          { [styleA]: valueArrA[0], [styleB]: valueArrB[1] },
          { [styleB]: valueArrB[0], [styleA]: valueArrA[1] }
        ], 'tetestst');
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });
    });

    const testMergingChildrenSameStyle = (style: string, valueArr: string[]) => context(`Inserting ${elementType} elements and multiple children with ${style} styles`, () => {
      it(`TINY-10869: ${elementType} with two same-styled children inserted into one initial ${elementType} with same style as parent won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const child = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], child + child);
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType} with two same-styled children inserted into one initial ${elementType} with same style as children won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const child = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], child + child);
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType} with two nested children inserted into one initial ${elementType} with different style will strip redundant children`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const child = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }, { [style]: valueArr[2] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], child + child);
        const expectedChild = buildNestedInlineElements(elementType, [{ [style]: valueArr[2] }], 'child');
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], expectedChild + expectedChild);
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType} with two children inserted into one initial ${elementType} with different style will strip redundant parent`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const child = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }, { [style]: valueArr[2] }], child + child);
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[2] }], child + child);
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType} with two nested children, where children have same visible style as parent, inserted into one initial ${elementType} with different style will remove all redundant spans`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const child = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }, { [style]: valueArr[2] }], child + child);
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[2] }], 'childchild');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType} with two nested children, where one child has same visible style as parent, inserted into one initial ${elementType} with different style will remove all redundant spans`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const firstChild = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[2] }], 'child');
        const secondChild = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }, { [style]: valueArr[2] }], firstChild + secondChild);
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[2] }], 'child' + secondChild);
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType} with two nested children, where one child matches redundant parent style, inserted into one initial ${elementType} with different style will remove all redundant spans`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const firstChild = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'child');
        const secondChild = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[1] }], 'child');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }, { [style]: valueArr[2] }], firstChild + secondChild);
        const expectedSecondChild = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'child');
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[2] }], firstChild + expectedSecondChild);
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });
    });

    const testMergingNonInheritableStyles = (style: string, valueArr: string[]) => context(`Inserting nested ${elementType} elements with noninheritable ${style} styles won't merge`, () => {
      it(`TINY-10869: ${elementType}s with noninheritable ${style} style inserted into one initial ${elementType} with same style won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType}s with one noninheritable ${style} style inserted into initial ${elementType} with different style won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType}s with two noninheritable ${style} styles inserted into initial ${elementType} with same style won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType}s with two noninheritable ${style} styles inserted into nested initial ${elementType} with both same ${style} styles won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [style]: valueArr[0] }, { [style]: valueArr[1] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType} with noninheritable ${style} and ${conditionalNonInheritableStyle} inserted into initial ${elementType} with same ${conditionalNonInheritableStyle} won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0], [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType} with noninheritable ${style} and ${conditionalNonInheritableStyle} inserted into initial ${elementType} with same ${conditionalNonInheritableStyle} and ${style} won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0], [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0], [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0], [style]: valueArr[1] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType} with noninheritable ${style} and ${conditionalNonInheritableStyle} inserted into nested initial ${elementType} with same ${conditionalNonInheritableStyle} and ${style} styles won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0], [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: ${elementType} with noninheritable ${style} and ${conditionalNonInheritableStyle} inserted into nested initial ${elementType} with different ${conditionalNonInheritableStyle} and ${style} styles won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[1], [style]: valueArr[0] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType}s with noninheritable ${style} and ${conditionalNonInheritableStyle} ${elementType}s inserted into nested initial ${elementType} with different ${conditionalNonInheritableStyle} but same ${style} won't merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[1] }, { [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], `te${inserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType}s with noninheritable ${style} and ${conditionalNonInheritableStyle} ${elementType}s inserted into nested initial ${elementType} with same ${conditionalNonInheritableStyle} will merge`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], 'test');
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0 ], 2);
      });

      it(`TINY-10869: Nested ${elementType}s with noninheritable ${style} and ${conditionalNonInheritableStyle} ${elementType}s inserted into nested initial ${elementType} with same styles will only merge ${conditionalNonInheritableStyle}`, () => {
        const initial = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], 'test');
        const inserted = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], 'test');
        const expectedInserted = buildNestedInlineElements(elementType, [{ [style]: valueArr[1] }], 'test');
        const expected = buildNestedInlineElements(elementType, [{ [conditionalNonInheritableStyle]: colorStyleValues[0] }, { [style]: valueArr[1] }], `te${expectedInserted}st`);
        testMergeNestedElements(initial, inserted, expected, [ 0, 0, 0, 0 ], 2);
      });
    });

    Arr.each(colorStyles, (colorStyle) => {
      testMergingSameStyle(colorStyle, colorStyleValues);
      testMergingChildrenSameStyle(colorStyle, colorStyleValues);
      const otherStyles = Arr.difference(colorStyles, [ colorStyle ]);
      Arr.each(otherStyles, (otherStyle) => testMergingDifferentStyles(colorStyle, colorStyleValues, otherStyle, colorStyleValues));
      Arr.each(pixelStyles, (pixelStyle) => testMergingDifferentStyles(colorStyle, colorStyleValues, pixelStyle, pixelStyleValues));
    });

    Arr.each(pixelStyles, (pixelStyle) => {
      testMergingSameStyle(pixelStyle, pixelStyleValues);
      testMergingChildrenSameStyle(pixelStyle, pixelStyleValues);

      const otherStyles = Arr.difference(pixelStyles, [ pixelStyle ]);
      Arr.each(otherStyles, (otherStyle) => testMergingDifferentStyles(pixelStyle, pixelStyleValues, otherStyle, pixelStyleValues));
      Arr.each(colorStyles, (colorStyle) => testMergingDifferentStyles(pixelStyle, pixelStyleValues, colorStyle, colorStyleValues));
    });

    Arr.each(nonInheritableColorStyles, (colorStyle) => testMergingNonInheritableStyles(colorStyle, colorStyleValues));
    Arr.each(nonInheritablePixelStyles, (pixelStyle) => testMergingNonInheritableStyles(pixelStyle, pixelStyleValues));
  });
});
