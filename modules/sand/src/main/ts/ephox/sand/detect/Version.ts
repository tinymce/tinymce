export interface Version {
  readonly major: number;
  readonly minor: number;
}

const firstMatch = (regexes: RegExp[], s: string): RegExp | undefined => {
  for (let i = 0; i < regexes.length; i++) {
    const x = regexes[i];
    if (x.test(s)) {
      return x;
    }
  }
  return undefined;
};

const find = (regexes: RegExp[], agent: string): Version => {
  const r = firstMatch(regexes, agent);
  if (!r) {
    return { major: 0, minor: 0 };
  }
  const group = (i: number) => {
    return Number(agent.replace(r, '$' + i));
  };
  return nu(group(1), group(2));
};

const detect = (versionRegexes: RegExp[], agent: any): Version => {
  const cleanedAgent = String(agent).toLowerCase();

  if (versionRegexes.length === 0) {
    return unknown();
  }
  return find(versionRegexes, cleanedAgent);
};

const unknown = (): Version => {
  return nu(0, 0);
};

const nu = (major: number, minor: number): Version => {
  return { major, minor };
};

export const Version = {
  nu,
  detect,
  unknown
};
