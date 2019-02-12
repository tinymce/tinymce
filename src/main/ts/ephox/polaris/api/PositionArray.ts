import Generator from '../parray/Generator';
import Query from '../parray/Query';
import Split from '../parray/Split';
import Translate from '../parray/Translate';

const generate = Generator.make;

const get = Query.get;

const find = Query.find;

const splits = Split.splits;

const translate = Translate.translate;

const sublist = Query.sublist;

export default {
  generate,
  get,
  find,
  splits,
  translate,
  sublist
};