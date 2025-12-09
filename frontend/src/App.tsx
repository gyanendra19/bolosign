import { useState } from "react";
import "./App.css";
import { pdfjs } from "react-pdf";
import PdfPage from "./Components/PdfPage";
import RightPanel from "./Components/RightPanel";
import { DndContext } from "@dnd-kit/core";
import { FieldProvider } from "./contexts/FieldContext";
import { handleUpload } from "./utils/UploadPdf";
import { PageProvider } from "./contexts/PageContext";

function App() {
  const [pdfFile, setPdfFile] = useState("");

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const handleFormChange = (e: any) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFile(file);
    handleUpload(file);
  };

  return (
    <>
      <main className="flex justify-center">
        <FieldProvider>
          <PageProvider>
            <DndContext>
              <div>
                <form className="flex mb-6 mt-10 items-center gap-4 p-4 rounded-lg shadow">
                  <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition">
                    📄 Select PDF
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFormChange}
                      className="hidden"
                    />
                  </label>
                </form>

                <PdfPage pdfFile={pdfFile} />
              </div>

              <RightPanel />
            </DndContext>
          </PageProvider>
        </FieldProvider>
      </main>
    </>
  );
}

export default App;
