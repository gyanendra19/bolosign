export const handleUpload = async (file: any) => {
  const formData = new FormData();
  formData.append("pdf", file);

  const response = await fetch("http://localhost:5000/api/upload/upload-pdf", {
    method: "POST",
    body: formData,
  });

  const data = await response.json();
  localStorage.setItem("pdfId", data.pdfId);
};
