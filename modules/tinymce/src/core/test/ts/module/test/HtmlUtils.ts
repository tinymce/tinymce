const cleanHtml = (html: string): string => {
  return html.toLowerCase().replace(/[\r\n]+/gi, '')
    .replace(/ (sizcache[0-9]+|sizcache|nodeindex|sizset[0-9]+|sizset|data\-mce\-expando|data\-mce\-selected)="[^"]*"/gi, '')
    .replace(/<span[^>]+data-mce-bogus[^>]+>[\u200B\uFEFF]+<\/span>|<div[^>]+data-mce-bogus[^>]+><\/div>/gi, '')
    .replace(/ style="([^"]+)"/gi, (val1, val2) => {
      val2 = val2.replace(/;$/, '');
      return ' style="' + val2.replace(/\:([^ ])/g, ': $1') + ';"';
    });
};

export {
  cleanHtml
};
