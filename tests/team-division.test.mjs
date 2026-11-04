import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTeamPlan,
  formatDivisionPreview,
  splitTeams,
  rotateTeams,
  isResultMatchingPlan,
  scorePairRepeats,
  pairKey,
} from '../src/utils/teamDivision.ts';

describe('Team Division Calculations (2 to 30 people)', () => {
  test('Tandem mode (bySize, target=2) for 7 people produces 2 pairs + 1 trio', () => {
    const plan = calculateTeamPlan(7, 'bySize', 2);
    assert.equal(plan.teamCount, 3, '7 people should yield 3 teams');
    assert.deepEqual(plan.teamSizes, [3, 2, 2], 'Sizes must be [3, 2, 2]');
    assert.equal(plan.teamSizes.reduce((a, b) => a + b, 0), 7, 'Sum of sizes must be 7');

    const previewDe = formatDivisionPreview(plan, 'bySize', 2, 'de');
    assert.equal(previewDe, 'Ergibt 3 Gruppen (2 Paare + 1 Dreierteam)');

    const previewEn = formatDivisionPreview(plan, 'bySize', 2, 'en');
    assert.equal(previewEn, 'Results in 3 groups (2 pairs + 1 trio)');
  });

  test('Tandem mode (bySize, target=2) across all N from 2 to 30', () => {
    for (let N = 2; N <= 30; N++) {
      const plan = calculateTeamPlan(N, 'bySize', 2);

      // 1. Sum of team sizes = N
      const sum = plan.teamSizes.reduce((a, b) => a + b, 0);
      assert.equal(sum, N, `Sum of team sizes for N=${N} must be ${N}`);

      // 2. No team has size 1 (since N >= 2)
      for (const size of plan.teamSizes) {
        assert.ok(size >= 2, `No team can have size < 2 (found ${size} for N=${N})`);
      }

      // 3. Difference between max and min is at most 1
      const max = Math.max(...plan.teamSizes);
      const min = Math.min(...plan.teamSizes);
      assert.ok(max - min <= 1, `Max difference must be <= 1 for N=${N} (was ${max - min})`);

      // 4. Exact Tandem Trio requirement:
      if (N % 2 === 0) {
        // Even N: all teams have size 2
        assert.equal(max, 2, `Even N=${N} must only have pairs of 2`);
        assert.equal(min, 2, `Even N=${N} must only have pairs of 2`);
        assert.equal(plan.teamCount, N / 2);
      } else {
        // Odd N: exactly 1 trio (size 3) and (N - 3) / 2 pairs (size 2)
        const trios = plan.teamSizes.filter((s) => s === 3).length;
        const pairs = plan.teamSizes.filter((s) => s === 2).length;
        assert.equal(trios, 1, `Odd N=${N} must have exactly 1 trio`);
        assert.equal(pairs, (N - 3) / 2, `Odd N=${N} pairs count mismatch`);
        assert.equal(plan.teamCount, Math.floor(N / 2));
      }
    }
  });

  test('General bySize mode across all N from 2 to 30 and target sizes 2 to 10', () => {
    for (let N = 2; N <= 30; N++) {
      for (let targetSize = 2; targetSize <= Math.min(10, N); targetSize++) {
        const plan = calculateTeamPlan(N, 'bySize', targetSize);

        // Sum equals N
        const sum = plan.teamSizes.reduce((a, b) => a + b, 0);
        assert.equal(sum, N, `Sum mismatch for N=${N}, size=${targetSize}`);

        // No team ever has size 1 (when N >= 2)
        for (const size of plan.teamSizes) {
          assert.ok(
            size >= 2,
            `Team size < 2 forbidden for N=${N}, size=${targetSize} (found size ${size})`
          );
        }

        // Difference between teams <= 1
        const max = Math.max(...plan.teamSizes);
        const min = Math.min(...plan.teamSizes);
        assert.ok(
          max - min <= 1,
          `Max difference > 1 for N=${N}, size=${targetSize} (max=${max}, min=${min})`
        );
      }
    }
  });

  test('Mode byCount across all N from 2 to 30 and team counts 2 to 8', () => {
    for (let N = 2; N <= 30; N++) {
      const maxK = Math.min(8, N);
      for (let k = 2; k <= maxK; k++) {
        const plan = calculateTeamPlan(N, 'byCount', k);

        // Sum equals N
        const sum = plan.teamSizes.reduce((a, b) => a + b, 0);
        assert.equal(sum, N, `Sum mismatch for N=${N}, k=${k}`);

        // Team count matches requested K
        assert.equal(plan.teamCount, k, `Team count mismatch for N=${N}, k=${k}`);

        // Difference between max and min team size <= 1
        const max = Math.max(...plan.teamSizes);
        const min = Math.min(...plan.teamSizes);
        assert.ok(
          max - min <= 1,
          `Difference > 1 for N=${N}, k=${k} (max=${max}, min=${min})`
        );

        // No team has 0 size
        assert.ok(min >= 1, `Team cannot have 0 size`);

        // If N >= 2*k, no team has size 1
        if (N >= 2 * k) {
          assert.ok(min >= 2, `When N >= 2*k, no team should have size 1`);
        }
      }
    }
  });

  test('Preview text matches split result dimensions exactly', () => {
    const testCases = [
      { N: 7, mode: 'bySize', val: 2, expectedK: 3, expectedSizes: [3, 2, 2] },
      { N: 6, mode: 'bySize', val: 2, expectedK: 3, expectedSizes: [2, 2, 2] },
      { N: 3, mode: 'bySize', val: 2, expectedK: 1, expectedSizes: [3] },
      { N: 7, mode: 'byCount', val: 2, expectedK: 2, expectedSizes: [4, 3] },
      { N: 7, mode: 'byCount', val: 3, expectedK: 3, expectedSizes: [3, 2, 2] },
      { N: 10, mode: 'bySize', val: 4, expectedK: 3, expectedSizes: [4, 3, 3] },
    ];

    for (const tc of testCases) {
      const names = Array.from({ length: tc.N }, (_, i) => `Person ${i + 1}`);
      const plan = calculateTeamPlan(tc.N, tc.mode, tc.val);

      assert.equal(plan.teamCount, tc.expectedK);
      assert.deepEqual(plan.teamSizes, tc.expectedSizes);

      const split = splitTeams(names, plan);
      assert.equal(split.length, tc.expectedK);
      assert.deepEqual(
        split.map((t) => t.length),
        tc.expectedSizes
      );
    }
  });

  test('isResultMatchingPlan detects changes when settings or names change', () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const plan7Tandem = calculateTeamPlan(7, 'bySize', 2);
    const result = splitTeams(names, plan7Tandem);

    assert.ok(isResultMatchingPlan(result, names, plan7Tandem), 'Should match original plan');

    // 1. Participant removed
    const names6 = ['A', 'B', 'C', 'D', 'E', 'F'];
    assert.ok(
      !isResultMatchingPlan(result, names6, plan7Tandem),
      'Should not match when participant list changes'
    );

    // 2. Settings changed to 2 teams
    const plan7ByCount2 = calculateTeamPlan(7, 'byCount', 2);
    assert.ok(
      !isResultMatchingPlan(result, names, plan7ByCount2),
      'Should not match when settings change to 2 teams'
    );
  });

  test('rotateTeams handles settings mismatch and respects avoid option', () => {
    const names = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    const plan = calculateTeamPlan(7, 'bySize', 2);
    const round1 = splitTeams(names, plan);

    // Track round1 pairings
    const seen = {};
    for (const t of round1) {
      for (let i = 0; i < t.length; i++) {
        for (let j = i + 1; j < t.length; j++) {
          const k = pairKey(t[i], t[j]);
          seen[k] = (seen[k] || 0) + 1;
        }
      }
    }

    // Round 2 rotation with avoid = true
    const round2 = rotateTeams(round1, names, plan, seen, true);
    assert.equal(round2.length, 3, 'Must maintain 3 teams');
    assert.deepEqual(round2.map((t) => t.length).sort((a, b) => b - a), [3, 2, 2]);

    // Check repeat score
    const repeats = scorePairRepeats(round2, seen);
    // Rotating 7 people in 3 teams with a trio: repeat score should be minimal
    assert.ok(repeats <= 2, `Repeats after round 2 rotation should be low (was ${repeats})`);

    // If an outdated 4-team result was passed, rotateTeams re-divides into 3 teams
    const outdatedResult = [
      ['A', 'B'],
      ['C', 'D'],
      ['E', 'F'],
      ['G'], // old single person team
    ];
    const recovered = rotateTeams(outdatedResult, names, plan, seen, true);
    assert.equal(recovered.length, 3, 'Must re-divide to match current plan of 3 teams');
    assert.deepEqual(recovered.map((t) => t.length).sort((a, b) => b - a), [3, 2, 2]);
  });
});
