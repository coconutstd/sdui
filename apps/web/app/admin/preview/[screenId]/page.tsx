'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { SDUIRenderer } from '@/components/sdui/SDUIRenderer';
import { VisualEditor } from '@/components/visual-editor/VisualEditor';
import type { SDUIScreen } from '@sdui/schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

interface PageProps {
  params: Promise<{ screenId: string }>;
}

export default function PreviewPage({ params }: PageProps) {
  const { screenId } = use(params);

  const [jsonText, setJsonText] = useState('');
  const [parsed, setParsed] = useState<SDUIScreen | null>(null);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  // VisualEditor를 재마운트해 외부 변경(초기화)을 반영하는 키
  const [editorKey, setEditorKey] = useState(0);

  const fetchScreen = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/screens/${screenId}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SDUIScreen = await res.json();
      setJsonText(JSON.stringify(data, null, 2));
      setParsed(data);
      setJsonError(null);
      setEditorKey((k) => k + 1);
    } catch (e) {
      setJsonError(`불러오기 실패: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [screenId]);

  useEffect(() => {
    fetchScreen();
  }, [fetchScreen]);

  function handleJsonChange(text: string) {
    setJsonText(text);
    try {
      setParsed(JSON.parse(text) as SDUIScreen);
      setJsonError(null);
    } catch {
      setJsonError('유효하지 않은 JSON입니다');
      setParsed(null);
    }
  }

  function handleScreenChange(screen: SDUIScreen) {
    setParsed(screen);
    setJsonText(JSON.stringify(screen, null, 2));
  }

  async function handleSave() {
    if (!parsed) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/screens/${screenId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSaveMsg('저장됨 ✓');
      setTimeout(() => setSaveMsg(null), 2000);
    } catch (e) {
      setSaveMsg(`오류: ${e instanceof Error ? e.message : String(e)}`);
      setTimeout(() => setSaveMsg(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* 헤더 */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-gray-200 shrink-0">
        <a
          href="/admin"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors"
        >
          ← Admin
        </a>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">{screenId}</span>

        <div className="ml-auto flex items-center gap-2">
          {saveMsg && (
            <span className="text-sm text-green-600 font-medium">{saveMsg}</span>
          )}
          {/* JSON 모드 토글 */}
          <button
            onClick={() => setDevMode((v) => !v)}
            title={devMode ? '비주얼 모드로 전환' : 'JSON 모드로 전환'}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
              devMode
                ? 'bg-gray-900 text-green-400 border-gray-700'
                : 'border-gray-200 text-gray-500 hover:bg-gray-50'
            }`}
          >
            {devMode ? '{ } JSON 모드' : '{ } JSON 모드'}
          </button>
          <button
            onClick={fetchScreen}
            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            초기화
          </button>
          <button
            onClick={handleSave}
            disabled={saving || (devMode && (!!jsonError || !parsed)) || !parsed}
            className="px-3 py-1.5 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 transition-colors"
          >
            {saving ? '저장 중...' : '서버에 저장'}
          </button>
        </div>
      </header>

      {devMode ? (
        /* JSON 에디터 모드 */
        <div className="flex flex-1 overflow-hidden">
          <div className="w-1/2 flex flex-col border-r border-gray-200">
            <div className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border-b border-gray-200 shrink-0">
              JSON 에디터
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              className="flex-1 p-4 font-mono text-sm resize-none outline-none bg-gray-950 text-green-400 leading-relaxed"
              spellCheck={false}
            />
            {jsonError && (
              <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-200 shrink-0">
                {jsonError}
              </div>
            )}
          </div>
          <div className="w-1/2 flex flex-col">
            <div className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border-b border-gray-200 shrink-0">
              미리보기
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50">
              {parsed ? (
                <SDUIRenderer component={parsed.root} />
              ) : (
                <p className="text-sm text-gray-400">
                  유효한 JSON을 입력하면 미리보기가 표시됩니다.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* 비주얼 에디터 모드 */
        parsed && (
          <VisualEditor
            key={editorKey}
            screen={parsed}
            onScreenChange={handleScreenChange}
          />
        )
      )}
    </div>
  );
}
