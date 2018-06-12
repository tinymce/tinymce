import { Step, ApproxStructure } from '@ephox/agar';
import { Arr } from '@ephox/katamari';

const sAnnotate = (editor, name, uid, data) => Step.sync(() => {
  editor.annotator.annotate(name, {
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

export {
  sAnnotate,
  sAssertHtmlContent
};