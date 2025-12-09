import { useRef } from "react";
import { SignatureCanvas } from "react-signature-canvas";
import { useField, type Field } from "../contexts/FieldContext";

interface SignatureCanvasModalProps {
  onOpen: boolean;
  onClose: () => void;
  setSignedImage: (signedImage: string) => void;
  field: Field;
}

const SignatureCanvasModal = ({
  onOpen,
  onClose,
  setSignedImage,
  field,
}: SignatureCanvasModalProps) => {
  const { updateField } = useField();
  const canvasRef = useRef<SignatureCanvas | null>(null);

  const handleSave = () => {
    const canvas = canvasRef.current?.getCanvas();

    if (!canvas) return; // no canvas available

    const dataUrl = canvas.toDataURL("image/png");
    setSignedImage(dataUrl);
    updateField(field.id, { signatureImage: dataUrl });

    onClose();
  };

  const handleClear = () => {
    canvasRef.current?.clear();
  };
  return (
    <div
      className={`fixed inset-0 bg-black/50 items-center justify-center z-50 ${
        onOpen ? "flex" : "hidden"
      }`}
    >
      <div className="bg-white p-4 rounded-md shadow-md w-[450px]">
        <h2 className="text-black text-lg mb-3">Draw Signature</h2>

        <SignatureCanvas
          ref={canvasRef}
          penColor="black"
          canvasProps={{
            width: 400,
            height: 200,
            className: "border border-gray-400 rounded bg-white",
          }}
        />

        <div className="flex justify-between mt-3">
          <button onClick={handleClear} className="px-3 py-1 bg-gray-300">
            Clear
          </button>

          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white"
          >
            Save
          </button>

          <button
            onClick={() => {
              onClose(), setSignedImage("");
            }}
            className="px-3 py-1 bg-red-500 text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignatureCanvasModal;
