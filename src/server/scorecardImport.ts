import ExcelJS from 'exceljs';
import {
  Scorecard,
  ScorecardItemEntry,
  ScorecardTemplateId,
  ScoringSettings,
  RagValue,
  ScorecardComputed,
} from '../types';
import { SCORECARD_TEMPLATES } from '../scoring/templates';
import { computeScorecard, DEFAULT_SCORING_SETTINGS } from '../scoring/engine';
import { periodLabel, periodKey } from '../scoring/period';
import { getScorecard, saveScorecard } from './database';

export interface ParsedSheetPreview {
  sheetName: string;
  periodYear: number;
  periodWeek: number;
  periodLabel: string;
  periodKey: string;
  mappedItemsCount: number;
  unmappedRows: string[];
  duplicateFlag: boolean;
  computedOverall: ScorecardComputed;
  scorecard: Partial<Scorecard>;
}

export interface ImportResultSummary {
  mode: 'preview' | 'commit';
  totalSheets: number;
  importedCount: number;
  skippedCount: number;
  sheets: ParsedSheetPreview[];
}

function cleanCellText(cell: ExcelJS.Cell | undefined): string {
  if (!cell || cell.value === null || cell.value === undefined) return '';
  const val = cell.value;
  if (typeof val === 'string') return val.trim();
  if (typeof val === 'number') return String(val).trim();
  if (typeof val === 'boolean') return String(val);
  if (val instanceof Date) {
    return val.toISOString().split('T')[0];
  }
  if (typeof val === 'object') {
    if ('richText' in val && Array.isArray((val as any).richText)) {
      return (val as any).richText.map((t: any) => t.text || '').join('').trim();
    }
    if ('result' in val && (val as any).result !== undefined) {
      return String((val as any).result).trim();
    }
    if ('text' in val) {
      return String((val as any).text).trim();
    }
  }
  return String(val).trim();
}

function parseScoreValue(raw: string, allowedValues: RagValue[]): RagValue | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === 'N/A' || upper === 'NA') {
    return allowedValues.includes('NA') ? 'NA' : null;
  }
  if (upper === 'G' || upper === 'GREEN') return 'G';
  if (upper === 'A' || upper === 'AMBER' || upper === 'YELLOW') return 'A';
  if (upper === 'R' || upper === 'RED') return 'R';
  return null;
}

