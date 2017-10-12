export const activateFilter = (activeFilterMask, filterFlag) => {
  return ~~activeFilterMask | filterFlag; // 1010 | 0001 => 1011
};

export const toggleFilter = (activeFilterMask, filterFlag) => {
  return ~~activeFilterMask ^ filterFlag; // 1010 | 0001 => 1011
};

export const deactivateFilter = (activeFilterMask, filterFlag) => {
  const mask = ~~activeFilterMask;
  return Math.min(mask ^ filterFlag, mask); // 0010 ^ 0011 => 0001
};

export const createFilterFlags = (uniqueArray = []) => {
  return uniqueArray.reduce(
    (acc, cur, i) =>
      Object.assign({}, acc, {
        [cur]: 1 << i
      }),
    {}
  );
};

export const createMask = (toMaskArray = [], flags) => {
  return toMaskArray.reduce(
    (mask, itemInMask) => activateFilter(mask, flags[itemInMask]),
    0
  );
};

export const qualifyDisjunction = (bitmask, candidateMask) => {
  // Or
  return Boolean(bitmask & candidateMask);
};
export const qualifyConjunction = (bitmask, candidateMask) => {
  // And
  return (bitmask & candidateMask) === bitmask;
};

// Checking a bit

// To check a bit, shift the number x to the right, then bitwise AND it:
// bit = (number >> x) & 1;
// That will put the value of bit x into the variable bit

export const getActiveFlags = (bitmask, set) => {
  let i = 0;
  let remaining = bitmask;
  const matches = [];
  while (remaining) {
    const bit = 1 << i;
    if (remaining & bit) {
      remaining -= bit;
      matches.push(set[i]);
    }
    i++;
  }
  return matches;
};

// Wrappers
export const createBranch = set => {
  const arrayFromSet = Array.from(set);
  return {
    set: arrayFromSet,
    flags: createFilterFlags(arrayFromSet)
  };
};

export const qualifyMask = (branch, candidateMask) => {
  const activeQualifier = branch.disjunctive ? qualifyDisjunction : qualifyConjunction;
  return activeQualifier(branch.bitmask, candidateMask);
};
export const getActiveFlagsFromBranch = branch => {
  return getActiveFlags(branch.bitmask, branch.set);
};
