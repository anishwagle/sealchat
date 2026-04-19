/**
 * A wrapper around the native fetch function.
 * Since we migrated to Supabase Auth, token refreshing and cookie management 
 * is handled automatically natively across both the front-end SDK 
 * and our server-side Edge Proxy (`proxy.ts`). 
 * 
 * We keep this wrapper to gracefully redirect unauthorized failures in case
 * the local session completely expires without chance of refresh.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, options);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  return response;
};