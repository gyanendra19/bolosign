import { createContext, useContext, useState, type ReactNode } from "react";

export interface Field {
  id: string;
  type: string;
  page: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  signatureImage?: string;
}

interface FieldContextType {
  fields: Field[];
  setFields: (fields: any) => void;
  updateField: (id: string, newData: Partial<Field>) => void;
  deleteField: (id: string) => void;
}

const FieldContext = createContext<FieldContextType | undefined>(undefined);

export const useField = () => {
  const context = useContext(FieldContext);
  if (!context) {
    throw new Error("useField must be used within FieldProvider");
  }
  return context;
};

export const FieldProvider = ({ children }: { children: ReactNode }) => {
  const [fields, setFields] = useState<Field[]>([]);

  const updateField = (id: string, newData: Partial<Field>) => {
    setFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...newData } : field))
    );
  };

  const deleteField = (id: string) => {
    setFields((prev) => prev.filter((field) => field.id !== id));
  };

  return (
    <FieldContext.Provider
      value={{ fields, setFields, updateField, deleteField }}
    >
      {children}
    </FieldContext.Provider>
  );
};
