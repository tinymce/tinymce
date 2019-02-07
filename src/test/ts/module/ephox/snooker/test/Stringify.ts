import { Arr } from '@ephox/katamari';

const celltype = function (subject) {
  return subject.fold(function () {
    return 'none';
  }, function (info) {
    return 'whole-' + info.element();
  }, function (info, offset) {
    return 'partial-' + info.element() + '-' + offset;
  });
};

const celltypes = function (subject) {
  return Arr.map(subject, celltype);
};

const detail = function (subject) {
  return subject.element() + '---' + subject.rowspan() + 'x' + subject.colspan();
};

const it = function (subject) {
  return subject.element();
};

export default {
  celltype,
  celltypes,
  detail,
  it
};