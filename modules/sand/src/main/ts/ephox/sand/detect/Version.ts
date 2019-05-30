export interface Version {
  major: number;
  minor: number;
}

const firstMatch = function (regexes: RegExp[], s: string): RegExp | undefined {
  for (let i = 0; i < regexes.length; i++) {
    const x = regexes[i];
    if (x.test(s)) return x;
  }
  return undefined;
};

const find = function (regexes: RegExp[], agent: string): Version {
  const r = firstMatch(regexes, agent);
  if (!r) return { major : 0, minor : 0 };
  const group = function(i: number) {
    return Number(agent.replace(r, '$' + i));
  };
  return nu(group(1), group(2));
};

const detect = function (versionRegexes: RegExp[], agent: any): Version {
  const cleanedAgent = String(agent).toLowerCase();

  if (versionRegexes.length === 0) return unknown();
  return find(versionRegexes, cleanedAgent);
};

const unknown = function (): Version {
  return nu(0, 0);
};

const nu = function (major: number, minor: number): Version {
  return { major: major, minor: minor };
};

export const Version = {
  nu,
  detect,
  unknown
};