const cycleBy = function (value, delta, min, max) {
  const r = value + delta;
  if (r > max) { return min; } else { return r < min ? max : r; }
};

const cap = function (value, min, max) {
  if (value <= min) { return min; } else { return value >= max ? max : value; }
};

export {
  cycleBy,
  cap
};