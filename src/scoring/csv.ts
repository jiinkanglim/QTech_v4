import { Scorecard, Project } from '../types';
import { periodKey } from './period';
import { SCORECARD_TEMPLATES } from './templates';

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

function rowToCsvLine(row: any[]): string {
  return row.map(escapeCsvField).join(',');
}

/**
 * Generates Summary CSV for a list of scorecards (UTF-8 with BOM, all fields quoted).
 * Columns: period_key, period_label, project_code, project_name, role, status, overall_rag,
 * overall_value, normalized_pct, review, metrics, assessor, assessment_date
 */
export function generateSummaryCsv(scorecards: Scorecard[], projects: Project[]): string {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const headers = [
    'period_key',
    'period_label',
    'project_code',
    'project_name',
    'role',
    'status',
    'overall_rag',
    'overall_value',
    'normalized_pct',
    'review',
    'metrics',
    'assessor',
    'assessment_date',
  ];

  const lines = [rowToCsvLine(headers)];

  for (const sc of scorecards) {
    const prj = projectMap.get(sc.projectId);
    const pKey = periodKey(sc.periodYear, sc.periodWeek);
    const role = sc.templateId === 'SWE_MODEL' ? 'SWE Model' : 'ORS Optimizer';
    const overallVal = sc.computed?.overallValue != null ? sc.computed.overallValue.toFixed(2) : '';
    const normPct = sc.computed?.normalizedPct != null ? sc.computed.normalizedPct.toFixed(0) : '';
    const review = sc.computed?.parts?.review != null ? sc.computed.parts.review.toFixed(2) : '';
    const metrics = sc.computed?.parts?.metrics != null ? sc.computed.parts.metrics.toFixed(2) : '';

    const row = [
      pKey,
      sc.periodLabel,
      prj?.code || '',
      prj?.name || sc.projectId,
      role,
      sc.status,
      sc.computed?.overallRag || '',
      overallVal,
      normPct,
      review,
      metrics,
      sc.assessor || '',
      sc.assessmentDate || '',
    ];

    lines.push(rowToCsvLine(row));
  }

  // Prepend UTF-8 BOM (\uFEFF)
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Generates Detail CSV for a list of scorecards (UTF-8 with BOM, all fields quoted).
 * One row per item: period_key, period_label, project_code, project_name, role, status,
 * overall_rag, overall_value, normalized_pct, review, metrics, assessor, assessment_date,
 * category_no, category, item_id, item_name, value, remarks
 */
export function generateDetailCsv(scorecards: Scorecard[], projects: Project[]): string {
  const projectMap = new Map(projects.map((p) => [p.id, p]));
  const headers = [
    'period_key',
    'period_label',
    'project_code',
    'project_name',
    'role',
    'status',
    'overall_rag',
    'overall_value',
    'normalized_pct',
    'review',
    'metrics',
    'assessor',
    'assessment_date',
    'category_no',
    'category',
    'item_id',
    'item_name',
    'value',
    'remarks',
  ];

  const lines = [rowToCsvLine(headers)];

  for (const sc of scorecards) {
    const prj = projectMap.get(sc.projectId);
    const pKey = periodKey(sc.periodYear, sc.periodWeek);
    const role = sc.templateId === 'SWE_MODEL' ? 'SWE Model' : 'ORS Optimizer';
    const overallVal = sc.computed?.overallValue != null ? sc.computed.overallValue.toFixed(2) : '';
    const normPct = sc.computed?.normalizedPct != null ? sc.computed.normalizedPct.toFixed(0) : '';
    const review = sc.computed?.parts?.review != null ? sc.computed.parts.review.toFixed(2) : '';
    const metrics = sc.computed?.parts?.metrics != null ? sc.computed.parts.metrics.toFixed(2) : '';

    const baseRow = [
      pKey,
      sc.periodLabel,
      prj?.code || '',
      prj?.name || sc.projectId,
      role,
      sc.status,
      sc.computed?.overallRag || '',
      overallVal,
      normPct,
      review,
      metrics,
      sc.assessor || '',
      sc.assessmentDate || '',
    ];

    const template = SCORECARD_TEMPLATES[sc.templateId];
    const catMap = new Map<string, { no: number; name: string }>();
    const itemDefMap = new Map<string, string>();

    if (template) {
      for (const cat of template.categories) {
        catMap.set(cat.id, { no: cat.no, name: cat.name });
        for (const it of cat.items) {
          itemDefMap.set(it.id, it.name);
        }
      }
    }

    for (const item of sc.items) {
      const cat = catMap.get(item.categoryId);
      const catNo = cat ? cat.no : '';
      const catName = cat ? cat.name : item.categoryId;
      const itemName = item.customLabel || itemDefMap.get(item.itemId) || item.itemId;
      const val = item.value === 'NA' ? 'N/A' : (item.value || '');

      const fullRow = [
        ...baseRow,
        catNo,
        catName,
        item.itemId,
        itemName,
        val,
        item.remarks || '',
      ];

      lines.push(rowToCsvLine(fullRow));
    }
  }

  // Prepend UTF-8 BOM (\uFEFF)
  return '\uFEFF' + lines.join('\r\n');
}

/**
 * Triggers browser download for a CSV string.
 */
export function downloadCsv(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
