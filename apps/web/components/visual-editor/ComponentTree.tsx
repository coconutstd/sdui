import type { Component } from '@sdui/schema';
import { getChildren, type ComponentPath } from './editor-utils';

interface TreeAction {
  type: 'SELECT' | 'DELETE' | 'MOVE';
  path: ComponentPath;
  direction?: 'up' | 'down';
}

interface TreeNodeProps {
  component: Component;
  path: ComponentPath;
  selectedPath: ComponentPath | null;
  dispatch: (action: TreeAction) => void;
  depth: number;
  siblingCount: number;
  indexInParent: number;
}

const TYPE_ICONS: Record<string, string> = {
  text: 'T',
  image: '🖼',
  button: '⬜',
  stack: '☰',
  card: '▭',
  list: '≡',
};

const TYPE_LABELS: Record<string, string> = {
  text: '텍스트',
  image: '이미지',
  button: '버튼',
  stack: '스택',
  card: '카드',
  list: '리스트',
};

function getDisplayLabel(component: Component): string {
  if (component.type === 'text') {
    const content = component.props.content;
    return content.length > 18 ? content.slice(0, 18) + '…' : content;
  }
  if (component.type === 'button') return component.props.label;
  if (component.type === 'stack') {
    const dir = component.props.direction ?? 'column';
    return `스택 (${dir === 'column' ? '세로' : '가로'})`;
  }
  return TYPE_LABELS[component.type] ?? component.type;
}

function pathsEqual(a: ComponentPath | null, b: ComponentPath): boolean {
  if (!a) return false;
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

function TreeNode({
  component,
  path,
  selectedPath,
  dispatch,
  depth,
  siblingCount,
  indexInParent,
}: TreeNodeProps) {
  const isSelected = pathsEqual(selectedPath, path);
  const isRoot = path.length === 0;
  const children = getChildren(component);

  return (
    <div>
      <div
        className={`group flex items-center gap-1 py-1 pr-2 rounded-lg cursor-pointer transition-colors ${
          isSelected
            ? 'bg-blue-100 text-blue-800'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${8 + depth * 14}px` }}
        onClick={() => dispatch({ type: 'SELECT', path })}
      >
        <span className="text-base w-5 text-center shrink-0 select-none">
          {TYPE_ICONS[component.type]}
        </span>
        <span className="flex-1 text-xs truncate min-w-0">{getDisplayLabel(component)}</span>

        {!isRoot && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 shrink-0">
            {indexInParent > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'MOVE', path, direction: 'up' });
                }}
                title="위로"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 text-xs"
              >
                ↑
              </button>
            )}
            {indexInParent < siblingCount - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: 'MOVE', path, direction: 'down' });
                }}
                title="아래로"
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 text-gray-400 text-xs"
              >
                ↓
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                dispatch({ type: 'DELETE', path });
              }}
              title="삭제"
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-100 text-red-400 text-xs"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {children && children.length > 0 && (
        <div>
          {children.map((child, i) => (
            <TreeNode
              key={child.id}
              component={child}
              path={[...path, i]}
              selectedPath={selectedPath}
              dispatch={dispatch}
              depth={depth + 1}
              siblingCount={children.length}
              indexInParent={i}
            />
          ))}
        </div>
      )}

      {children && children.length === 0 && (
        <div
          className="text-xs text-gray-300 italic py-1"
          style={{ paddingLeft: `${8 + (depth + 1) * 14}px` }}
        >
          비어 있음
        </div>
      )}
    </div>
  );
}

interface ComponentTreeProps {
  root: Component;
  selectedPath: ComponentPath | null;
  dispatch: (action: TreeAction) => void;
}

export function ComponentTree({ root, selectedPath, dispatch }: ComponentTreeProps) {
  return (
    <div className="p-2 select-none">
      <TreeNode
        component={root}
        path={[]}
        selectedPath={selectedPath}
        dispatch={dispatch}
        depth={0}
        siblingCount={1}
        indexInParent={0}
      />
    </div>
  );
}
