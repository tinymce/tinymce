const parse = (timeString: string): number => {
  const multiples: Record<string, number> = {
    s: 1000,
    m: 60000
  };

  const parsedTime = /^(\d+)([ms]?)$/.exec(timeString);
  return (parsedTime && parsedTime[2] ? multiples[parsedTime[2]] : 1) * parseInt(timeString, 10);
};

export {
  parse
};
