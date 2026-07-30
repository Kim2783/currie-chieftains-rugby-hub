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
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';

const COLLECTION_NAME = 'clips';

// Subscribe to real-time Firestore updates
export function subscribeToClips(onDataChanged, onError) {
  if (!isConfigured || !db) return null;

  try {
    const q = query(collection(db, COLLECTION_NAME), orderBy('dateAdded', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const clips = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
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
    return true;
  } catch (err) {
    console.error("Error adding clip to Firestore:", err);
    return false;
  }
}

// Upload direct video file (MP4/MOV) to Firebase Storage
export function uploadVideoFileToCloud(file, onProgress) {
  return new Promise((resolve, reject) => {
    if (!isConfigured || !db) {
      reject(new Error("Firebase is not configured"));
      return;
    }

    try {
      const storage = getStorage();
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const storageRef = ref(storage, `videos/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error("Firebase Storage upload error:", error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    } catch (err) {
      console.error("Upload error:", err);
      reject(err);
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
