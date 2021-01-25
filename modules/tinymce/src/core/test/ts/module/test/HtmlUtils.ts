import SaxParser from 'tinymce/core/api/html/SaxParser';
import Writer from 'tinymce/core/api/html/Writer';

const cleanHtml = (html: string): string => {
  return html.toLowerCase().replace(/[\r\n]+/gi, '')
    .replace(/ (sizcache[0-9]+|sizcache|nodeindex|sizset[0-9]+|sizset|data\-mce\-expando|data\-mce\-selected)="[^"]*"/gi, '')
    .replace(/<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\/span>|<div[^>]+data-mce-bogus[^>]+><\/div>/gi, '')
    .replace(/ style="([^"]+)"/gi, (val1, val2) => {
      val2 = val2.replace(/;$/, '');
      return ' style="' + val2.replace(/\:([^ ])/g, ': $1') + ';"';
    });
};

const normalizeHtml = (html: string): string => {
  const writer = Writer();

  SaxParser({
    validate: false,
    comment: writer.comment,
    cdata: writer.cdata,
    text: writer.text,
    end: writer.end,
    pi: writer.pi,
    doctype: writer.doctype,

    start: (name, attrs, empty) => {
      attrs.sort((a, b) => {
        if (a.name === b.name) {
          return 0;
        }

        return a.name > b.name ? 1 : -1;
      });

      writer.start(name, attrs, empty);
    }
  }).parse(html);

  return writer.getContent();
};

export {
  cleanHtml,
  normalizeHtml
};
