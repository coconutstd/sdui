import type { Component, StackComponent } from '@sdui/schema';

interface Props {
  component: StackComponent;
  onUpdate: (updater: (c: Component) => Component) => void;
}

export function StackForm({ component, onUpdate }: Props) {
  const { direction = 'column', gap = 8 } = component.props;

  const update = (patch: Partial<StackComponent['props']>) =>
    onUpdate((c) => ({
      ...c,
      props: { ...(c as StackComponent).props, ...patch },
    }) as Component);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">방향</label>
        <div className="flex gap-2">
          <button
            onClick={() => update({ direction: 'column' })}
            className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
              direction === 'column'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            세로 ↕
          </button>
          <button
            onClick={() => update({ direction: 'row' })}
            className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
              direction === 'row'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
            }`}
          >
            가로 ↔
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">간격 ({gap}px)</label>
        <input
          type="range"
          min={0}
          max={48}
          step={4}
          value={gap}
          onChange={(e) => update({ gap: Number(e.target.value) })}
          className="w-full accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>0</span>
          <span>24</span>
          <span>48</span>
        </div>
      </div>

      <div className="text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
        자식 컴포넌트는 왼쪽 구조 탭에서 추가·삭제하세요.
      </div>
    </div>
  );
}
