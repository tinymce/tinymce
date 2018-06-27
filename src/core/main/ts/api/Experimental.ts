import Annotator, { Annotator as AnnotatorInterface } from './Annotator';

export interface Experimental {
  annotator: AnnotatorInterface;
}

export default function (editor): Experimental {
  const annotator = Annotator(editor);
  const experimental = { };

  Object.defineProperty(experimental, 'annotator', {
    get: () => {
      // tslint:disable no-console
      console.warn('Using experimental API: annotator');
      // tslint:enable no-console
      return annotator;
    }
  });

  return experimental as Experimental;
}