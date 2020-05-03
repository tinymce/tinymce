import { ApproxStructure, Assertions, Step } from '@ephox/agar';
import { Element } from '@ephox/dom-globals';
import { Arr, Obj } from '@ephox/katamari';
import { TinyApis } from '@ephox/mcagar';
import { Element as SugarElement } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';

const sAnnotate = <T> (editor: Editor, name: string, uid: string, data: { }): Step<T, T> =>
  Step.sync(() => {
    editor.annotator.annotate(name, {
      uid,
      ...data
    });
  });

// This will result in an attribute order-insensitive HTML assertion
const sAssertHtmlContent = <T> (tinyApis: TinyApis, children: string[], allowExtras?: boolean): Step<T, T> => tinyApis.sAssertContentStructure(
  ApproxStructure.build((s, _str, _arr) => s.element('body', {
    children: Arr.map(children, ApproxStructure.fromHtml).concat(allowExtras ? [ s.theRest() ] : [ ])
  }))
);

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

const sAssertGetAll = (editor: Editor, expected: Record<string, number>, name: string) => Step.sync(() => {
  const annotations = editor.annotator.getAll(name);
  const keys = Obj.keys(annotations);
  const sortedKeys = Arr.sort(keys);
  const expectedKeys = Arr.sort(Obj.keys(expected));
  Assertions.assertEq('Checking keys of getAll response', expectedKeys, sortedKeys);
  Obj.each(annotations, (markers, uid) => {
    Assertions.assertEq('Checking number of markers for uid', expected[uid], markers.length);
    assertMarker(editor, { uid, name }, markers);
  });
});

export {
  sAnnotate,
  sAssertHtmlContent,
  sAssertGetAll,
  assertMarker
};
