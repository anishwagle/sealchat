/**
 * A wrapper around the native fetch function that automatically handles token refreshing.
 * If a request fails with a 401 Unauthorized status, it will attempt to refresh
 * the token and then retry the original request once.
 */

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; }[] = [];

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let response = await fetch(url, options);

  if (response.status === 401) {
    if (isRefreshing) {
      // If a refresh is already in progress, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
      .then(() => {
        // Once the token is refreshed, retry the original request
        return fetch(url, options);
      });
    }

    isRefreshing = true;
    try {
      const refreshResponse = await fetch('/api/auth/refresh', { method: 'POST' });
      if (!refreshResponse.ok) throw new Error('Failed to refresh token');
      
      // Process the queue for any waiting requests
      processQueue(null);

      // Retry the original request
      response = await fetch(url, options);
    } catch (error) {
      processQueue(error);
      window.location.href = '/login'; // Logout on refresh failure
    } finally {
      isRefreshing = false;
    }
  }

  return response;
};