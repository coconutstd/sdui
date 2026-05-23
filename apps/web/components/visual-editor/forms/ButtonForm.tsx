import type { Action, ButtonComponent, Component } from '@sdui/schema';

interface Props {
  component: ButtonComponent;
  onUpdate: (updater: (c: Component) => Component) => void;
}

const DEFAULT_ACTIONS: Record<string, Action> = {
  navigate: { type: 'navigate', url: '/' },
  deeplink: { type: 'deeplink', path: '/' },
  api_call: { type: 'api_call', endpoint: '/api/', method: 'GET' },
};

export function ButtonForm({ component, onUpdate }: Props) {
  const { label, variant, action } = component.props;

  const updateProps = (patch: Partial<ButtonComponent['props']>) =>
    onUpdate((c) => ({
      ...c,
      props: { ...(c as ButtonComponent).props, ...patch },
    }) as Component);

  const variants = [
    { value: 'primary', label: '기본' },
    { value: 'secondary', label: '보조' },
    { value: 'ghost', label: '텍스트' },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">버튼 텍스트</label>
        <input
          type="text"
          value={label}
          onChange={(e) => updateProps({ label: e.target.value })}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="버튼 텍스트"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">스타일</label>
        <div className="flex gap-2">
          {variants.map((v) => (
            <button
              key={v.value}
              onClick={() => updateProps({ variant: v.value })}
              className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                (variant ?? 'primary') === v.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">액션 타입</label>
        <select
          value={action.type}
          onChange={(e) => {
            const newType = e.target.value as Action['type'];
            updateProps({ action: DEFAULT_ACTIONS[newType] });
          }}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="navigate">페이지 이동 (navigate)</option>
          <option value="deeplink">딥링크 (deeplink)</option>
          <option value="api_call">API 호출 (api_call)</option>
        </select>
      </div>

      {action.type === 'navigate' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">URL</label>
          <input
            type="text"
            value={action.url}
            onChange={(e) =>
              updateProps({ action: { type: 'navigate', url: e.target.value } })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="/path/to/page"
          />
        </div>
      )}

      {action.type === 'deeplink' && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">딥링크 경로</label>
          <input
            type="text"
            value={action.path}
            onChange={(e) =>
              updateProps({ action: { type: 'deeplink', path: e.target.value } })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="/screen/name"
          />
        </div>
      )}

      {action.type === 'api_call' && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">API 엔드포인트</label>
            <input
              type="text"
              value={action.endpoint}
              onChange={(e) =>
                updateProps({
                  action: { type: 'api_call', endpoint: e.target.value, method: action.method },
                })
              }
              className="w-full border border-gray-200 rounded-lg p-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="/api/endpoint"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-500">HTTP 메서드</label>
            <div className="flex gap-2">
              {(['GET', 'POST'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() =>
                    updateProps({
                      action: { type: 'api_call', endpoint: action.endpoint, method: m },
                    })
                  }
                  className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
                    action.method === m
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
