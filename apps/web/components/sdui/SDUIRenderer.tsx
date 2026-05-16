import type { Component } from '@sdui/schema';

export function SDUIRenderer({ component }: { component: Component }) {
  switch (component.type) {
    case 'text': {
      const { content, style } = component.props;
      if (style === 'heading')
        return <h2 className="text-2xl font-bold text-gray-900">{content}</h2>;
      if (style === 'caption')
        return <span className="text-sm text-gray-500">{content}</span>;
      return <p className="text-base text-gray-700">{content}</p>;
    }

    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={component.props.src}
          alt={component.props.alt}
          width={component.props.width}
          height={component.props.height}
          className="rounded-lg object-cover w-full"
        />
      );

    case 'button': {
      const variantClass =
        component.props.variant === 'secondary'
          ? 'bg-gray-100 text-gray-900 hover:bg-gray-200'
          : component.props.variant === 'ghost'
            ? 'text-blue-600 hover:bg-blue-50'
            : 'bg-blue-600 text-white hover:bg-blue-700';
      return (
        <button
          className={`px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer ${variantClass}`}
        >
          {component.props.label}
        </button>
      );
    }

    case 'stack': {
      const { direction = 'column', gap = 8, children } = component.props;
      return (
        <div
          className={`flex ${direction === 'row' ? 'flex-row' : 'flex-col'}`}
          style={{ gap }}
        >
          {children.map((child) => (
            <SDUIRenderer key={child.id} component={child} />
          ))}
        </div>
      );
    }

    case 'card':
      return (
        <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-3 bg-white shadow-sm">
          {component.props.children.map((child) => (
            <SDUIRenderer key={child.id} component={child} />
          ))}
        </div>
      );

    case 'list':
      return (
        <ul className="flex flex-col gap-2">
          {component.props.items.map((item) => (
            <li key={item.id}>
              <SDUIRenderer component={item} />
            </li>
          ))}
        </ul>
      );
  }
}
