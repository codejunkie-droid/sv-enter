import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0PQNCICLfIiZosIdzJmfcTiajY52AdaM",
  authDomain: "sv-enterprises-f0aff.firebaseapp.com",
  projectId: "sv-enterprises-f0aff",
  storageBucket: "sv-enterprises-f0aff.firebasestorage.app",
  messagingSenderId: "195350134436",
  appId: "1:195350134436:web:31f0ee56490b3ae19fb031",
  measurementId: "G-Z92DRTH7CF",
};

const app = initializeApp(firebaseConfig);

isAnalyticsSupported()
  .then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  })
  .catch((error) => {
    console.error("Firebase Analytics initialization failed", error);
  });
