import type { Language } from '../types.ts';
import { shuffle } from './random.ts';

export interface TeamDivisionPlan {
  teamCount: number;
  teamSizes: number[];
  largerCount: number;
  largerSize: number;
  smallerCount: number;
  smallerSize: number;
}

/**
 * Calculates fair team distribution according to specifications:
 * - Sum of team sizes equals participantCount.
 * - Max size difference between any two teams is at most 1 (except Tandem trio vs pair where diff is also 1).
 * - For participantCount >= 2, no team ever has 1 person (unless participantCount == 1).
 * - In Tandem mode (bySize with target 2):
 *   - Even N: N / 2 pairs of size 2.
 *   - Odd N: exactly 1 trio of size 3 and (N - 3) / 2 pairs of size 2.
 * - General bySize with target n:
 *   - Rest r < n / 2: distributed onto existing teams.
 *   - Rest r >= n / 2: forms an additional smaller team, provided it does not create a 1-person team.
 */
export function calculateTeamPlan(
  participantCount: number,
  mode: 'byCount' | 'bySize',
  settingValue: number
): TeamDivisionPlan {
  const N = Math.max(0, participantCount);

  if (N <= 1) {
    const count = N === 1 ? 1 : 0;
    const sizes = N === 1 ? [1] : [];
    return {
      teamCount: count,
      teamSizes: sizes,
      largerCount: count,
      largerSize: N,
      smallerCount: 0,
      smallerSize: N,
    };
  }

  let K: number;

  if (mode === 'byCount') {
    // Setting value is number of teams (min 2, max N)
    const targetTeams = Math.max(2, settingValue);
    K = Math.min(targetTeams, N);
  } else {
    // Mode 'bySize': setting value is target team size n (min 2)
    const targetSize = Math.max(2, settingValue);

    if (targetSize === 2) {
      // Tandem mode:
      // Even N: N / 2 pairs.
      // Odd N: 1 trio + (N - 3) / 2 pairs => total (N - 1) / 2 teams.
      K = Math.max(1, Math.floor(N / 2));
    } else {
      const q = Math.floor(N / targetSize);
      const r = N % targetSize;

      if (q === 0) {
        // Not enough people for a single full team, all form 1 team
        K = 1;
      } else if (r === 0) {
        K = q;
      } else if (r < targetSize / 2) {
        // Remainder smaller than n / 2: distribute onto existing q teams
        K = q;
      } else {
        // Remainder >= n / 2: form an additional team only if it doesn't create 1-person teams
        const extraTeamsCandidate = q + 1;
        const minSize = Math.floor(N / extraTeamsCandidate);
        K = minSize >= 2 ? extraTeamsCandidate : q;
      }
    }
  }

  // Ensure K is valid
  K = Math.max(1, Math.min(K, N));

  const base = Math.floor(N / K);
  const rem = N % K;

  const largerSize = rem > 0 ? base + 1 : base;
  const largerCount = rem > 0 ? rem : K;
  const smallerSize = base;
  const smallerCount = rem > 0 ? K - rem : 0;

  // Build descending team sizes list: larger teams first, then smaller
  const teamSizes: number[] = [];
  if (rem > 0) {
    for (let i = 0; i < rem; i++) teamSizes.push(base + 1);
    for (let i = 0; i < K - rem; i++) teamSizes.push(base);
  } else {
    for (let i = 0; i < K; i++) teamSizes.push(base);
  }

  return {
    teamCount: K,
    teamSizes,
    largerCount,
    largerSize,
    smallerCount,
    smallerSize,
  };
}

/**
 * Creates human-friendly preview string matching calculateTeamPlan output exactly.
 */
