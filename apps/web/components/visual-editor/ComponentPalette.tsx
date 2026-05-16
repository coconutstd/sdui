import type { Component } from '@sdui/schema';
import { generateId, getAtPath, isContainer, type ComponentPath } from './editor-utils';

interface PaletteItem {
  type: string;
  icon: string;
  label: string;
  description: string;
  factory: (id: string) => Component;
}

const PALETTE_ITEMS: PaletteItem[] = [
  {
    type: 'text',
    icon: 'T',
    label: '텍스트',
    description: '제목, 본문, 캡션 등 텍스트 블록',
    factory: (id) => ({
      id,
      type: 'text',
      props: { content: '텍스트를 입력하세요', style: 'body' },
    }),
  },
  {
    type: 'image',
    icon: '🖼',
    label: '이미지',
    description: 'URL로 이미지 표시',
    factory: (id) => ({
      id,
      type: 'image',
      props: { src: '', alt: '이미지 설명' },
    }),
  },
  {
    type: 'button',
    icon: '⬜',
    label: '버튼',
    description: '탭 액션을 수행하는 버튼',
    factory: (id) => ({
      id,
      type: 'button',
      props: { label: '버튼', variant: 'primary', action: { type: 'navigate', url: '/' } },
    }),
  },
  {
    type: 'stack',
    icon: '☰',
    label: '스택',
    description: '컴포넌트를 가로/세로로 배치',
    factory: (id) => ({
      id,
      type: 'stack',
      props: { direction: 'column', gap: 8, children: [] },
    }),
  },
  {
    type: 'card',
    icon: '▭',
    label: '카드',
    description: '테두리와 배경이 있는 컨테이너',
    factory: (id) => ({
      id,
      type: 'card',
      props: { children: [] },
    }),
  },
  {
    type: 'list',
    icon: '≡',
    label: '리스트',
    description: '반복 아이템을 세로로 나열',
    factory: (id) => ({
      id,
      type: 'list',
      props: { items: [] },
    }),
  },
];

interface Props {
  root: Component;
  selectedPath: ComponentPath | null;
  onAdd: (parentPath: ComponentPath, component: Component) => void;
}

export function ComponentPalette({ root, selectedPath, onAdd }: Props) {
  const selectedComponent = selectedPath !== null ? getAtPath(root, selectedPath) : null;
  const selectedIsContainer = selectedComponent ? isContainer(selectedComponent) : false;
  const rootIsContainer = isContainer(root);

  const targetPath: ComponentPath | null = selectedIsContainer
    ? selectedPath
    : rootIsContainer
      ? []
      : null;

  const handleAdd = (item: PaletteItem) => {
    if (targetPath === null) return;
    onAdd(targetPath, item.factory(generateId(item.type)));
  };

  return (
    <div className="p-3 flex flex-col gap-2">
      {targetPath !== null ? (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
          {selectedIsContainer
            ? `선택된 컴포넌트 안에 추가됩니다`
            : `최상위 컨테이너에 추가됩니다`}
        </div>
      ) : (
        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          컴포넌트를 추가하려면 스택·카드·리스트를 먼저 선택하세요.
        </div>
      )}

      {PALETTE_ITEMS.map((item) => (
        <button
          key={item.type}
          onClick={() => handleAdd(item)}
          disabled={targetPath === null}
          className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span className="text-lg w-6 text-center shrink-0">{item.icon}</span>
          <div>
            <div className="text-sm font-medium text-gray-900">{item.label}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.description}</div>
          </div>
        </button>
      ))}
    </div>
  );
}
