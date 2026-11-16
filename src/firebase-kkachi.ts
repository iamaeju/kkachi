import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCo6h6JEGWQrd4Gi36anV5DEXicyk8D-9I",
  authDomain: "kkachi-10b06.firebaseapp.com",
  projectId: "kkachi-10b06",
  storageBucket: "kkachi-10b06.firebasestorage.app",
  messagingSenderId: "810228763873",
  appId: "1:810228763873:web:ed15b59b92c3ed35e2bba0",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface LiveMeetup {
  id: string;
  title: string;
  hostName: string;
  category: string;
  address: string;
  participants: string[];
  capacity: number;
}

export function subscribeLiveMeetups(callback: (meetups: LiveMeetup[]) => void) {
  return onSnapshot(collection(db, "meetups"), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() } as LiveMeetup)));
  });
}
