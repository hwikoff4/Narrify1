// Mock data for demo mode (when Supabase is not configured)

export const mockUser = {
  id: 'demo-user-123',
  email: 'demo@narrify.io',
  created_at: new Date().toISOString(),
};

export const mockClient = {
  id: 'demo-client-123',
  auth_user_id: 'demo-user-123',
  name: 'Demo Company',
  email: 'demo@narrify.io',
  company: 'Narrify Demo',
  created_at: new Date().toISOString(),
  config: {
    theme: {
      primary: '#10b981',
      background: 'rgba(0, 0, 0, 0.6)',
      text: '#ffffff',
      accent: '#3b82f6',
    },
    conversation: {
      enabled: true,
      buttonPosition: 'bottom-right',
      buttonLabel: 'Ask Narrify',
      agentName: 'Narrify',
      agentPersonality: 'You are a helpful tour guide. Answer questions about what the user sees on screen. Be concise and friendly.',
      showTranscript: true,
      textFallback: true,
      vision: {
        enabled: true,
        captureMode: 'viewport',
        includeDOM: false,
        maxImageSize: 500,
      },
    },
  },
};

export const mockTours = [
  {
    id: 'tour-1',
    client_id: 'demo-client-123',
    name: 'Onboarding Tour',
    description: 'Welcome new users to your platform with this interactive tour',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    pages: [
      {
        id: 'page-1',
        url: '/dashboard',
        title: 'Dashboard',
        steps: [
          {
            id: 'step-1',
            title: 'Welcome',
            selector: '#main-header',
            script: 'Welcome to your dashboard! This is where you\'ll manage everything.',
            position: 'center',
          },
          {
            id: 'step-2',
            title: 'Navigation',
            selector: '#sidebar-nav',
            script: 'Use this navigation menu to access different sections.',
            position: 'right',
          },
        ],
      },
    ],
  },
  {
    id: 'tour-2',
    client_id: 'demo-client-123',
    name: 'Feature Highlights',
    description: 'Showcase your key features with AI-powered explanations',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    pages: [
      {
        id: 'page-1',
        url: '/features',
        title: 'Features',
        steps: [
          {
            id: 'step-1',
            title: 'Analytics',
            selector: '#analytics-section',
            script: 'Track your performance with real-time analytics.',
            position: 'top',
          },
        ],
      },
    ],
  },
  {
    id: 'tour-3',
    client_id: 'demo-client-123',
    name: 'Settings Guide',
    description: 'Help users configure their preferences',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    pages: [
      {
        id: 'page-1',
        url: '/settings',
        title: 'Settings',
        steps: [
          {
            id: 'step-1',
            title: 'Profile',
            selector: '#profile-settings',
            script: 'Update your profile information here.',
            position: 'bottom',
          },
        ],
      },
    ],
  },
];

export const mockApiKeys = [
  {
    id: 'key-1',
    client_id: 'demo-client-123',
    key: 'nr_live_abc123def456ghi789jkl012mno345pqr678stu901vwx234yz',
    name: 'Production Key',
    active: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'key-2',
    client_id: 'demo-client-123',
    key: 'nr_live_xyz789abc123def456ghi789jkl012mno345pqr678stu901vw',
    name: 'Development Key',
    active: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'key-3',
    client_id: 'demo-client-123',
    key: 'nr_live_old123key456that789was012disabled345for678security901',
    name: 'Old Key (Disabled)',
    active: false,
    created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    last_used: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// Generate mock analytics events
function generateMockEvents() {
  const events = [];
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Generate events for the last 7 days
  for (let day = 0; day < 7; day++) {
    const dayStart = sevenDaysAgo + day * 24 * 60 * 60 * 1000;

    // Tour starts (10-20 per day)
    const viewsCount = Math.floor(Math.random() * 11) + 10;
    for (let i = 0; i < viewsCount; i++) {
      const tourId = mockTours[Math.floor(Math.random() * mockTours.length)].id;
      events.push({
        id: `event-start-${day}-${i}`,
        client_id: 'demo-client-123',
        tour_id: tourId,
        type: 'tour_start',
        created_at: new Date(dayStart + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        metadata: {},
      });

      // 60-80% completion rate
      if (Math.random() < 0.7) {
        events.push({
          id: `event-complete-${day}-${i}`,
          client_id: 'demo-client-123',
          tour_id: tourId,
          type: 'tour_complete',
          created_at: new Date(dayStart + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          metadata: {},
        });
      }

      // 30-50% ask questions
      if (Math.random() < 0.4) {
        events.push({
          id: `event-question-${day}-${i}`,
          client_id: 'demo-client-123',
          tour_id: tourId,
          type: 'question_asked',
          created_at: new Date(dayStart + Math.random() * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { question: 'Sample question' },
        });
      }
    }
  }

  return events.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export const mockAnalyticsEvents = generateMockEvents();
