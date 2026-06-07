import TokenManager from "../src/security/token-manager.js";
import dotenv from "dotenv";

dotenv.config();

async function run() {
  const token = TokenManager.generateAccessToken({ id: "user-test" });
  console.log("Generated token:", token);

  const form = new FormData();
  form.append("termName", "Test Term");
  form.append("description", "Test Description");
  form.append("categoryId", "cat-test"); // Mock or placeholder category

  // Create mock files using Blob / File
  const thumbnailBlob = new Blob(["fake image content"], { type: "image/jpeg" });
  const videoBlob = new Blob(["fake video content"], { type: "video/mp4" });

  form.append("thumbnail", thumbnailBlob, "test_thumb.jpg");
  form.append("video", videoBlob, "test_video.mp4");

  try {
    const response = await fetch("http://localhost:3000/glosarium", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    });

    const data = await response.json();
    console.log("Upload response status:", response.status);
    console.log("Upload response data:", data);
  } catch (error) {
    console.error("Upload Failed:", error.message);
  }
}

run();
