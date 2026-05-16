'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { SDUIRenderer } from '@/components/sdui/SDUIRenderer';
import type { SDUIScreen } from '@sdui/schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export default function Home() {
  const searchParams = useSearchParams();
  const screenId = searchParams.get('screen') ?? 'home';

  const [screen, setScreen] = useState<SDUIScreen | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setScreen(null);
    setError(null);
    fetch(`${API_URL}/screens/${screenId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Screen '${screenId}'을 찾을 수 없습니다`);
        return r.json();
      })
      .then((data: SDUIScreen) => setScreen(data))
      .catch((e: Error) => setError(e.message));
  }, [screenId]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-16 px-6">
      <div className="w-full max-w-md">
        {!screen && !error && (
          <p className="text-sm text-gray-400 text-center">불러오는 중...</p>
        )}
        {error && (
          <p className="text-sm text-red-500 text-center">{error}</p>
        )}
        {screen && <SDUIRenderer component={screen.root} />}
      </div>
    </div>
  );
}
