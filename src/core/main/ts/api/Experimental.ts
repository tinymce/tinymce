import Annotator, { Annotator as AnnotatorInterface } from './Annotator';

export interface Experimental {
  annotator: AnnotatorInterface;
}

export default function (editor): Experimental {
  return {
    annotator: Annotator(editor)
  };
}