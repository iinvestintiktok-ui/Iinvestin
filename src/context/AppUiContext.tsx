import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface AppUiContextValue {
  investModalOpen: boolean;
  openInvestModal: () => void;
  closeInvestModal: () => void;
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

export function AppUiProvider({ children }: { children: ReactNode }) {
  const [investModalOpen, setInvestModalOpen] = useState(false);

  const openInvestModal = useCallback(() => {
    setInvestModalOpen(true);
  }, []);

  const closeInvestModal = useCallback(() => {
    setInvestModalOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      investModalOpen,
      openInvestModal,
      closeInvestModal,
    }),
    [closeInvestModal, investModalOpen, openInvestModal],
  );

  return <AppUiContext.Provider value={value}>{children}</AppUiContext.Provider>;
}

export function useAppUi() {
  const context = useContext(AppUiContext);
  if (!context) {
    throw new Error('useAppUi must be used within AppUiProvider');
  }
  return context;
}
