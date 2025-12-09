import { useEffect, useState } from "react";
import { useField, type Field } from "../contexts/FieldContext";
import { usePage } from "../contexts/PageContext";

const rightPanelControls = [
  { id: "name", controlName: "Name" },
  { id: "signature", controlName: "Signature" },
  { id: "date", controlName: "Date" },
  { id: "image", controlName: "Image Box" },
  { id: "radio", controlName: "Radio" },
];

const RightPanel = () => {
  const [signaturePresent, setSignaturePresent] = useState(false);
  const [signatureObject, setSignatureObject] = useState<Field | null>(null);
  const [signedUrl, setSignedUrl] = useState("");
  const { fields, setFields } = useField();
  const [isSigning, setIsSigning] = useState(false);
  const { currentPage } = usePage();

  // check if there is an signature image in the signature field
  useEffect(() => {
    const signatureExists = () => {
      const signatureField = fields.find((field) => field.type === "Signature");
      if (signatureField) {
        setSignatureObject(signatureField);
      }

      if (signatureField?.signatureImage) {
        setSignaturePresent(true);
        return;
      }

      setSignaturePresent(false);
    };

    signatureExists();
  }, [fields]);

  // sign the pdf
  const handleSignPdf = async () => {
    const pdfId = localStorage.getItem("pdfId");
    if (!signatureObject) {
      console.log("No Signature present");
      return;
    }
    const payload = {
      pdfId,
      signatureImage: signatureObject.signatureImage,
      box: {
        widthPercent: signatureObject.widthPercent,
        heightPercent: signatureObject.heightPercent,
        xPercent: signatureObject.xPercent,
        yPercent: signatureObject.yPercent,
      },
    };

    try {
      setIsSigning(true);
      const response = await fetch(
        "https://bolosign-uow7.onrender.com/api/sign/sign-pdf",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();
      setSignedUrl(data.url);
      setIsSigning(false);
    } catch (err) {
      console.log("Error signing pdf");
      setIsSigning(false);
    } finally {
      setIsSigning(false);
    }
  };

  // add field to the fields array
  const addField = (name: string) => {
    const checkSignature = fields.some((field) => field.type === "Signature");
    if (checkSignature) {
      alert("You can only add one signature to the pdf");
      return;
    }

    const field = {
      id: crypto.randomUUID(),
      type: name,
      page: currentPage,
      xPercent: 0.1,
      yPercent: 0.1,
      widthPercent: 0.2,
      heightPercent: 0.07,
    };

    setFields((prev: Field[]) => [...prev, field]);
  };

  return (
    <aside className="fixed right-4 top-1/3 w-56 bg-white shadow-xl rounded-xl p-4 space-y-3 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-2">Actions</h3>

      <div className="grid grid-cols-1 gap-3">
        {rightPanelControls.map((controls) => (
          <button
            key={controls.controlName}
            onClick={() => addField(controls.controlName)}
            className="w-[80%] flex mx-auto py-2 px-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            ➕ {controls.controlName}
          </button>
        ))}
      </div>

      {signaturePresent && (
        <button
          onClick={handleSignPdf}
          className="w-full py-2 px-3 text-white bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {isSigning ? (
            <div className="flex items-center justify-center gap-2">
              <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing...
            </div>
          ) : (
            "✍️ Sign PDF"
          )}
        </button>
      )}

      {signedUrl && (
        <a
          href={`https://bolosign-uow7.onrender.com${signedUrl}`}
          target="_blank"
          className="block w-full py-2 px-3 text-white bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium text-center transition focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          📄 Open Signed PDF
        </a>
      )}
    </aside>
  );
};

export default RightPanel;
