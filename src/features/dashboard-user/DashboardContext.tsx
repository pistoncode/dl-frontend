import { createContext, useContext, useMemo, PropsWithChildren } from 'react';

type DashboardState = {
  userName: string;
};

const DashboardContext = createContext<DashboardState | undefined>(undefined);

export function DashboardProvider({ children }: PropsWithChildren<{}>) {
  const value = useMemo<DashboardState>(() => ({ userName: 'User' }), []);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}