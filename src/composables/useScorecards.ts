import { ref } from 'vue';
import { Scorecard, ScorecardSummary } from '../types';

// Module-level reactive state
const scorecardSummaries = ref<ScorecardSummary[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

export function setScorecardSummaries(summaries: ScorecardSummary[]) {
  scorecardSummaries.value = summaries;
}

export function useScorecards() {
  async function fetchScorecards(filter?: {
    projectId?: string;
    templateId?: string;
    from?: string;
    to?: string;
    status?: string;
  }): Promise<Scorecard[]> {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams();
      if (filter?.projectId) params.set('projectId', filter.projectId);
      if (filter?.templateId) params.set('templateId', filter.templateId);
      if (filter?.from) params.set('from', filter.from);
      if (filter?.to) params.set('to', filter.to);
      if (filter?.status) params.set('status', filter.status);

      const res = await fetch(`/api/scorecards?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch scorecards');
      }
      return await res.json();
    } catch (err: any) {
      error.value = err.message || 'Error loading scorecards';
      console.error('[Scorecards] Fetch error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function getScorecard(id: string): Promise<Scorecard | null> {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`/api/scorecards/${encodeURIComponent(id)}`);
      if (res.status === 404) return null;
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch scorecard');
      }
      return await res.json();
    } catch (err: any) {
      error.value = err.message || 'Error loading scorecard';
      console.error('[Scorecards] Get error:', err);
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function saveScorecard(sc: Partial<Scorecard>): Promise<Scorecard> {
    loading.value = true;
    error.value = null;
    try {
      const isExisting = !!sc.id;
      const url = isExisting ? `/api/scorecards/${encodeURIComponent(sc.id!)}` : '/api/scorecards';
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sc),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err: any = new Error(data.error || 'Failed to save scorecard');
        err.details = data.details;
        err.existingId = data.existingId;
        throw err;
      }

      const saved: Scorecard = data.scorecard;

      // Update scorecardSummaries locally
      if (saved.status === 'submitted') {
        const summary: ScorecardSummary = {
          id: saved.id,
          projectId: saved.projectId,
          templateId: saved.templateId,
          periodYear: saved.periodYear,
          periodWeek: saved.periodWeek,
          periodLabel: saved.periodLabel,
          status: saved.status,
          overallRag: saved.computed?.overallRag || null,
          overallValue: saved.computed?.overallValue ?? null,
          normalizedPct: saved.computed?.normalizedPct ?? null,
          assessmentDate: saved.assessmentDate,
          assessor: saved.assessor,
        };
        const idx = scorecardSummaries.value.findIndex((s) => s.id === saved.id || s.id === sc.id);
        if (idx >= 0) {
          scorecardSummaries.value[idx] = summary;
        } else {
          scorecardSummaries.value.push(summary);
        }
      } else {
        // If draft, remove from submitted summaries
        scorecardSummaries.value = scorecardSummaries.value.filter(
          (s) => s.id !== saved.id && s.id !== sc.id
        );
      }

      return saved;
    } catch (err: any) {
      error.value = err.message || 'Error saving scorecard';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteScorecard(id: string): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const res = await fetch(`/api/scorecards/${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to delete scorecard');
      }
      // Remove from scorecardSummaries locally
      scorecardSummaries.value = scorecardSummaries.value.filter((s) => s.id !== id);
      return true;
    } catch (err: any) {
      error.value = err.message || 'Error deleting scorecard';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchTrend(projectId: string, templateId?: string): Promise<any[]> {
    loading.value = true;
    error.value = null;
    try {
      const params = new URLSearchParams({ projectId });
      if (templateId) params.set('templateId', templateId);
      const res = await fetch(`/api/scorecards/trend?${params.toString()}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to fetch trend data');
      }
      return await res.json();
    } catch (err: any) {
      error.value = err.message || 'Error loading trend data';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    scorecardSummaries,
    loading,
    error,
    fetchScorecards,
    getScorecard,
    saveScorecard,
    deleteScorecard,
    fetchTrend,
  };
}
