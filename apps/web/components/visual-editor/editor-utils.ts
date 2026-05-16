import type { Component, SDUIScreen } from '@sdui/schema';

export type ComponentPath = number[];

export function getChildren(component: Component): Component[] | null {
  if (component.type === 'stack') return component.props.children;
  if (component.type === 'card') return component.props.children;
  if (component.type === 'list') return component.props.items;
  return null;
}

function withChildren(component: Component, newChildren: Component[]): Component {
  if (component.type === 'stack')
    return { ...component, props: { ...component.props, children: newChildren } };
  if (component.type === 'card')
    return { ...component, props: { ...component.props, children: newChildren } };
  if (component.type === 'list')
    return { ...component, props: { ...component.props, items: newChildren } };
  return component;
}

export function getAtPath(root: Component, path: ComponentPath): Component | null {
  if (path.length === 0) return root;
  const children = getChildren(root);
  if (!children) return null;
  const [index, ...rest] = path;
  if (index >= children.length) return null;
  return getAtPath(children[index], rest);
}

export function updateAtPath(
  root: Component,
  path: ComponentPath,
  updater: (current: Component) => Component,
): Component {
  if (path.length === 0) return updater(root);
  const children = getChildren(root);
  if (!children) return root;
  const [index, ...rest] = path;
  const newChildren = children.map((child, i) =>
    i === index ? updateAtPath(child, rest, updater) : child,
  );
  return withChildren(root, newChildren);
}

export function deleteAtPath(root: Component, path: ComponentPath): Component {
  if (path.length === 0) return root;
  if (path.length === 1) {
    const children = getChildren(root);
    if (!children) return root;
    return withChildren(root, children.filter((_, i) => i !== path[0]));
  }
  const [index, ...rest] = path;
  const children = getChildren(root);
  if (!children) return root;
  const newChildren = children.map((child, i) =>
    i === index ? deleteAtPath(child, rest) : child,
  );
  return withChildren(root, newChildren);
}

export function moveAtPath(
  root: Component,
  path: ComponentPath,
  direction: 'up' | 'down',
): Component {
  if (path.length === 0) return root;
  const parentPath = path.slice(0, -1);
  const index = path[path.length - 1];
  const parent = parentPath.length === 0 ? root : getAtPath(root, parentPath);
  if (!parent) return root;
  const children = getChildren(parent);
  if (!children) return root;
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= children.length) return root;
  const newChildren = [...children];
  [newChildren[index], newChildren[newIndex]] = [newChildren[newIndex], newChildren[index]];
  if (parentPath.length === 0) return withChildren(root, newChildren);
  return updateAtPath(root, parentPath, (p) => withChildren(p, newChildren));
}

export function addChildAtPath(
  root: Component,
  path: ComponentPath,
  newComponent: Component,
): Component {
  if (path.length === 0) {
    const children = getChildren(root);
    if (!children) return root;
    return withChildren(root, [...children, newComponent]);
  }
  return updateAtPath(root, path, (target) => {
    const children = getChildren(target);
    if (!children) return target;
    return withChildren(target, [...children, newComponent]);
  });
}

export function updateScreenRoot(screen: SDUIScreen, newRoot: Component): SDUIScreen {
  return { ...screen, root: newRoot };
}

export function generateId(type: string): string {
  return `${type}-${Math.random().toString(36).slice(2, 9)}`;
}

export function isContainer(component: Component): boolean {
  return ['stack', 'card', 'list'].includes(component.type);
}
