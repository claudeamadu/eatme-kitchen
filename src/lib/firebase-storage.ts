
import { storage } from './firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const PLACEHOLDER_IMAGE = 'https://placehold.co/600x400';

/**
 * Uploads a file to Firebase Storage with a timeout.
 * @param file The file to upload.
 * @param path The path where the file should be stored (e.g., 'images/profiles/user-id.jpg').
 * @returns A promise that resolves with the public download URL of the uploaded file.
 * Returns a placeholder image URL on failure or timeout.
 */
export async function uploadFile(file: File, path: string): Promise<string> {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    let timeoutId: NodeJS.Timeout | null = null;
    let uploadStarted = false;

    const startTimeout = () => {
      timeoutId = setTimeout(() => {
        if (!uploadStarted) {
          uploadTask.cancel();
          console.log('Upload timed out after 5 seconds with no progress.');
          resolve(PLACEHOLDER_IMAGE);
        }
      }, 5000);
    };

    const clearTimeout = () => {
      if (timeoutId) {
        global.clearTimeout(timeoutId);
        timeoutId = null;
      }
    };

    startTimeout();

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        // Progress has been made
        if (progress > 0) {
          uploadStarted = true;
          clearTimeout(); // Clear the initial timeout
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        clearTimeout();
        if (error.code !== 'storage/canceled') {
          console.error("File upload failed:", error);
        }
        resolve(PLACEHOLDER_IMAGE);
      },
      () => {
        // Handle successful uploads on complete
        clearTimeout();
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        }).catch(error => {
          console.error("Failed to get download URL:", error);
          resolve(PLACEHOLDER_IMAGE);
        });
      }
    );
  });
}

/**
 * Deletes a file from Firebase Storage.
 * @param filePath The full path to the file in Firebase Storage (e.g., 'images/profiles/user-id.jpg').
 * @returns A promise that resolves when the file is deleted.
 */
export async function deleteFile(filePath: string): Promise<void> {
  const storageRef = ref(storage, filePath);
  try {
    await deleteObject(storageRef);
  } catch (error: any) {
    // We don't throw an error if the file doesn't exist.
    if (error.code !== 'storage/object-not-found') {
      console.error("Failed to delete file:", error);
      throw error;
    }
  }
}

/**
 * Gets the download URL for a file in Firebase Storage.
 * @param filePath The full path to the file in Firebase Storage.
 * @returns A promise that resolves with the public download URL.
 * Returns a placeholder image URL on failure.
 */
export async function getFileUrl(filePath: string): Promise<string> {
  try {
    const storageRef = ref(storage, filePath);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Failed to get file URL:", error);
    return PLACEHOLDER_IMAGE;
  }
}

/**
 * Downloads a file from a given URL. This is a browser-side download.
 * @param url The URL of the file to download.
 * @param filename The desired name for the downloaded file.
 */
export async function downloadFromUrl(url: string, filename: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok.');
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download failed:", error);
    alert("Failed to download file.");
  }
}
