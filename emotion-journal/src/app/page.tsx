"use client";

import Image from "next/image";
import React, { useEffect, useState } from 'react';
import { signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, provider, db } from '../lib/firebase';
import DiaryForm from "./DiaryForm";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      if (user) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          name: user.displayName,
          photo: user.photoURL,
        }, { merge: true });
        alert('로그인 성공!');
      }
    } catch (error) {
      alert('로그인 실패: ' + (error as Error).message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      {!user && (
        <button
          onClick={handleGoogleLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow"
        >
          Google로 로그인
        </button>
      )}
      <DiaryForm />
    </main>
  );
}
