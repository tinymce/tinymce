import { Gene } from './Gene';

export default function (id: string, text: string) {
  return Gene(id, 'COMMENT_GENE', [], {}, {}, text);
}
