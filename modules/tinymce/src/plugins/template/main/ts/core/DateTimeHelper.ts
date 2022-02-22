import Editor from 'tinymce/core/api/Editor';

const addZeros = (value: string | number, len: number): string => {
  value = '' + value;

  if (value.length < len) {
    for (let i = 0; i < (len - value.length); i++) {
      value = '0' + value;
    }
  }

  return value;
};

const getDateTime = (editor: Editor, fmt: string, date: Date = new Date()): string => {
  const daysShort = 'Sun Mon Tue Wed Thu Fri Sat Sun'.split(' ');
  const daysLong = 'Sunday Monday Tuesday Wednesday Thursday Friday Saturday Sunday'.split(' ');
  const monthsShort = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' ');
  const monthsLong = 'January February March April May June July August September October November December'.split(' ');

  fmt = fmt.replace('%D', '%m/%d/%Y');
  fmt = fmt.replace('%r', '%I:%M:%S %p');
  fmt = fmt.replace('%Y', '' + date.getFullYear());
  fmt = fmt.replace('%y', '' + (date as any).getYear());
  fmt = fmt.replace('%m', addZeros(date.getMonth() + 1, 2));
  fmt = fmt.replace('%d', addZeros(date.getDate(), 2));
  fmt = fmt.replace('%H', '' + addZeros(date.getHours(), 2));
  fmt = fmt.replace('%M', '' + addZeros(date.getMinutes(), 2));
  fmt = fmt.replace('%S', '' + addZeros(date.getSeconds(), 2));
  fmt = fmt.replace('%I', '' + ((date.getHours() + 11) % 12 + 1));
  fmt = fmt.replace('%p', '' + (date.getHours() < 12 ? 'AM' : 'PM'));
  fmt = fmt.replace('%B', '' + editor.translate(monthsLong[date.getMonth()]));
  fmt = fmt.replace('%b', '' + editor.translate(monthsShort[date.getMonth()]));
  fmt = fmt.replace('%A', '' + editor.translate(daysLong[date.getDay()]));
  fmt = fmt.replace('%a', '' + editor.translate(daysShort[date.getDay()]));
  fmt = fmt.replace('%%', '%');

  return fmt;
};

export {
  getDateTime
};
