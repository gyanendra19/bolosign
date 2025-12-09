export const handleUpload = async (file: any) => {
  const formData = new FormData();
  formData.append("pdf", file);

  const response = await fetch(
    "https://bolosign-uow7.onrender.com/api/upload/upload-pdf",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = (await response.json()) as { pdfId: string };
  localStorage.setItem("pdfId", data.pdfId);
};
