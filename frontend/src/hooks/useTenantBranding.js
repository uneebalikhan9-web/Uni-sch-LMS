import { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

// Cache key for sessionStorage
const BRANDING_CACHE_KEY = 'lms_tenant_branding';

export const useTenantBranding = () => {
  const [branding, setBranding] = useState(() => {
    // Try to load from sessionStorage cache on first render (avoids flash)
    try {
      const cached = sessionStorage.getItem(BRANDING_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        return { ...parsed, loading: false };
      }
    } catch (e) {}
    return { logo_url: null, primary_color: null, loading: true };
  });

  useEffect(() => {
    // If already loaded from cache, skip the API call
    if (!branding.loading) return;

    const fetchBranding = async () => {
      try {
        const domain = window.location.hostname;
        const res = await fetch(`${API_BASE_URL}/api/public/tenant-branding?domain=${encodeURIComponent(domain)}`);
        const data = await res.json();
        const result = {
          logo_url: data.success ? data.logo_url || null : null,
          primary_color: data.success ? data.primary_color || null : null,
          loading: false
        };
        // Cache in sessionStorage so subsequent pages don't re-fetch
        sessionStorage.setItem(BRANDING_CACHE_KEY, JSON.stringify(result));
        setBranding(result);
      } catch (err) {
        console.error('Error fetching tenant branding:', err);
        setBranding({ logo_url: null, primary_color: null, loading: false });
      }
    };

    fetchBranding();
  }, [branding.loading]);

  return branding;
};
