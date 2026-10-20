const acceptedImageTypes = ["image/jpeg", "image/png", "image/webp"];

export async function prepareUpload(file: File) {
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Choose a file smaller than 10 MB.");
  }

  if (file.type === "application/pdf") return file;
  if (!acceptedImageTypes.includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP, or PDF file.");
  }
  if (file.size < 350 * 1024) return file;

  const image = await createImageBitmap(file);
  const scale = Math.min(1, 2000 / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    image.close();
    throw new Error("Your browser could not prepare this image.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  image.close();

  const compressed = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/webp", 0.82);
  });
  if (!compressed) throw new Error("Image compression failed. Try a different image.");
  return new File([compressed], `${file.name.replace(/\.[^.]+$/, "")}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}