export function formatDivisionPreview(
  plan: TeamDivisionPlan,
  mode: 'byCount' | 'bySize',
  settingValue: number,
  language: Language
): string {
  const isDe = language === 'de';
  const N = plan.teamSizes.reduce((a, b) => a + b, 0);

  if (N < 2) {
    return isDe ? 'Mindestens 2 Personen eintragen' : 'Enter at least 2 people';
  }

  const K = plan.teamCount;
  const pWord = (n: number) => {
    if (isDe) return n === 1 ? 'Person' : 'Personen';
    return n === 1 ? 'person' : 'people';
  };
  const tWord = (n: number) => {
    if (isDe) return n === 1 ? 'Team' : 'Teams';
    return n === 1 ? 'team' : 'teams';
  };

  if (mode === 'byCount') {
    if (K === 1) {
      return isDe
        ? `Ergibt 1 Team mit ${N} ${pWord(N)}`
        : `Results in 1 team with ${N} ${pWord(N)}`;
    }
    if (plan.smallerCount === 0 || plan.largerCount === K) {
      return isDe
        ? `Ergibt ${K} ${tWord(K)} mit je ${plan.largerSize} ${pWord(plan.largerSize)}`
        : `Results in ${K} ${tWord(K)} with ${plan.largerSize} ${pWord(plan.largerSize)} each`;
    }
    return isDe
      ? `Ergibt ${K} ${tWord(K)} (${plan.largerCount}× ${plan.largerSize} ${pWord(plan.largerSize)}, ${plan.smallerCount}× ${plan.smallerSize} ${pWord(plan.smallerSize)})`
      : `Results in ${K} ${tWord(K)} (${plan.largerCount}× ${plan.largerSize} ${pWord(plan.largerSize)}, ${plan.smallerCount}× ${plan.smallerSize} ${pWord(plan.smallerSize)})`;
  }

  // mode === 'bySize'
  const targetSize = Math.max(2, settingValue);

  if (targetSize === 2) {
    // Tandem mode
    if (K === 1) {
      if (N === 2) {
        return isDe ? 'Ergibt 1 Tandem (2 Personen)' : 'Results in 1 pair (2 people)';
      }
      return isDe ? 'Ergibt 1 Dreierteam (3 Personen)' : 'Results in 1 trio (3 people)';
    }

    if (N % 2 === 0) {
      return isDe
        ? `Ergibt ${K} Tandems (je 2 Personen)`
        : `Results in ${K} pairs (2 people each)`;
    }

    // Odd N: K - 1 pairs + 1 trio
    const pairCount = K - 1;
    const pairText = isDe
      ? pairCount === 1
        ? '1 Paar'
        : `${pairCount} Paare`
      : pairCount === 1
      ? '1 pair'
      : `${pairCount} pairs`;
    const trioText = isDe ? '1 Dreierteam' : '1 trio';

    return isDe
      ? `Ergibt ${K} Gruppen (${pairText} + ${trioText})`
      : `Results in ${K} groups (${pairText} + ${trioText})`;
  }

  // bySize with n > 2
  if (K === 1) {
    return isDe
      ? `Ergibt 1 Team mit ${N} ${pWord(N)}`
      : `Results in 1 team with ${N} ${pWord(N)}`;
  }
  if (plan.smallerCount === 0 || plan.largerCount === K) {
    return isDe
      ? `Ergibt ${K} ${tWord(K)} mit je ${plan.largerSize} ${pWord(plan.largerSize)}`
      : `Results in ${K} ${tWord(K)} with ${plan.largerSize} ${pWord(plan.largerSize)} each`;
  }
  return isDe
    ? `Ergibt ${K} ${tWord(K)} (${plan.largerCount}× ${plan.largerSize} ${pWord(plan.largerSize)}, ${plan.smallerCount}× ${plan.smallerSize} ${pWord(plan.smallerSize)})`
    : `Results in ${K} ${tWord(K)} (${plan.largerCount}× ${plan.largerSize} ${pWord(plan.largerSize)}, ${plan.smallerCount}× ${plan.smallerSize} ${pWord(plan.smallerSize)})`;
}

export const pairKey = (a: string, b: string): string => [a, b].sort().join('||');

export const scorePairRepeats = (
  teams: string[][],
  seen: Record<string, number>
): number => {
  let score = 0;
  for (const t of teams) {
    for (let i = 0; i < t.length; i++) {
      for (let j = i + 1; j < t.length; j++) {
        score += seen[pairKey(t[i], t[j])] || 0;
      }
    }
  }
  return score;
};

