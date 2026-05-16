'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ScreenMeta {
  id: string;
  screenId: string;
  description: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function AdminPage() {
  const [screens, setScreens] = useState<ScreenMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/screens`)
      .then((r) => r.json())
      .then((data: ScreenMeta[]) => {
        setScreens(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">SDUI Admin</h1>
      <p className="text-sm text-gray-500 mb-8">
        스크린을 선택해 JSON을 편집하고 서버에 반영하세요.
      </p>

      {loading && <p className="text-sm text-gray-400">불러오는 중...</p>}

      {error && (
        <p className="text-sm text-red-500">
          API 서버에 연결할 수 없습니다. ({API_URL})
        </p>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-3">
          {screens.map((screen) => (
            <Link
              key={screen.screenId}
              href={`/admin/preview/${screen.screenId}`}
              className="block p-4 rounded-xl border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors group"
            >
              <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                {screen.screenId}
              </div>
              <div className="text-sm text-gray-500 mt-1">{screen.description}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
