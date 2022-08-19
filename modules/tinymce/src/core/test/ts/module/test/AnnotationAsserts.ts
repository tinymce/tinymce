import { ApproxStructure, Assertions } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import * as Markings from 'tinymce/core/annotate/Markings';
import Editor from 'tinymce/core/api/Editor';

const annotate = (editor: Editor, name: string, uid: string, data: {}): void => {
  editor.annotator.annotate(name, {
    uid,
    ...data
  });
};

// This will result in an attribute order-insensitive HTML assertion
const assertHtmlContent = (editor: Editor, children: string[], allowExtras?: boolean): void => {
  TinyAssertions.assertContentStructure(editor,
    ApproxStructure.build((s, _str, _arr) => s.element('body', {
      children: Arr.map(children, ApproxStructure.fromHtml).concat(allowExtras ? [ s.theRest() ] : [])
    }))
  );
};

const assertMarker = (editor: Editor, expected: { uid: string; name: string }, nodes: Element[]): void => {
  const { uid, name } = expected;
  Arr.each(nodes, (node) => {
    Assertions.assertEq('Wrapper must be in content', true, editor.getBody().contains(node));
    Assertions.assertStructure(
      'Checking wrapper has correct decoration',
      ApproxStructure.build((s, str, _arr) => s.element('span', {
        attrs: {
          'data-mce-annotation': str.is(name),
          'data-mce-annotation-uid': str.is(uid)
        }
      })),
      SugarElement.fromDom(node)
    );
  });
};

const assertGetAll = (editor: Editor, expected: Record<string, number>, name: string): void => {
  const annotations = editor.annotator.getAll(name);
  const keys = Obj.keys(annotations);
  const expectedKeys = Obj.keys(expected);
  assert.sameMembers(keys, expectedKeys, 'Checking keys of getAll response');
  Obj.each(annotations, (markers, uid) => {
    Assertions.assertEq('Checking number of markers for uid', expected[uid], markers.length);
    assertMarker(editor, { uid, name }, markers);
  });
};

const assertMarkings = (editor: Editor, expectedSpanAnnotations: number, expectedBlockAnnotations: number): void => {
  const annotation = Markings.annotation();
  const dataAnnotation = Markings.dataAnnotation();
  const dataAnnotationId = Markings.dataAnnotationId();
  // Not checking active as this is not applied synchronously
  // const dataAnnotationActive = Markings.dataAnnotationActive();
  const dataAnnotationClasses = Markings.dataAnnotationClasses();
  const dataAnnotationAttributes = Markings.dataAnnotationAttributes();

  const expectedTotalCount = expectedSpanAnnotations + expectedBlockAnnotations;

  TinyAssertions.assertContentPresence(editor, {
    [`.${annotation}`]: expectedTotalCount,
    [`[${dataAnnotation}]`]: expectedTotalCount,
    [`[${dataAnnotationId}]`]: expectedTotalCount,
    [`span.${annotation}`]: expectedSpanAnnotations,
    [`span[${dataAnnotation}]`]: expectedSpanAnnotations,
    [`span[${dataAnnotationId}]`]: expectedSpanAnnotations,
    [`[${dataAnnotationClasses}]`]: expectedBlockAnnotations,
    [`[${dataAnnotationAttributes}]`]: expectedBlockAnnotations
  });
};

export {
  assertMarker,
  annotate,
  assertHtmlContent,
  assertGetAll,
  assertMarkings
};