export async function processScorecardsImport(
  fileBuffer: Buffer,
  projectId: string,
  templateId: ScorecardTemplateId,
  defaultYear?: number,
  mode: 'preview' | 'commit' = 'preview',
  onDuplicate: 'skip' | 'overwrite' = 'skip',
  settings: ScoringSettings = DEFAULT_SCORING_SETTINGS
): Promise<ImportResultSummary> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileBuffer as any);

  const parsedSheets: ParsedSheetPreview[] = [];
  const yr = defaultYear || new Date().getFullYear();

  for (const sheet of workbook.worksheets) {
    const sheetName = sheet.name.trim();

    // 1. ORS_RAG Processing
    if (templateId === 'ORS_RAG') {
      const weekMatch = sheetName.match(/Week\s*(\d+)/i);
      if (!weekMatch) {
        continue; // Not a week sheet
      }
      const periodWeek = parseInt(weekMatch[1], 10);
      const periodYear = yr;
      const pLabel = periodLabel(periodYear, periodWeek);
      const pKey = periodKey(periodYear, periodWeek);

      // Rows 5 to 14 mapped in exact order
      const orsItemMappings: { row: number; itemId: string; categoryId: string; defaultName: string }[] = [
        { row: 5, itemId: 'ors_team', categoryId: 'process', defaultName: 'Team' },
        { row: 6, itemId: 'ors_timeline', categoryId: 'process', defaultName: 'Timeline' },
        { row: 7, itemId: 'ors_efficiency', categoryId: 'process', defaultName: 'Efficiency' },
        { row: 8, itemId: 'ors_reporting', categoryId: 'process', defaultName: 'Reporting' },
        { row: 9, itemId: 'ors_puzzle', categoryId: 'content', defaultName: 'Puzzle' },
        { row: 10, itemId: 'ors_design', categoryId: 'content', defaultName: 'Design' },
        { row: 11, itemId: 'ors_quality', categoryId: 'content', defaultName: 'Quality' },
        { row: 12, itemId: 'ors_speed', categoryId: 'content', defaultName: 'Speed' },
        { row: 13, itemId: 'ors_data', categoryId: 'data_quality', defaultName: 'Data quality' },
        { row: 14, itemId: 'ors_interaction', categoryId: 'interaction', defaultName: 'Interaction' },
      ];

      const items: ScorecardItemEntry[] = [];
      const unmappedRows: string[] = [];

      for (const map of orsItemMappings) {
        const row = sheet.getRow(map.row);
        const colC = cleanCellText(row.getCell(3));
        const colB = cleanCellText(row.getCell(2));
        const colE = cleanCellText(row.getCell(5));
        const colG = cleanCellText(row.getCell(7));

        const val = parseScoreValue(colE, ['G', 'A', 'R', 'NA']);
        if (colE && !val) {
          unmappedRows.push(`Row ${map.row} (${map.defaultName}): Invalid score "${colE}"`);
        }

        items.push({
          itemId: map.itemId,
          categoryId: map.categoryId,
          value: val,
          remarks: colG,
        });
      }

      const id = `sc-${projectId}-ORS_RAG-${periodYear}-W${periodWeek}`;
      const existing = await getScorecard(id);
      const duplicateFlag = !!existing;

      const computedOverall = computeScorecard('ORS_RAG', items, settings);

      const candidateScorecard: Partial<Scorecard> = {
        id,
        projectId,
        templateId: 'ORS_RAG',
        templateVersion: 1,
        periodYear,
        periodWeek,
        periodLabel: pLabel,
        assessmentDate: new Date().toISOString().split('T')[0],
        assessor: 'ORS Lead',
        status: 'submitted',
        header: {
          modelComment: cleanCellText(sheet.getRow(16).getCell(2)) || undefined,
        },
        items,
        computed: computedOverall,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      parsedSheets.push({
        sheetName,
        periodYear,
        periodWeek,
        periodLabel: pLabel,
        periodKey: pKey,
        mappedItemsCount: items.filter((i) => i.value !== null).length,
        unmappedRows,
        duplicateFlag,
        computedOverall,
        scorecard: candidateScorecard,
      });
    }

    // 2. SWE_MODEL Processing
    if (templateId === 'SWE_MODEL') {
      const lowerName = sheetName.toLowerCase();
      if (lowerName.includes('instruction') || lowerName.includes('readme')) {
        continue; // Skip instruction sheet
      }

      // Pattern: "v<version> (Week <w> <yyyy>)"
      let modelVersion = 'v1.0';
      let periodWeek = 40;
      let periodYear = yr;

      const vMatch = sheetName.match(/v([^\s(]+)\s*\(Week\s*(\d+)\s*(\d{4})\)/i);
      if (vMatch) {
        modelVersion = `v${vMatch[1]}`;
        periodWeek = parseInt(vMatch[2], 10);
        periodYear = parseInt(vMatch[3], 10);
      } else {
        const wMatch = sheetName.match(/Week\s*(\d+)(?:\s+(\d{4}))?/i);
        if (wMatch) {
          periodWeek = parseInt(wMatch[1], 10);
          if (wMatch[2]) periodYear = parseInt(wMatch[2], 10);
        }
      }

      // Read Header Cells
      const phaseRaw = cleanCellText(sheet.getCell('C4'));
      const phase: 'Modeling' | 'Iterative Development' | undefined =
        phaseRaw.toLowerCase().includes('iterative')
          ? 'Iterative Development'
          : phaseRaw.toLowerCase().includes('model')
          ? 'Modeling'
          : undefined;

      const dateRaw = cleanCellText(sheet.getCell('C5'));
      const assessmentDate = dateRaw || new Date().toISOString().split('T')[0];

      const assessor = cleanCellText(sheet.getCell('C6')) || 'Lead SWE';
      const versionCell = cleanCellText(sheet.getCell('C7'));
      if (versionCell) {
        modelVersion = versionCell;
      }

      const projectComment = cleanCellText(sheet.getCell('B18')) || undefined;
      const modelComment = cleanCellText(sheet.getCell('B23')) || undefined;

      const pLabel = periodLabel(periodYear, periodWeek);
      const pKey = periodKey(periodYear, periodWeek);

      // Template structure for matching
      const sweTemplate = SCORECARD_TEMPLATES.SWE_MODEL;
      const catByNo = new Map(sweTemplate.categories.map((c) => [c.no, c]));

      const items: ScorecardItemEntry[] = [];
      const unmappedRows: string[] = [];

      let currentCategoryNo = 1;
      const totalRows = sheet.actualRowCount;

      for (let r = 29; r <= totalRows; r++) {
        const row = sheet.getRow(r);
        const colA = cleanCellText(row.getCell(1));
        const colC = cleanCellText(row.getCell(3));
        const colD = cleanCellText(row.getCell(4));
        const colE = cleanCellText(row.getCell(5));
        const colG = cleanCellText(row.getCell(7));

        // Skip section headers or part labels
        if (colA.toUpperCase().startsWith('PART') || colA.startsWith('#')) {
          continue;
        }

        // Category number update (e.g. "1", "2", "3")
        const catNum = parseInt(colA, 10);
        if (!isNaN(catNum) && catNum >= 1 && catNum <= 9) {
          currentCategoryNo = catNum;
        }

        // Skip category score summary rows
        if (colD.toLowerCase().startsWith('category score') || colC.toLowerCase().startsWith('category score')) {
          continue;
        }

        // If no item name in column C, skip
        if (!colC) continue;

        // Skip placeholder rows with angle brackets
        if (/^<.*>$/.test(colC.trim())) {
          continue;
        }

        const currentCat = catByNo.get(currentCategoryNo);
        if (!currentCat) continue;

        const val = parseScoreValue(colE, ['G', 'A', 'R']);
        if (colE && !val) {
          unmappedRows.push(`Row ${r} (${colC}): Invalid score "${colE}"`);
        }

        // Category 4: Performance Key Transactions
        if (currentCategoryNo === 4 && colC.toLowerCase().startsWith('key transaction')) {
          const lowerC = colC.toLowerCase();
          if (lowerC.includes('import')) {
            items.push({ itemId: 'perf_kt_import', categoryId: 'perf', value: val, remarks: colG });
          } else if (lowerC.includes('synchronize') || lowerC.includes('sync')) {
            items.push({ itemId: 'perf_kt_sync', categoryId: 'perf', value: val, remarks: colG });
          } else if (lowerC.includes('export')) {
            items.push({ itemId: 'perf_kt_export', categoryId: 'perf', value: val, remarks: colG });
          } else {
            // Custom Key Transaction
            items.push({
              itemId: `perf_kt_custom_${r}`,
              categoryId: 'perf',
              value: val,
              remarks: colG,
              isCustom: true,
              customLabel: colC,
            });
          }
          continue;
        }

        // Category 7: Other custom items
        if (currentCategoryNo === 7) {
          if (!colC.startsWith('<Additional') && !colC.startsWith('<')) {
            items.push({
              itemId: `other_custom_${r}`,
              categoryId: 'other',
              value: val,
              remarks: colG,
              isCustom: true,
              customLabel: colC,
            });
          }
          continue;
        }

        // Standard item matching by name in current category
        const matchedItem = currentCat.items.find(
          (it) => it.name.trim().toLowerCase() === colC.trim().toLowerCase() ||
                  colC.trim().toLowerCase().includes(it.name.trim().toLowerCase()) ||
                  it.name.trim().toLowerCase().includes(colC.trim().toLowerCase())
        );

        if (matchedItem) {
          items.push({
            itemId: matchedItem.id,
            categoryId: currentCat.id,
            value: val,
            remarks: colG,
          });
        } else {
          unmappedRows.push(`Row ${r}: Unrecognized item "${colC}" in Category ${currentCategoryNo}`);
        }
      }

      const id = `sc-${projectId}-SWE_MODEL-${periodYear}-W${periodWeek}`;
      const existing = await getScorecard(id);
      const duplicateFlag = !!existing;

      const computedOverall = computeScorecard('SWE_MODEL', items, settings);

      const candidateScorecard: Partial<Scorecard> = {
        id,
        projectId,
        templateId: 'SWE_MODEL',
        templateVersion: 1,
        periodYear,
        periodWeek,
        periodLabel: pLabel,
        assessmentDate,
        assessor,
        status: 'submitted',
        header: {
          phase,
          modelVersion,
          projectComment,
          modelComment,
        },
        items,
        computed: computedOverall,
        createdAt: existing?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
      };

      parsedSheets.push({
        sheetName,
        periodYear,
        periodWeek,
        periodLabel: pLabel,
        periodKey: pKey,
        mappedItemsCount: items.filter((i) => i.value !== null).length,
        unmappedRows,
        duplicateFlag,
        computedOverall,
        scorecard: candidateScorecard,
      });
    }
  }

  // Handle Commit Mode
  let importedCount = 0;
  let skippedCount = 0;

  if (mode === 'commit') {
    for (const sheet of parsedSheets) {
      if (sheet.duplicateFlag && onDuplicate === 'skip') {
        skippedCount++;
        continue;
      }
      try {
        await saveScorecard(sheet.scorecard as Scorecard);
        importedCount++;
      } catch (err) {
        console.error(`[Import] Failed to save scorecard for ${sheet.periodLabel}:`, err);
        skippedCount++;
      }
    }
  }

  return {
    mode,
    totalSheets: parsedSheets.length,
    importedCount,
    skippedCount,
    sheets: parsedSheets,
  };
}
