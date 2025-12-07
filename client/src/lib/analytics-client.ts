// Client-side analytics tracking service
export const analyticsService = {
  trackEvent: (eventName: string, eventData?: any) => {
    // Track analytics events
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Analytics] Event: ${eventName}`, eventData);
    }
    
    // Send to backend analytics endpoint
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: eventName,
        eventData: eventData || {},
      }),
    }).catch(err => console.error('Analytics tracking failed:', err));
  },

  trackPageView: (pageName: string) => {
    analyticsService.trackEvent('page_view', { page: pageName });
  },

  trackUserAction: (action: string, metadata?: any) => {
    analyticsService.trackEvent('user_action', { action, ...metadata });
  }
};