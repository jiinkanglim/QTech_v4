import { ScorecardTemplate, ScorecardTemplateId } from '../types';

export const SCORECARD_TEMPLATES: Record<ScorecardTemplateId, ScorecardTemplate> = {
  SWE_MODEL: {
    id: 'SWE_MODEL',
    version: 1,
    name: 'Model Scoring Sheet',
    role: 'Lead Software Expert / QA-QS',
    allowedValues: ['G', 'A', 'R'],
    categories: [
      {
        id: 'general',
        no: 1,
        part: 'REVIEW',
        name: 'General',
        items: [
          {
            id: 'server_startup',
            name: 'Server start-up',
            description:
              'No start-up error after model installation. Editor/Designer errors and warnings are scored under Metrics.',
          },
        ],
      },
      {
        id: 'ood',
        no: 2,
        part: 'REVIEW',
        name: 'Object Oriented Design',
        items: [
          {
            id: 'ood_structure',
            name: 'Object structure',
            description:
              'Open for extension/closed for modification, single responsibility, correct owners and multiplicity (1-1, 1-N, N-M), limited astype/istype.',
          },
          {
            id: 'ood_level',
            name: 'Model elements at right level',
            description:
              'Elements and overloads on the right object and level; relations as high as possible; create/delete as static methods.',
          },
          {
            id: 'ood_lifecycle',
            name: 'Creation and Deletion',
            description:
              'Instantiate only when needed; procedural objects cleaned up on time; OnDelete keeps N-N intermediates consistent.',
          },
        ],
      },
      {
        id: 'logic',
        no: 3,
        part: 'REVIEW',
        name: 'Logic (Business and Client)',
        items: [
          {
            id: 'logic_correct',
            name: 'Correctness (Doing things right)',
            description:
              'Correct, expected output for each scenario; defaults always defined.',
          },
          {
            id: 'logic_efficiency',
            name: 'Efficiency',
            description:
              'Simple logic, right quantors, relsize, TypeIndex, single traverse instead of nested.',
          },
          {
            id: 'logic_clean',
            name: 'Clean code',
            description:
              'Readable, modular, no duplication, no hardcoding/magic constants, descriptive names, descriptions on key elements.',
          },
          {
            id: 'logic_robust',
            name: 'Robustness & Exception handling',
            description:
              'Explicit error handling, correct guard vs explicit if, correct isnull, avoid try...onfailure.',
          },
          {
            id: 'logic_server_client',
            name: 'Server & Client method',
            description:
              'Business logic/preconditions on server, remote methods, short commented responses.',
          },
          {
            id: 'logic_kt',
            name: 'Knowledge Table',
            description:
              'Right KT rules, one table function for many attributes, defaults set, no KT methods in declarative logic.',
          },
          {
            id: 'logic_proc_decl',
            name: 'Procedural vs Declarative',
            description:
              'Attribute set either procedurally or declaratively; minimal, documented Transaction.Propagate().',
          },
        ],
      },
      {
        id: 'perf',
        no: 4,
        part: 'REVIEW',
        extensible: 'KEY_TRANSACTION',
        name: 'Performance',
        items: [
          {
            id: 'perf_memory',
            name: 'Memory & Overhead',
            description:
              'Instance counts, propagation and EDI overhead, delta processing.',
          },
          {
            id: 'perf_lock',
            name: 'Thread lock',
            description:
              'No dataset locking/UI blocking; const usage; async import/export/SOAP.',
          },
          {
            id: 'perf_binding',
            name: 'Business logic & binding',
            description:
              'No quadratic logic, efficient paths, minimal binding, sensible daemon count/frequency.',
          },
          {
            id: 'perf_client',
            name: 'Client (UI)',
            description:
              'Limited instances loaded, no multi-server transactions, avoid OnUpdateUI.',
          },
          {
            id: 'perf_kt_import',
            name: 'Key transaction / decision: Import',
            description:
              'Meets the performance expectation documented in QID/QBA/QAD.',
          },
          {
            id: 'perf_kt_sync',
            name: 'Key transaction / decision: Synchronize',
            description: 'Same as Import.',
          },
          {
            id: 'perf_kt_export',
            name: 'Key transaction / decision: Export',
            description: 'Same as Import.',
          },
        ],
      },
      {
        id: 'solution',
        no: 5,
        part: 'REVIEW',
        name: 'Solution',
        items: [
          {
            id: 'solution_fit',
            name: 'Correct business solution (Doing right things)',
            description:
              'Keep it simple; right solution, tools and components for the customer puzzle; no reinventing the wheel.',
          },
        ],
      },
      {
        id: 'ux',
        no: 6,
        part: 'REVIEW',
        name: 'User Experience',
        items: [
          {
            id: 'ux_feedback',
            name: 'Informative & Responsiveness',
            description:
              'Short, helpful messages/tooltips/constraint texts; feedback when disabled; progress shown when blocked.',
          },
          {
            id: 'ux_interaction',
            name: 'Interaction design',
            description:
              'Drag/drop, tab order, undo/redo, masks, minimum clicks, new instance auto-selected.',
          },
          {
            id: 'ux_intuitive',
            name: 'Intuitive interface',
            description:
              'Consistent look, labels, icons, shortcuts, tooltips; aligned, resizable dialogs.',
          },
          {
            id: 'ux_navigation',
            name: 'Findability & Navigation',
            description:
              'Highlight rules, filters, master-detail, auto focus.',
          },
        ],
      },
      {
        id: 'other',
        no: 7,
        part: 'REVIEW',
        optional: true,
        extensible: 'CUSTOM',
        maxCustomItems: 5,
        name: 'Other (optional)',
        items: [],
      },
      {
        id: 'metrics_editor',
        no: 8,
        part: 'METRICS',
        name: 'Metrics (Editor)',
        items: [
          { id: 'me_complexity', name: 'Code complexity', description: 'Nested brackets, quantors' },
          { id: 'me_size', name: 'Code size', description: 'Lines of code excl. comments' },
          { id: 'me_style', name: 'Code style', description: 'Spacing after statements, operators, brackets' },
          {
            id: 'me_reconsider',
            name: 'Code to reconsider',
            description: 'Transaction propagate, kernel code, OS, DomainModel, onerror',
          },
          { id: 'me_errors', name: 'Errors', description: 'No model errors in the Editor' },
          { id: 'me_hardcoding', name: 'Hardcoding', description: 'Hardcoded numbers (excl. 0-1)' },
          { id: 'me_todo', name: 'ToDo', description: 'TODO comments' },
          { id: 'me_casting', name: 'Type checking/ casting', description: 'istype, ontype, astype' },
          { id: 'me_unused', name: 'Unused elements', description: 'Unused attributes, methods, functions, relations' },
          { id: 'me_comments', name: 'Use of comment', description: 'A comment every 10 lines' },
          { id: 'me_warnings', name: 'Warnings', description: 'No model warnings in the Editor' },
        ],
      },
      {
        id: 'metrics_designer',
        no: 9,
        part: 'METRICS',
        name: 'Metrics (Designer)',
        items: [
          { id: 'md_complexity', name: 'Code complexity', description: 'Nested brackets, quantors' },
          { id: 'md_size', name: 'Code size', description: 'Lines of code excl. comments' },
          { id: 'md_style', name: 'Code style', description: 'Spacing after statements, operators, brackets' },
          {
            id: 'md_reconsider',
            name: 'Code to reconsider',
            description: 'Transaction propagate, kernel code, OS, DomainModel, onerror',
          },
          {
            id: 'md_duplicate',
            name: 'Duplicate responses',
            description: 'Duplicated logic across responses',
          },
          { id: 'md_errors', name: 'Errors', description: 'No errors in the Designer' },
          { id: 'md_hardcoding', name: 'Hardcoding', description: 'Hardcoded numbers (excl. 0-1)' },
          {
            id: 'md_binding',
            name: 'Multiple objects binding',
            description: 'Bindings on multiple objects',
          },
          { id: 'md_todo', name: 'ToDo', description: 'TODO comments' },
          { id: 'md_casting', name: 'Type checking/ casting', description: 'istype, ontype, astype' },
          { id: 'md_unused', name: 'Unused elements', description: 'Unused attributes, methods, functions, relations' },
          { id: 'md_comments', name: 'Use of comment', description: 'A comment every 10 lines' },
          { id: 'md_warnings', name: 'Warnings', description: 'No warnings in the Designer' },
        ],
      },
    ],
  },
  ORS_RAG: {
    id: 'ORS_RAG',
    version: 1,
    name: 'Optimizer RAG Sheet',
    role: 'Optimization Research Scientist',
    allowedValues: ['G', 'A', 'R', 'NA'],
    categories: [
      {
        id: 'process',
        no: 1,
        name: 'Process',
        items: [
          {
            id: 'ors_team',
            name: 'Team',
            description:
              'Right team? Enough ORS coaching? Team interaction OK? ORS advisor involved when needed?',
          },
          {
            id: 'ors_timeline',
            name: 'Timeline',
            description:
              'Plan exists and followed? Deadlines clear and on track (else escalate)? Future phases realistic?',
          },
          {
            id: 'ors_efficiency',
            name: 'Efficiency',
            description: 'Is the ORS efficient? Is the team efficient?',
          },
          {
            id: 'ors_reporting',
            name: 'Reporting',
            description:
              'Measurable progress tracking via the Optimizer Tracking Sheet (OTS)?',
          },
        ],
      },
      {
        id: 'content',
        no: 2,
        name: 'Content',
        items: [
          {
            id: 'ors_puzzle',
            name: 'Puzzle',
            description:
              'Puzzle clear, in scope, solving the real business problem?',
          },
          {
            id: 'ors_design',
            name: 'Design',
            description:
              'Good documentation/design (OSD) and adhered to?',
          },
          {
            id: 'ors_quality',
            name: 'Quality',
            description:
              'Good results on current benchmarks? Thorough code reviews?',
          },
          {
            id: 'ors_speed',
            name: 'Speed',
            description:
              'Adequate optimizer speed for the current phase?',
          },
        ],
      },
      {
        id: 'data_quality',
        no: 3,
        name: 'Data Quality',
        items: [
          {
            id: 'ors_data',
            name: 'Data quality',
            description:
              'Right data of sufficient quality, incl. data needed soon (e.g. customer acceptance benchmark ready before Optimization Accept)?',
          },
        ],
      },
      {
        id: 'interaction',
        no: 4,
        name: 'Interaction',
        items: [
          {
            id: 'ors_interaction',
            name: 'Interaction',
            description:
              'Team interaction; daily updates received last week: 1-2 Red, 3 Amber, 4-5 Green.',
          },
        ],
      },
    ],
  },
};