/**
 * Splits given names into teams according to plan.teamSizes.
 */
export function partitionNames(names: string[], teamSizes: number[]): string[][] {
  const teams: string[][] = [];
  let cursor = 0;
  for (const size of teamSizes) {
    teams.push(names.slice(cursor, cursor + size));
    cursor += size;
  }
  return teams;
}

/**
 * Shuffles names into teams according to plan, minimizing repeat pairings if avoid is true.
 */
export function splitTeams(
  names: string[],
  plan: TeamDivisionPlan,
  seen: Record<string, number> = {},
  avoid: boolean = false
): string[][] {
  if (names.length === 0 || plan.teamSizes.length === 0) return [];

  let best = partitionNames(shuffle(names), plan.teamSizes);
  if (!avoid) return best;

  let bestScore = scorePairRepeats(best, seen);
  for (let i = 0; i < 300 && bestScore > 0; i++) {
    const cand = partitionNames(shuffle(names), plan.teamSizes);
    const score = scorePairRepeats(cand, seen);
    if (score < bestScore) {
      best = cand;
      bestScore = score;
    }
  }
  return best;
}

/**
 * Checks whether an existing team result matches current names and plan.
 */
export function isResultMatchingPlan(
  result: string[][],
  names: string[],
  plan: TeamDivisionPlan
): boolean {
  if (result.length !== plan.teamCount) return false;

  const currentSizes = result.map((t) => t.length);
  const expectedSizes = [...plan.teamSizes];

  // Compare sorted sizes
  const sCurrent = [...currentSizes].sort((a, b) => b - a);
  const sExpected = [...expectedSizes].sort((a, b) => b - a);
  for (let i = 0; i < sCurrent.length; i++) {
    if (sCurrent[i] !== sExpected[i]) return false;
  }

  // Compare participants
  const resultMembers = result.flat().sort();
  const sortedNames = [...names].sort();
  if (resultMembers.length !== sortedNames.length) return false;
  for (let i = 0; i < resultMembers.length; i++) {
    if (resultMembers[i] !== sortedNames[i]) return false;
  }

  return true;
}

/**
 * Round-robin rotation respecting plan sizes and repeat avoidance.
 * If previous result does not match current plan, fresh division is generated first.
 */
export function rotateTeams(
  currentTeams: string[][],
  names: string[],
  plan: TeamDivisionPlan,
  seen: Record<string, number> = {},
  avoid: boolean = false
): string[][] {
  if (names.length < 2 || plan.teamSizes.length < 2) {
    return currentTeams.length > 0 ? currentTeams : splitTeams(names, plan, seen, avoid);
  }

  // If current result doesn't match the current plan or names, re-divide cleanly first
  const matches = isResultMatchingPlan(currentTeams, names, plan);
  const baseTeams = matches ? currentTeams : splitTeams(names, plan, seen, avoid);

  const flat = baseTeams.flat();
  if (flat.length < 2) return baseTeams;

  // Round-robin rotation across circle: participant 0 fixed, others shift clockwise
  const first = flat[0];
  const rest = flat.slice(1);

  if (!avoid) {
    const rotatedRest = [rest[rest.length - 1], ...rest.slice(0, -1)];
    return partitionNames([first, ...rotatedRest], plan.teamSizes);
  }

  // If avoid is true: test all possible cyclic offsets and pick candidate with lowest repeat score
  let bestCandidate = partitionNames([first, rest[rest.length - 1], ...rest.slice(0, -1)], plan.teamSizes);
  let bestScore = scorePairRepeats(bestCandidate, seen);

  for (let shift = 1; shift < rest.length; shift++) {
    const shiftedRest = [...rest.slice(rest.length - shift), ...rest.slice(0, rest.length - shift)];
    const candidate = partitionNames([first, ...shiftedRest], plan.teamSizes);
    const score = scorePairRepeats(candidate, seen);
    if (score < bestScore) {
      bestCandidate = candidate;
      bestScore = score;
      if (bestScore === 0) break;
    }
  }

  return bestCandidate;
}
