import { createContext, useContext, useRef, useState } from "react";

interface PDFContextProps {
  pageRefs: React.MutableRefObject<Record<number, HTMLElement | null>>;
  currentPage: number;
  setCurrentPage: (page: number) => void;
}

const PDFContext = createContext<PDFContextProps | null>(null);

export const PageProvider = ({ children }: { children: React.ReactNode }) => {
  const pageRefs = useRef<Record<number, HTMLElement | null>>({});
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <PDFContext.Provider value={{ pageRefs, currentPage, setCurrentPage }}>
      {children}
    </PDFContext.Provider>
  );
};

export const usePage = () => {
  const ctx = useContext(PDFContext);
  if (!ctx) throw new Error("usePDF must be used inside PDFProvider");
  return ctx;
};
