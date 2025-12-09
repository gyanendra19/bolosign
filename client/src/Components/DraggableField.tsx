import { useDraggable } from "@dnd-kit/core";
import { Rnd } from "react-rnd";
import { useField, type Field } from "../contexts/FieldContext";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import SignatureCanvasModal from "./SignatureCanvasModal";

interface DraggableFieldProps {
  field: Field;
}

const DraggableField = ({ field }: DraggableFieldProps) => {
  const [textValue, setTextValue] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [openCanvasModal, setOpenCanvasModal] = useState(false);
  const [signedImage, setSignedImage] = useState("");
  const { updateField, deleteField } = useField();

  const { setNodeRef, attributes, listeners } = useDraggable({
    id: field.id,
  });

  const handleImageUpload = (e: any) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file) return;

    const imageURL = URL.createObjectURL(file);
    setPreviewUrl(imageURL);
  };

  const containerWidth = 600; // Change when responsive
  const containerHeight = 800;

  return (
    <>
      <Rnd
        bounds="parent"
        size={{
          width: field.widthPercent * containerWidth,
          height: field.heightPercent * containerHeight,
        }}
        position={{
          x: field.xPercent * containerWidth,
          y: field.yPercent * containerHeight,
        }}
        onDragStop={(_e, d) => {
          updateField(field.id, {
            xPercent: d.x / containerWidth,
            yPercent: d.y / containerHeight,
          });
        }}
        onResizeStop={(_e, _direction, ref, _delta, pos) => {
          updateField(field.id, {
            widthPercent: ref.offsetWidth / containerWidth,
            heightPercent: ref.offsetHeight / containerHeight,
            xPercent: pos.x / containerWidth,
            yPercent: pos.y / containerHeight,
          });
        }}
      >
        <div className="relative flex justify-center w-full h-full border-2 border-dashed border-black bg-black/20">
          {/* Delete Icon Button */}
          <button
            onClick={() => deleteField(field.id)}
            className="absolute -top-6 bg-transparent right-[40%] w-6 h-6 flex items-center justify-centerbg-red-50 text-red-500 rounded-full shadow-sm cursor-pointer transition-colors z-20"
          >
            <Trash2 size={14} />
          </button>

          {/* Drag Handle */}
          <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className="absolute top-0 left-0 w-full h-4 cursor-move rounded-t-md z-10 bg-transparent"
          />
          {field.type === "Image Box" ? (
            previewUrl ? (
              <img
                className="w-full h-full object-contain"
                src={previewUrl}
                alt="preview"
              />
            ) : (
              <input
                accept="image/*"
                type="file"
                name="imageField"
                id="imageField"
                className="w-full text-black h-full cursor-pointer"
                onChange={(e) => handleImageUpload(e)}
              />
            )
          ) : field.type === "Signature" ? (
            signedImage ? (
              <img src={signedImage} alt="signedImage" />
            ) : (
              <div className="w-full flex items-center justify-center text-black h-full cursor-pointer">
                <button
                  className="p-2 border-none"
                  onClick={() => setOpenCanvasModal(true)}
                >
                  Draw
                </button>
              </div>
            )
          ) : field.type === "Date" ? (
            <input
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              type="date"
              className="text-black"
              name=""
              id=""
            />
          ) : field.type === "Radio" ? (
            <input
              className="text-black h-full cursor-pointer"
              type="radio"
              name=""
              id=""
            />
          ) : (
            <input
              id="field"
              name="field"
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder={field.type}
              className="w-full h-full p-1.5 bg-white text-black"
              type="text"
            />
          )}
        </div>
      </Rnd>
      {openCanvasModal && (
        <SignatureCanvasModal
          onOpen={openCanvasModal}
          onClose={() => setOpenCanvasModal(!openCanvasModal)}
          setSignedImage={setSignedImage}
          field={field}
        />
      )}
    </>
  );
};

export default DraggableField;
