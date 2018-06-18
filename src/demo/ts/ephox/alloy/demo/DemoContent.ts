const generate = (num) => {
  let s = '';
  for (let i = 0; i < num; i++) {
    s += '<p>Paragraph ' + i + ' is on this line, and it is quite long</p>';
  }
  return s;
};

export {
  generate
};