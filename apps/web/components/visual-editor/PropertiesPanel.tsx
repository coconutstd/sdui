import type { ButtonComponent, Component, ImageComponent, StackComponent, TextComponent } from '@sdui/schema';
import type { ComponentPath } from './editor-utils';
import { TextForm } from './forms/TextForm';
import { ImageForm } from './forms/ImageForm';
import { ButtonForm } from './forms/ButtonForm';
import { StackForm } from './forms/StackForm';

interface Props {
  component: Component | null;
  path: ComponentPath | null;
  onUpdate: (updater: (c: Component) => Component) => void;
}

const TYPE_LABELS: Record<string, string> = {
  text: '텍스트',
  image: '이미지',
  button: '버튼',
  stack: '스택',
  card: '카드',
  list: '리스트',
};

export function PropertiesPanel({ component, path, onUpdate }: Props) {
  if (!component || path === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8 px-4">
        <div className="text-3xl mb-3">☝️</div>
        <p className="text-sm text-gray-400 leading-relaxed">
          왼쪽 구조 탭에서<br />컴포넌트를 클릭하면<br />여기서 편집할 수 있어요.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
          {TYPE_LABELS[component.type] ?? component.type}
        </span>
        <span className="text-xs text-gray-500 font-mono truncate">{component.id}</span>
      </div>

      {component.type === 'text' && (
        <TextForm component={component as TextComponent} onUpdate={onUpdate} />
      )}
      {component.type === 'image' && (
        <ImageForm component={component as ImageComponent} onUpdate={onUpdate} />
      )}
      {component.type === 'button' && (
        <ButtonForm component={component as ButtonComponent} onUpdate={onUpdate} />
      )}
      {component.type === 'stack' && (
        <StackForm component={component as StackComponent} onUpdate={onUpdate} />
      )}
      {(component.type === 'card' || component.type === 'list') && (
        <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3 leading-relaxed">
          이 컴포넌트는 다른 컴포넌트를 담는 컨테이너입니다.
          <br />
          자식 컴포넌트는 왼쪽 구조 탭에서 추가·삭제하세요.
        </div>
      )}
    </div>
  );
}
