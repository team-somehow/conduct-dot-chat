import { createBrowserRouter } from 'react-router-dom';
import LandingPage from '../pages/Landing';
import WorkflowPage from '../pages/Workflow';
import MarketplacePage from '../pages/Marketplace';
import HistoryPage from '../pages/History';
import SettingsPage from '../pages/Settings';

// TODO(Router):
// 1. Add route guards for authenticated routes
// 2. Implement loading states for route transitions
// 3. Add error boundaries for each route
// END TODO

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/run',
    element: <WorkflowPage />,
  },
  {
    path: '/marketplace',
    element: <MarketplacePage />,
  },
  {
    path: '/history',
    element: <HistoryPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
]); 