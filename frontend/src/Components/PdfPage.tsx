import { useState } from "react";
import { Document, Page } from "react-pdf";
import DraggableField from "./DraggableField";
import { useField } from "../contexts/FieldContext";
import { usePage } from "../contexts/PageContext";

interface PdfFileProps {
  pdfFile: any;
}

function PdfPage({ pdfFile }: PdfFileProps) {
  const [numPages, setNumPages] = useState<number>();
  //   const [pageNumber, setPageNumber] = useState<number>(1);
  const { fields } = useField();
  const { pageRefs } = usePage();

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="pdf-container">
      <Document
        file={pdfFile}
        onLoadSuccess={onDocumentLoadSuccess}
        className="w-full flex flex-col items-center"
      >
        {Array.apply(null, Array(numPages))
          .map((_, i: number) => i + 1)
          .map((page) => (
            <div
              key={page}
              ref={(el: any) => (pageRefs.current[page] = el)}
              data-page={page}
              className="relative w-full flex flex-col items-center mb-10"
            >
              <p className="text-sm text-white mb-4">
                Page {page} of {numPages}
              </p>

              <div className="w-full md:w-[80%] lg:w-[70%] flex justify-center">
                <div className="relative">
                  {/* PDF Render */}
                  <Page
                    pageNumber={page}
                    renderTextLayer={false}
                    renderAnnotationLayer={false}
                    className="shadow-lg rounded-lg border"
                    width={Math.min(window.innerWidth - 40, 600)}
                  />

                  {/* Fields overlay */}
                  <div className="absolute inset-0">
                    {fields
                      .filter((f) => f.page === page)
                      .map((field) => (
                        <DraggableField key={field.id} field={field} />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
      </Document>
    </div>
  );
}

export default PdfPage;
