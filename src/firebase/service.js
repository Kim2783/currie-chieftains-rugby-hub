import { db, isConfigured } from './config.js';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  increment, 
  arrayUnion, 
  getDocs
} from 'firebase/firestore';

const COLLECTION_NAME = 'clips';

// Subscribe to real-time Firestore updates for ALL clips
export function subscribeToClips(onDataChanged, onError) {
  if (!isConfigured || !db) return null;

  try {
    const colRef = collection(db, COLLECTION_NAME);
    return onSnapshot(colRef, (snapshot) => {
      const clips = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      console.log(`🔥 Received ${clips.length} live clips from Cloud Firestore!`);
      onDataChanged(clips);
    }, (error) => {
      console.error("Firestore onSnapshot error:", error);
      if (onError) onError(error);
    });
  } catch (err) {
    console.error("Subscribe to clips error:", err);
    return null;
  }
}

// Add a new clip to Cloud Firestore
export async function addClipToCloud(clip) {
  if (!isConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTION_NAME, clip.id);
    await setDoc(docRef, clip);
    console.log(`🔥 Clip ${clip.id} successfully written to Firestore!`);
    return true;
  } catch (err) {
    console.error("Error adding clip to Firestore:", err);
    return false;
  }
}

// Upload direct video file (MP4/MOV) with auto-CORS timeout fallback
export function uploadVideoFileToCloud(file, onProgress) {
  return new Promise((resolve, reject) => {
    let resolved = false;

    if (!isConfigured || !db) {
      console.log("Firebase not fully configured for Cloud Storage, using local blob");
      const localBlobUrl = URL.createObjectURL(file);
      if (onProgress) onProgress(100);
      resolve(localBlobUrl);
      return;
    }

    try {
      const storage = getStorage();
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const storageRef = ref(storage, `videos/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      // Timeout safeguard: If Storage bucket CORS hangs at 0% for > 4.5 seconds, auto-fallback to local Blob
      const timeoutId = setTimeout(() => {
        if (!resolved && uploadTask.snapshot.bytesTransferred === 0) {
          console.warn("⚠️ Firebase Storage CORS timeout (stuck at 0%). Falling back to local Blob video player.");
          uploadTask.cancel();
          resolved = true;
          if (onProgress) onProgress(100);
          const localBlobUrl = URL.createObjectURL(file);
          resolve(localBlobUrl);
        }
      }, 4500);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (resolved) return;
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          if (resolved) return;
          clearTimeout(timeoutId);
          console.warn("Storage upload error:", error);
          resolved = true;
          if (onProgress) onProgress(100);
          const localBlobUrl = URL.createObjectURL(file);
          resolve(localBlobUrl);
        },
        async () => {
          if (resolved) return;
          clearTimeout(timeoutId);
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolved = true;
            resolve(downloadURL);
          } catch (err) {
            resolved = true;
            const localBlobUrl = URL.createObjectURL(file);
            resolve(localBlobUrl);
          }
        }
      );
    } catch (err) {
      console.warn("Upload exception:", err);
      if (!resolved) {
        resolved = true;
        if (onProgress) onProgress(100);
        const localBlobUrl = URL.createObjectURL(file);
        resolve(localBlobUrl);
      }
    }
  });
}

// Upvote clip in Firestore (atomic increment)
export async function upvoteClipInCloud(clipId) {
  if (!isConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTION_NAME, clipId);
    await updateDoc(docRef, {
      upvotes: increment(1)
    });
    return true;
  } catch (err) {
    console.error("Error upvoting in Firestore:", err);
    return false;
  }
}

// Add comment to clip document in Firestore
export async function addCommentToCloud(clipId, commentObj) {
  if (!isConfigured || !db) return false;
  try {
    const docRef = doc(db, COLLECTION_NAME, clipId);
    await updateDoc(docRef, {
      comments: arrayUnion(commentObj)
    });
    return true;
  } catch (err) {
    console.error("Error adding comment to Firestore:", err);
    return false;
  }
}

// Auto-seed initial clips if Firestore collection is empty
export async function seedInitialClipsIfEmpty(initialClips) {
  if (!isConfigured || !db) return;
  try {
    const snap = await getDocs(collection(db, COLLECTION_NAME));
    if (snap.empty) {
      console.log("Seeding initial Currie Chieftains clips to Cloud Firestore...");
      for (const clip of initialClips) {
        await setDoc(doc(db, COLLECTION_NAME, clip.id), clip);
      }
      console.log("🔥 Initial clips seeded to Firestore!");
    }
  } catch (err) {
    console.error("Error seeding initial clips:", err);
  }
}
