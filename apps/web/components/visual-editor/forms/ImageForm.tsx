import type { Component, ImageComponent } from '@sdui/schema';

interface Props {
  component: ImageComponent;
  onUpdate: (updater: (c: Component) => Component) => void;
}

export function ImageForm({ component, onUpdate }: Props) {
  const update = (patch: Partial<ImageComponent['props']>) =>
    onUpdate((c) => ({
      ...c,
      props: { ...(c as ImageComponent).props, ...patch },
    }) as Component);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">이미지 URL</label>
        <input
          type="text"
          value={component.props.src}
          onChange={(e) => update({ src: e.target.value })}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="https://example.com/image.png"
        />
        {component.props.src && (
          <img
            src={component.props.src}
            alt={component.props.alt}
            className="w-full h-24 object-cover rounded-lg border border-gray-100 mt-1"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-500">대체 텍스트 (alt)</label>
        <input
          type="text"
          value={component.props.alt}
          onChange={(e) => update({ alt: e.target.value })}
          className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="이미지 설명"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">너비 (px)</label>
          <input
            type="number"
            value={component.props.width ?? ''}
            onChange={(e) =>
              update({ width: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="자동"
            min={0}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-500">높이 (px)</label>
          <input
            type="number"
            value={component.props.height ?? ''}
            onChange={(e) =>
              update({ height: e.target.value ? Number(e.target.value) : undefined })
            }
            className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="자동"
            min={0}
          />
        </div>
      </div>
    </div>
  );
}
