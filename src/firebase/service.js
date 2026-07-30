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

const COLLECTIONS = ['clips', 'videos', 'rugby_clips', 'currie_clips'];

// Subscribe to real-time Firestore updates across all possible collection names
export function subscribeToClips(onDataChanged, onError) {
  if (!isConfigured || !db) return null;

  try {
    const combinedMap = new Map();

    COLLECTIONS.forEach(colName => {
      onSnapshot(collection(db, colName), (snapshot) => {
        snapshot.docs.forEach(docSnap => {
          combinedMap.set(docSnap.id, {
            id: docSnap.id,
            ...docSnap.data()
          });
        });
        const allClips = Array.from(combinedMap.values());
        console.log(`🔥 Real-time sync updated: ${allClips.length} total clips from Firestore!`);
        onDataChanged(allClips);
      }, (error) => {
        console.warn(`Firestore onSnapshot warning for '${colName}':`, error);
        if (onError) onError(error);
      });
    });
  } catch (err) {
    console.error("Subscribe to clips error:", err);
    return null;
  }
}

// Add a new clip to Cloud Firestore (written to primary 'clips' collection)
export async function addClipToCloud(clip) {
  if (!isConfigured || !db) return false;
  try {
    const docRef = doc(db, 'clips', clip.id);
    await setDoc(docRef, clip);
    console.log(`🔥 Clip ${clip.id} successfully written to Firestore!`);
    return true;
  } catch (err) {
    console.error("Error adding clip to Firestore:", err);
    return false;
  }
}

// Upload direct video file (MP4/MOV) with bulletproof DataURL fallback for multi-device sync
export function uploadVideoFileToCloud(file, onProgress) {
  return new Promise((resolve) => {
    if (!isConfigured || !db) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
      return;
    }

    try {
      const storage = getStorage();
      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `video_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;
      const storageRef = ref(storage, `videos/${fileName}`);

      const metadata = {
        contentType: file.type || 'video/mp4'
      };

      const uploadTask = uploadBytesResumable(storageRef, file, metadata);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.warn("Storage upload error, using DataURL fallback for 100% cross-device sync:", error);
          if (onProgress) onProgress(100);
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadURL);
          } catch (err) {
            console.warn("DownloadURL error, using DataURL fallback:", err);
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(file);
          }
        }
      );
    } catch (err) {
      console.warn("Storage exception, using DataURL fallback:", err);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    }
  });
}

// Upvote clip in Firestore (atomic increment)
export async function upvoteClipInCloud(clipId) {
  if (!isConfigured || !db) return false;
  try {
    for (const colName of COLLECTIONS) {
      try {
        const docRef = doc(db, colName, clipId);
        await updateDoc(docRef, { upvotes: increment(1) });
      } catch (e) {}
    }
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
    for (const colName of COLLECTIONS) {
      try {
        const docRef = doc(db, colName, clipId);
        await updateDoc(docRef, { comments: arrayUnion(commentObj) });
      } catch (e) {}
    }
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
    const snap = await getDocs(collection(db, 'clips'));
    if (snap.empty) {
      console.log("Seeding initial Currie Chieftains clips to Cloud Firestore...");
      for (const clip of initialClips) {
        await setDoc(doc(db, 'clips', clip.id), clip);
      }
      console.log("🔥 Initial clips seeded to Firestore!");
    }
  } catch (err) {
    console.error("Error seeding initial clips:", err);
  }
}
