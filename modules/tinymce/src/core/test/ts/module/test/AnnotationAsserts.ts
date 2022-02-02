import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';
import { TinyAssertions } from '@ephox/wrap-mcagar';
import { assert } from 'chai';

import Editor from 'tinymce/core/api/Editor';

const annotate = (editor: Editor, name: string, uid: string, data: { }) => {
  editor.annotator.annotate(name, {
    uid,
    ...data
  });
};

const sAnnotate = <T> (editor: Editor, name: string, uid: string, data: { }): Step<T, T> =>
  Step.sync(() => annotate(editor, name, uid, data));

// This will result in an attribute order-insensitive HTML assertion
const assertHtmlContent = (editor: Editor, children: string[], allowExtras?: boolean) => {
  TinyAssertions.assertContentStructure(editor,
    ApproxStructure.build((s, _str, _arr) => s.element('body', {
      children: Arr.map(children, ApproxStructure.fromHtml).concat(allowExtras ? [ s.theRest() ] : [ ])
    }))
  );
};

const sAssertHtmlContent = <T> (editor: Editor, children: string[], allowExtras?: boolean): Step<T, T> =>
  Step.sync(() => assertHtmlContent(editor, children, allowExtras));

const assertMarker = (editor: Editor, expected: { uid: string; name: string}, nodes: Element[]) => {
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

const assertGetAll = (editor: Editor, expected: Record<string, number>, name: string) => {
  const annotations = editor.annotator.getAll(name);
  const keys = Obj.keys(annotations);
  const expectedKeys = Obj.keys(expected);
  assert.sameMembers(keys, expectedKeys, 'Checking keys of getAll response');
  Obj.each(annotations, (markers, uid) => {
    Assertions.assertEq('Checking number of markers for uid', expected[uid], markers.length);
    assertMarker(editor, { uid, name }, markers);
  });
};

const sAssertGetAll = (editor: Editor, expected: Record<string, number>, name: string) =>
  Step.sync(() => assertGetAll(editor, expected, name));

export {
  sAnnotate,
  sAssertHtmlContent,
  sAssertGetAll,
  assertMarker,
  annotate,
  assertHtmlContent,
  assertGetAll
};
