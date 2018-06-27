import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { Arr, Obj } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import { Editor } from 'tinymce/core/api/Editor';

const sAnnotate = (editor: Editor, name: string, uid: string, data: { }) => Step.sync(() => {
  editor.experimental.annotator.annotate(name, {
    uid,
    ...data
  });
});

// This will result in an attribute order-insensitive HTML assertion
const sAssertHtmlContent = (tinyApis, children: string[]) => {
  return tinyApis.sAssertContentStructure(
    ApproxStructure.build((s, str, arr) => {
      return s.element('body', {
        children: Arr.map(children, ApproxStructure.fromHtml)
      });
    })
  );
};

const assertMarker = (editor: Editor, expected, nodes: any[]) => {
  const { uid, name } = expected;
  Arr.each(nodes, (node) => {
    Assertions.assertEq('Wrapper must be in content', true, editor.getBody().contains(node));
    Assertions.assertStructure(
      'Checking wrapper has correct decoration',
      ApproxStructure.build((s, str, arr) => {
        return s.element('span', {
          attrs: {
            'data-mce-annotation': str.is(name),
            'data-mce-annotation-uid': str.is(uid)
          }
        });
      }),
      Element.fromDom(node)
    );
  });
};

const sAssertGetAll = (editor: Editor, expected: Record<string, number>, name: string) => Step.sync(() => {
  const annotations = editor.experimental.annotator.getAll(name);
  const keys = Obj.keys(annotations);
  const sortedKeys = Arr.sort(keys);
  const expectedKeys = Arr.sort(Obj.keys(expected));
  Assertions.assertEq('Checking keys of getAll response', expectedKeys, sortedKeys);
  Obj.each(annotations, (markers, uid) => {
    Assertions.assertEq('Checking number of markers for uid', expected[uid], markers.length);
    Arr.each(markers, (marker) => {
      assertMarker(editor, { uid, name }, marker);
    });
  });
});

export {
  sAnnotate,
  sAssertHtmlContent,
  sAssertGetAll,
  assertMarker
};