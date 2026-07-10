import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '../services/dashboardService'

const DASHBOARD_KEY = 'dashboard'

export function useDashboardSummary() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'summary'],
    queryFn: () => dashboardService.getSummary(),
  })
}

export function useDashboardMap() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'map'],
    queryFn: () => dashboardService.getMapData(),
  })
}

export function useRecentOperations() {
  return useQuery({
    queryKey: [DASHBOARD_KEY, 'recent-operations'],
    queryFn: () => dashboardService.getRecentOperations(),
  })
}
