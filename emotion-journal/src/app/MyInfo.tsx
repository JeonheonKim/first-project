"use client";

import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User, signOut } from "firebase/auth";
import { collection, query, where, orderBy, onSnapshot, Timestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

interface Diary {
  id: string;
  content: string;
  createdAt: Timestamp | null;
}

const MyInfo: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [diaries, setDiaries] = useState<Diary[]>([]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setDiaries([]);
      return;
    }
    const q = query(
      collection(db, "diaries"),
      where("uid", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDiaries(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Diary[]
      );
    });
    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(getAuth());
  };

  return (
    <div className="fixed top-4 right-4 bg-white/90 rounded-lg px-4 py-2 shadow flex flex-col items-end gap-3 z-50 border border-gray-200 min-w-[220px] max-w-xs">
      <div className="flex items-center gap-3 w-full">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="프로필"
            className="w-8 h-8 rounded-full border object-cover"
          />
        )}
        <div className="flex flex-col text-right flex-1">
          <span className="font-semibold text-sm">{user.displayName || '이름 없음'}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 text-gray-700"
        >
          로그아웃
        </button>
      </div>
      {diaries.length > 0 && (
        <div className="w-full max-h-48 overflow-y-auto mt-2">
          <div className="text-xs font-bold mb-1 text-gray-700">내 감정일기</div>
          <ul className="space-y-1">
            {diaries.map((d) => (
              <li key={d.id} className="bg-gray-50 rounded p-2 border text-xs text-gray-800">
                <div className="whitespace-pre-line break-words mb-1">{d.content}</div>
                <div className="text-[10px] text-gray-400 text-right">
                  {d.createdAt?.toDate ? d.createdAt.toDate().toLocaleString() : ''}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MyInfo; 