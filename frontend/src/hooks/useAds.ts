import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { AdLeaderboardRow, MetricsFrameworkItem } from '../lib/types';

export function useAds() {
  const [ads, setAds] = useState<AdLeaderboardRow[]>([]);
  const [metrics, setMetrics] = useState<MetricsFrameworkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    if (!isSupabaseConfigured) {
      setAds([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch real ads leaderboard
      const { data: adsData, error: adsError } = await supabase
        .from('v_ad_leaderboard')
        .select('*')
        .order('rank', { ascending: true, nullsFirst: false });

      if (adsError) {
        throw adsError;
      }

      // 2. Fetch raw snapshots to extract playable video URLs
      const { data: rawSnapshots } = await supabase
        .from('ads')
        .select('library_id, raw_snapshot');

      const videoMap = new Map<string, string>();
      if (rawSnapshots) {
        for (const row of rawSnapshots) {
          const s = row.raw_snapshot?.snapshot;
          if (s) {
            const vUrl =
              s.videos?.[0]?.videoHdUrl ||
              s.videos?.[0]?.videoSdUrl ||
              s.cards?.[0]?.videoHdUrl ||
              s.cards?.[0]?.videoSdUrl ||
              null;
            if (vUrl) {
              videoMap.set(row.library_id, vUrl);
            }
          }
        }
      }

      const mergedAds: AdLeaderboardRow[] = (adsData || []).map((ad: any) => ({
        ...ad,
        video_url: videoMap.get(ad.library_id) || ad.video_url || null,
      }));

      setAds(mergedAds);

      // 2. Fetch static metrics framework
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics_framework')
        .select('*')
        .order('id', { ascending: true });

      if (!metricsError && metricsData) {
        setMetrics(metricsData);
      }
    } catch (err: any) {
      console.error('Error fetching ad intelligence data:', err);
      setError(err.message || 'Failed to load ad data from Supabase');
      setAds([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    ads,
    metrics,
    loading,
    error,
    isConfigured: isSupabaseConfigured,
    refetch: fetchData,
  };
}
