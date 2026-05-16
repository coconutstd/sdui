import type { Component, TextComponent } from '@sdui/schema';

interface Props {
  component: TextComponent;
  onUpdate: (updater: (c: Component) => Component) => void;
}

export function TextForm({ component, onUpdate }: Props) {
  const styles = [
    { value: 'heading', label: '제목' },
    { value: 'body', label: '본문' },
    { value: 'caption', label: '캡션' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">내용</label>
        <textarea
          value={component.props.content}
          onChange={(e) =>
            onUpdate((c) => ({
              ...c,
              props: { ...(c as TextComponent).props, content: e.target.value },
            }) as Component)
          }
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="텍스트를 입력하세요"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">스타일</label>
        <div className="flex gap-2">
          {styles.map((s) => (
            <button
              key={s.value}
              onClick={() =>
                onUpdate((c) => ({
                  ...c,
                  props: { ...(c as TextComponent).props, style: s.value },
                }) as Component)
              }
              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                component.props.style === s.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
