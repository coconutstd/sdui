'use client';

import { useReducer, useState } from 'react';
import type { Component, SDUIScreen } from '@sdui/schema';
import { SDUIRenderer } from '@/components/sdui/SDUIRenderer';
import { ComponentTree } from './ComponentTree';
import { ComponentPalette } from './ComponentPalette';
import { PropertiesPanel } from './PropertiesPanel';
import {
  addChildAtPath,
  deleteAtPath,
  getAtPath,
  moveAtPath,
  updateAtPath,
  updateScreenRoot,
  type ComponentPath,
} from './editor-utils';

type EditorAction =
  | { type: 'SELECT'; path: ComponentPath | null }
  | { type: 'UPDATE_COMPONENT'; path: ComponentPath; updater: (c: Component) => Component }
  | { type: 'DELETE'; path: ComponentPath }
  | { type: 'MOVE'; path: ComponentPath; direction: 'up' | 'down' }
  | { type: 'ADD_CHILD'; parentPath: ComponentPath; component: Component }
  | { type: 'SET_SCREEN'; screen: SDUIScreen };

interface EditorState {
  screen: SDUIScreen;
  selectedPath: ComponentPath | null;
}

function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case 'SELECT':
      return { ...state, selectedPath: action.path };

    case 'UPDATE_COMPONENT': {
      const newRoot = updateAtPath(state.screen.root, action.path, action.updater);
      return { ...state, screen: updateScreenRoot(state.screen, newRoot) };
    }

    case 'DELETE': {
      const newRoot = deleteAtPath(state.screen.root, action.path);
      return { screen: updateScreenRoot(state.screen, newRoot), selectedPath: null };
    }

    case 'MOVE': {
      const newRoot = moveAtPath(state.screen.root, action.path, action.direction);
      return { ...state, screen: updateScreenRoot(state.screen, newRoot) };
    }

    case 'ADD_CHILD': {
      const newRoot = addChildAtPath(state.screen.root, action.parentPath, action.component);
      return { screen: updateScreenRoot(state.screen, newRoot), selectedPath: null };
    }

    case 'SET_SCREEN':
      return { screen: action.screen, selectedPath: null };

    default:
      return state;
  }
}

interface Props {
  screen: SDUIScreen;
  onScreenChange: (screen: SDUIScreen) => void;
}

export function VisualEditor({ screen, onScreenChange }: Props) {
  const [state, dispatch] = useReducer(editorReducer, {
    screen,
    selectedPath: null,
  });

  const [leftTab, setLeftTab] = useState<'tree' | 'palette'>('tree');

  // 외부(page.tsx) → 내부 동기화: screen prop 변경 시 (초기화 버튼 등)
  // useEffect 없이 key prop으로 처리 — 부모가 key를 바꾸면 재마운트
  // 여기서는 dispatch를 통한 내부 변경만 onScreenChange로 올려보냄

  function dispatchAndSync(action: EditorAction) {
    dispatch(action);
    // 다음 렌더에서 state가 변하므로 즉시 계산
    const next = editorReducer(state, action);
    onScreenChange(next.screen);
  }

  const selectedComponent =
    state.selectedPath !== null ? getAtPath(state.screen.root, state.selectedPath) : null;

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 좌측: 트리 + 팔레트 */}
      <div className="w-64 flex flex-col border-r border-gray-200 shrink-0 overflow-hidden bg-white">
        <div className="flex border-b border-gray-200 shrink-0">
          <button
            onClick={() => setLeftTab('tree')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              leftTab === 'tree'
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            구조
          </button>
          <button
            onClick={() => setLeftTab('palette')}
            className={`flex-1 py-2 text-xs font-medium transition-colors ${
              leftTab === 'palette'
                ? 'bg-white border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 bg-gray-50 hover:bg-gray-100'
            }`}
          >
            + 추가
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {leftTab === 'tree' ? (
            <ComponentTree
              root={state.screen.root}
              selectedPath={state.selectedPath}
              dispatch={(action) => {
                if (action.type === 'SELECT') {
                  dispatch({ type: 'SELECT', path: action.path });
                  return;
                }
                if (action.type === 'DELETE') {
                  dispatchAndSync({ type: 'DELETE', path: action.path });
                  return;
                }
                if (action.type === 'MOVE' && action.direction) {
                  dispatchAndSync({ type: 'MOVE', path: action.path, direction: action.direction });
                }
              }}
            />
          ) : (
            <ComponentPalette
              root={state.screen.root}
              selectedPath={state.selectedPath}
              onAdd={(parentPath, component) =>
                dispatchAndSync({ type: 'ADD_CHILD', parentPath, component })
              }
            />
          )}
        </div>
      </div>

      {/* 가운데: 미리보기 */}
      <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
        <div className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border-b border-gray-200 shrink-0">
          미리보기
        </div>
        <div className="flex-1 overflow-auto p-6">
          <SDUIRenderer component={state.screen.root} />
        </div>
      </div>

      {/* 우측: 속성 패널 */}
      <div className="w-72 border-l border-gray-200 shrink-0 flex flex-col overflow-hidden bg-white">
        <div className="px-4 py-2 text-xs font-medium text-gray-400 bg-gray-50 border-b border-gray-200 shrink-0">
          속성
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <PropertiesPanel
            component={selectedComponent}
            path={state.selectedPath}
            onUpdate={(updater) => {
              if (state.selectedPath === null) return;
              dispatchAndSync({
                type: 'UPDATE_COMPONENT',
                path: state.selectedPath,
                updater,
              });
            }}
          />
        </div>
      </div>
    </div>
  );
}
