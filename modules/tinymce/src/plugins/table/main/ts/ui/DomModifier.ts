import Editor from 'tinymce/core/api/Editor';

export interface DomModifier {
  readonly setAttrib: (attr: string, value: string) => void;
  readonly setStyle: (prop: string, value: string) => void;
  readonly setFormat: (formatName: string, value: string) => void;
}

// The get node is required here because it can be transformed
// when switching between tags (e.g. th and td)
const normal = (editor: Editor, element: Element): DomModifier => {
  const dom = editor.dom;

  const setAttrib = (attr: string, value: string) => {
    dom.setAttrib(element, attr, value);
  };

  const setStyle = (prop: string, value: string) => {
    dom.setStyle(element, prop, value);
  };

  const setFormat = (formatName: string, value: string) => {
    // Remove format if given an empty string
    if (value === '') {
      editor.formatter.remove(formatName, { value: null }, element, true);
    } else {
      editor.formatter.apply(formatName, { value }, element);
    }
  };

  return {
    setAttrib,
    setStyle,
    setFormat
  };
};

export const DomModifier = {
  normal
};
