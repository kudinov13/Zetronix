import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface LeadFormContextValue {
  preselectedSlug: string | null;
  preselectTemplate: (slug: string | null) => void;
}

const LeadFormContext = createContext<LeadFormContextValue | null>(null);

export function LeadFormProvider({ children }: { children: ReactNode }) {
  const [preselectedSlug, setPreselectedSlug] = useState<string | null>(null);

  const preselectTemplate = useCallback((slug: string | null) => {
    setPreselectedSlug(slug);
  }, []);

  return (
    <LeadFormContext.Provider value={{ preselectedSlug, preselectTemplate }}>
      {children}
    </LeadFormContext.Provider>
  );
}

export function useLeadForm(): LeadFormContextValue {
  const ctx = useContext(LeadFormContext);
  if (!ctx) throw new Error("useLeadForm must be used within LeadFormProvider");
  return ctx;
}
