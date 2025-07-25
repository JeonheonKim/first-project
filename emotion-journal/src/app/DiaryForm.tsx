"use client";

import React, { useState } from "react";
import { getAuth } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";

const DiaryForm: React.FC = () => {
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = getAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }
    if (!content.trim()) return;
    setLoading(true);
    try {
      // 감정 분석 API 호출
      const res = await fetch("/api/analyzeEmotion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const { emotion, message } = await res.json();
      await addDoc(collection(db, "diaries"), {
        uid: user.uid,
        content,
        emotion,
        emotionMessage: message,
        createdAt: serverTimestamp(),
      });
      setContent("");
    } catch (err) {
      alert("저장에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 w-full max-w-md mx-auto mt-8">
      <textarea
        className="border rounded p-2 min-h-[100px]"
        value={content}
        onChange={e => setContent(e.target.value)}
        placeholder="오늘의 감정을 기록해보세요."
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded self-end disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "분석 중..." : "작성하기"}
      </button>
    </form>
  );
};

export default DiaryForm; 