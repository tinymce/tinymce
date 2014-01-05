define(
  'ephox.snooker.test.Stringify',

  [
    'ephox.compass.Arr'
  ],

  function (Arr) {
    var celltype = function (subject) {
      return subject.fold(function () {
        return 'none';
      }, function (info) {
        return 'whole-' + info.element();
      }, function (info, offset) {
        return 'partial-' + info.element() + '-' + offset;
      });
    };

    var celltypes = function (subject) {
      return Arr.map(subject, celltype);
    };

    var detail = function (subject) {
      return subject.element() + '---' + subject.rowspan() + 'x' + subject.colspan();
    };

    var it = function (subject) {
      return subject.element();
    };

    return {
      celltype: celltype,
      celltypes: celltypes,
      detail: detail,
      it: it
    };
  }
);
