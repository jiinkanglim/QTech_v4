import { RagValue, ScorecardItemEntry } from '../types';
import { bandSwe, computeOrs, computeSwe, DEFAULT_SCORING_SETTINGS } from './engine';

export function runScoringSelfTest(): boolean {
  const failures: string[] = [];

  // Helper to round to N decimals
  const round = (num: number | null | undefined, dec = 3) => {
    if (num === null || num === undefined) return null;
    return Number(num.toFixed(dec));
  };

  // -------------------------------------------------------------
  // Case A) ORS: team G, timeline R, efficiency G, reporting G,
  //             puzzle G, design A, quality G, speed R,
  //             data A, interaction G
  // -> process 2.5, content 2.25, overallRag 'A', orsPoints 7, orsApplicable 10, overallValue 7
  // -------------------------------------------------------------
  try {
    const entriesA: ScorecardItemEntry[] = [
      { itemId: 'ors_team', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_timeline', categoryId: 'process', value: 'R', remarks: 'delayed' },
      { itemId: 'ors_efficiency', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_reporting', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_puzzle', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_design', categoryId: 'content', value: 'A', remarks: 'needs review' },
      { itemId: 'ors_quality', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_speed', categoryId: 'content', value: 'R', remarks: 'slow solver' },
      { itemId: 'ors_data', categoryId: 'data_quality', value: 'A', remarks: 'missing data' },
      { itemId: 'ors_interaction', categoryId: 'interaction', value: 'G', remarks: '' },
    ];
    const resA = computeOrs(entriesA);

    if (round(resA.categories.process?.value) !== 2.5) {
      failures.push(`Case A: expected process value 2.5, got ${resA.categories.process?.value}`);
    }
    if (round(resA.categories.content?.value) !== 2.25) {
      failures.push(`Case A: expected content value 2.25, got ${resA.categories.content?.value}`);
    }
    if (resA.overallRag !== 'A') {
      failures.push(`Case A: expected overallRag 'A', got ${resA.overallRag}`);
    }
    if (resA.orsPoints !== 7) {
      failures.push(`Case A: expected orsPoints 7, got ${resA.orsPoints}`);
    }
    if (resA.orsApplicable !== 10) {
      failures.push(`Case A: expected orsApplicable 10, got ${resA.orsApplicable}`);
    }
    if (resA.overallValue !== 7) {
      failures.push(`Case A: expected overallValue 7, got ${resA.overallValue}`);
    }
  } catch (err: any) {
    failures.push(`Case A exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case B) ORS: all G except interaction R
  // -> overallRag 'R', orsPoints 9
  // -------------------------------------------------------------
  try {
    const entriesB: ScorecardItemEntry[] = [
      { itemId: 'ors_team', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_timeline', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_efficiency', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_reporting', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_puzzle', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_design', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_quality', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_speed', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_data', categoryId: 'data_quality', value: 'G', remarks: '' },
      { itemId: 'ors_interaction', categoryId: 'interaction', value: 'R', remarks: 'No daily updates' },
    ];
    const resB = computeOrs(entriesB);
    if (resB.overallRag !== 'R') {
      failures.push(`Case B: expected overallRag 'R', got ${resB.overallRag}`);
    }
    if (resB.orsPoints !== 9) {
      failures.push(`Case B: expected orsPoints 9, got ${resB.orsPoints}`);
    }
  } catch (err: any) {
    failures.push(`Case B exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case C) ORS:
  // 1. all G except timeline A -> process 2.75 -> 'G'
  // 2. all G except timeline A and team A -> process 2.5 -> 'A'
  // -------------------------------------------------------------
  try {
    const entriesC1: ScorecardItemEntry[] = [
      { itemId: 'ors_team', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_timeline', categoryId: 'process', value: 'A', remarks: '' },
      { itemId: 'ors_efficiency', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_reporting', categoryId: 'process', value: 'G', remarks: '' },
    ];
    const resC1 = computeOrs(entriesC1);
    if (round(resC1.categories.process?.value) !== 2.75) {
      failures.push(`Case C1: expected process 2.75, got ${resC1.categories.process?.value}`);
    }
    if (resC1.categories.process?.rag !== 'G') {
      failures.push(`Case C1: expected process rag 'G', got ${resC1.categories.process?.rag}`);
    }

    const entriesC2: ScorecardItemEntry[] = [
      { itemId: 'ors_team', categoryId: 'process', value: 'A', remarks: '' },
      { itemId: 'ors_timeline', categoryId: 'process', value: 'A', remarks: '' },
      { itemId: 'ors_efficiency', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_reporting', categoryId: 'process', value: 'G', remarks: '' },
    ];
    const resC2 = computeOrs(entriesC2);
    if (round(resC2.categories.process?.value) !== 2.5) {
      failures.push(`Case C2: expected process 2.5, got ${resC2.categories.process?.value}`);
    }
    if (resC2.categories.process?.rag !== 'A') {
      failures.push(`Case C2: expected process rag 'A', got ${resC2.categories.process?.rag}`);
    }
  } catch (err: any) {
    failures.push(`Case C exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case D) ORS: all NA -> overall null, label "Not scored yet"
  // -------------------------------------------------------------
  try {
    const entriesD: ScorecardItemEntry[] = [
      { itemId: 'ors_team', categoryId: 'process', value: 'NA', remarks: '' },
      { itemId: 'ors_timeline', categoryId: 'process', value: 'NA', remarks: '' },
      { itemId: 'ors_efficiency', categoryId: 'process', value: 'NA', remarks: '' },
      { itemId: 'ors_reporting', categoryId: 'process', value: 'NA', remarks: '' },
      { itemId: 'ors_puzzle', categoryId: 'content', value: 'NA', remarks: '' },
      { itemId: 'ors_design', categoryId: 'content', value: 'NA', remarks: '' },
      { itemId: 'ors_quality', categoryId: 'content', value: 'NA', remarks: '' },
      { itemId: 'ors_speed', categoryId: 'content', value: 'NA', remarks: '' },
      { itemId: 'ors_data', categoryId: 'data_quality', value: 'NA', remarks: '' },
      { itemId: 'ors_interaction', categoryId: 'interaction', value: 'NA', remarks: '' },
    ];
    const resD = computeOrs(entriesD);
    if (resD.overallRag !== null) {
      failures.push(`Case D: expected overallRag null, got ${resD.overallRag}`);
    }
    if (resD.overallValue !== null) {
      failures.push(`Case D: expected overallValue null, got ${resD.overallValue}`);
    }
    if (resD.overallLabel !== 'Not scored yet') {
      failures.push(`Case D: expected label "Not scored yet", got ${resD.overallLabel}`);
    }
  } catch (err: any) {
    failures.push(`Case D exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case H) ORS: case A but speed NA
  // -> content 2.667, overallRag 'A', orsPoints 7, orsApplicable 9, overallValue 7.8
  // -------------------------------------------------------------
  try {
    const entriesH: ScorecardItemEntry[] = [
      { itemId: 'ors_team', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_timeline', categoryId: 'process', value: 'R', remarks: '' },
      { itemId: 'ors_efficiency', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_reporting', categoryId: 'process', value: 'G', remarks: '' },
      { itemId: 'ors_puzzle', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_design', categoryId: 'content', value: 'A', remarks: '' },
      { itemId: 'ors_quality', categoryId: 'content', value: 'G', remarks: '' },
      { itemId: 'ors_speed', categoryId: 'content', value: 'NA', remarks: '' },
      { itemId: 'ors_data', categoryId: 'data_quality', value: 'A', remarks: '' },
      { itemId: 'ors_interaction', categoryId: 'interaction', value: 'G', remarks: '' },
    ];
    const resH = computeOrs(entriesH);
    if (round(resH.categories.content?.value) !== 2.667) {
      failures.push(`Case H: expected content 2.667, got ${round(resH.categories.content?.value)}`);
    }
    if (resH.overallRag !== 'A') {
      failures.push(`Case H: expected overallRag 'A', got ${resH.overallRag}`);
    }
    if (resH.orsPoints !== 7) {
      failures.push(`Case H: expected orsPoints 7, got ${resH.orsPoints}`);
    }
    if (resH.orsApplicable !== 9) {
      failures.push(`Case H: expected orsApplicable 9, got ${resH.orsApplicable}`);
    }
    if (resH.overallValue !== 7.8) {
      failures.push(`Case H: expected overallValue 7.8, got ${resH.overallValue}`);
    }
  } catch (err: any) {
    failures.push(`Case H exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case E) SWE:
  // cat1 [G]; cat2 [G,A,G]; cat3 only logic_correct R; cat4 only perf_memory A;
  // cat5 [G]; cat6 [A,A] (others blank); cat7 blank; cat8 [G,G,A]; cat9 [R,A]
  // -> review 2.278 'A', metrics 2.083 'A', overall 2.181 'A', label "OK" (compare at 3 decimals)
  // -------------------------------------------------------------
  try {
    const entriesE: ScorecardItemEntry[] = [
      // cat1: general [G]
      { itemId: 'server_startup', categoryId: 'general', value: 'G', remarks: '' },
      // cat2: ood [G, A, G]
      { itemId: 'ood_structure', categoryId: 'ood', value: 'G', remarks: '' },
      { itemId: 'ood_level', categoryId: 'ood', value: 'A', remarks: '' },
      { itemId: 'ood_lifecycle', categoryId: 'ood', value: 'G', remarks: '' },
      // cat3: logic only logic_correct R
      { itemId: 'logic_correct', categoryId: 'logic', value: 'R', remarks: '' },
      // cat4: perf only perf_memory A
      { itemId: 'perf_memory', categoryId: 'perf', value: 'A', remarks: '' },
      // cat5: solution [G]
      { itemId: 'solution_fit', categoryId: 'solution', value: 'G', remarks: '' },
      // cat6: ux [A, A]
      { itemId: 'ux_feedback', categoryId: 'ux', value: 'A', remarks: '' },
      { itemId: 'ux_interaction', categoryId: 'ux', value: 'A', remarks: '' },
      // cat7: other (blank)
      // cat8: metrics_editor [G, G, A]
      { itemId: 'me_complexity', categoryId: 'metrics_editor', value: 'G', remarks: '' },
      { itemId: 'me_size', categoryId: 'metrics_editor', value: 'G', remarks: '' },
      { itemId: 'me_style', categoryId: 'metrics_editor', value: 'A', remarks: '' },
      // cat9: metrics_designer [R, A]
      { itemId: 'md_complexity', categoryId: 'metrics_designer', value: 'R', remarks: '' },
      { itemId: 'md_size', categoryId: 'metrics_designer', value: 'A', remarks: '' },
    ];
    const resE = computeSwe(entriesE);
    if (round(resE.parts?.review) !== 2.278) {
      failures.push(`Case E: expected review 2.278, got ${round(resE.parts?.review)}`);
    }
    if (resE.parts?.reviewRag !== 'A') {
      failures.push(`Case E: expected reviewRag 'A', got ${resE.parts?.reviewRag}`);
    }
    if (round(resE.parts?.metrics) !== 2.083) {
      failures.push(`Case E: expected metrics 2.083, got ${round(resE.parts?.metrics)}`);
    }
    if (resE.parts?.metricsRag !== 'A') {
      failures.push(`Case E: expected metricsRag 'A', got ${resE.parts?.metricsRag}`);
    }
    if (round(resE.overallValue) !== 2.181) {
      failures.push(`Case E: expected overallValue 2.181, got ${round(resE.overallValue)}`);
    }
    if (resE.overallRag !== 'A') {
      failures.push(`Case E: expected overallRag 'A', got ${resE.overallRag}`);
    }
    if (resE.overallLabel !== 'OK') {
      failures.push(`Case E: expected overallLabel 'OK', got ${resE.overallLabel}`);
    }
  } catch (err: any) {
    failures.push(`Case E exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case F) SWE: all blank -> overallValue null, label "Not scored yet"
  // -------------------------------------------------------------
  try {
    const entriesF: ScorecardItemEntry[] = [];
    const resF = computeSwe(entriesF);
    if (resF.overallValue !== null) {
      failures.push(`Case F: expected overallValue null, got ${resF.overallValue}`);
    }
    if (resF.overallLabel !== 'Not scored yet') {
      failures.push(`Case F: expected overallLabel "Not scored yet", got ${resF.overallLabel}`);
    }
  } catch (err: any) {
    failures.push(`Case F exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Case G) SWE band edges: avg exactly 2.5 -> 'G'; exactly 1.5 -> 'A'; 1.49 -> 'R'
  // -------------------------------------------------------------
  try {
    const gResult = bandSwe(2.5, DEFAULT_SCORING_SETTINGS);
    const aResult = bandSwe(1.5, DEFAULT_SCORING_SETTINGS);
    const rResult = bandSwe(1.49, DEFAULT_SCORING_SETTINGS);

    if (gResult !== 'G') {
      failures.push(`Case G: expected bandSwe(2.5) to be 'G', got ${gResult}`);
    }
    if (aResult !== 'A') {
      failures.push(`Case G: expected bandSwe(1.5) to be 'A', got ${aResult}`);
    }
    if (rResult !== 'R') {
      failures.push(`Case G: expected bandSwe(1.49) to be 'R', got ${rResult}`);
    }
  } catch (err: any) {
    failures.push(`Case G exception: ${err.message}`);
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  if (failures.length === 0) {
    console.log('[Scoring] selftest OK');
    return true;
  } else {
    for (const fail of failures) {
      console.error(`[Scoring] selftest FAIL: ${fail}`);
    }
    return false;
  }
}
