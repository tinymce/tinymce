import { Entry } from './Entry';

export const enum Indentation {
  Indent = 'Indent',
  Outdent = 'Outdent',
  Flatten = 'Flatten'
}

export const indentEntry = (indentation: Indentation, entry: Entry): void => {
  switch (indentation) {
    case Indentation.Indent:
      entry.depth++;
      break;

    case Indentation.Outdent:
      entry.depth--;
      break;

    case Indentation.Flatten:
      entry.depth = 0;
  }
  entry.dirty = true;
};
