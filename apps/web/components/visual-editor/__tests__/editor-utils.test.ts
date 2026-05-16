import { describe, it, expect } from 'vitest';
import type { Component } from '@sdui/schema';
import {
  getChildren,
  getAtPath,
  updateAtPath,
  deleteAtPath,
  moveAtPath,
  addChildAtPath,
  isContainer,
  generateId,
} from '../editor-utils';

// 픽스처 헬퍼
function makeText(id = 'text-1'): Component {
  return { id, type: 'text', props: { content: 'hello', style: 'body' } };
}

function makeButton(id = 'btn-1'): Component {
  return {
    id,
    type: 'button',
    props: { label: '클릭', variant: 'primary', action: { type: 'navigate', url: '/' } },
  };
}

function makeStack(id = 'stack-1', children: Component[] = []): Component {
  return { id, type: 'stack', props: { direction: 'column', gap: 8, children } };
}

function makeCard(id = 'card-1', children: Component[] = []): Component {
  return { id, type: 'card', props: { children } };
}

function makeList(id = 'list-1', items: Component[] = []): Component {
  return { id, type: 'list', props: { items } };
}

describe('getChildren()', () => {
  it('stack → props.children 반환', () => {
    const text = makeText();
    const stack = makeStack('s', [text]);
    expect(getChildren(stack)).toEqual([text]);
  });

  it('card → props.children 반환', () => {
    const text = makeText();
    const card = makeCard('c', [text]);
    expect(getChildren(card)).toEqual([text]);
  });

  it('list → props.items 반환', () => {
    const text = makeText();
    const list = makeList('l', [text]);
    expect(getChildren(list)).toEqual([text]);
  });

  it('text/image/button → null 반환', () => {
    expect(getChildren(makeText())).toBeNull();
    expect(getChildren(makeButton())).toBeNull();
  });
});

describe('getAtPath()', () => {
  it('빈 경로 → root 반환', () => {
    const root = makeStack('r');
    expect(getAtPath(root, [])).toBe(root);
  });

  it('[0] → 첫 번째 자식 반환', () => {
    const child = makeText('t');
    const root = makeStack('r', [child]);
    expect(getAtPath(root, [0])).toBe(child);
  });

  it('[0, 0] → 중첩 자식 반환', () => {
    const deep = makeText('deep');
    const inner = makeStack('inner', [deep]);
    const root = makeStack('r', [inner]);
    expect(getAtPath(root, [0, 0])).toBe(deep);
  });

  it('범위 초과 인덱스 → null 반환', () => {
    const root = makeStack('r', [makeText()]);
    expect(getAtPath(root, [5])).toBeNull();
  });

  it('리프 노드에 진입 시도 → null 반환', () => {
    const root = makeStack('r', [makeText()]);
    expect(getAtPath(root, [0, 0])).toBeNull();
  });
});

describe('updateAtPath()', () => {
  it('빈 경로 → updater가 root에 적용됨', () => {
    const root = makeText('t');
    const result = updateAtPath(root, [], (c) => ({ ...c, id: 'new-id' }));
    expect(result.id).toBe('new-id');
  });

  it('유효 경로 → 해당 노드만 변경', () => {
    const child = makeText('child');
    const root = makeStack('r', [child]);
    const result = updateAtPath(root, [0], (c) => ({ ...c, id: 'updated' }));
    expect(getAtPath(result, [0])!.id).toBe('updated');
  });

  it('원본 불변성 유지', () => {
    const child = makeText('child');
    const root = makeStack('r', [child]);
    updateAtPath(root, [0], (c) => ({ ...c, id: 'x' }));
    expect(child.id).toBe('child');
  });
});

describe('deleteAtPath()', () => {
  it('해당 자식 삭제 후 배열 길이 감소', () => {
    const root = makeStack('r', [makeText('a'), makeText('b')]);
    const result = deleteAtPath(root, [0]);
    expect(getChildren(result)!).toHaveLength(1);
    expect(getChildren(result)![0].id).toBe('b');
  });

  it('원본 불변성 유지', () => {
    const children = [makeText('a'), makeText('b')];
    const root = makeStack('r', children);
    deleteAtPath(root, [0]);
    expect(getChildren(root)!).toHaveLength(2);
  });

  it('빈 경로 → root 그대로 반환', () => {
    const root = makeStack('r', [makeText()]);
    expect(deleteAtPath(root, [])).toBe(root);
  });

  it('중첩 경로 삭제', () => {
    const inner = makeStack('inner', [makeText('t1'), makeText('t2')]);
    const root = makeStack('r', [inner]);
    const result = deleteAtPath(root, [0, 0]);
    expect(getChildren(getAtPath(result, [0])!)!).toHaveLength(1);
  });
});

describe('moveAtPath()', () => {
  it("'up' → 인덱스 감소", () => {
    const a = makeText('a');
    const b = makeText('b');
    const root = makeStack('r', [a, b]);
    const result = moveAtPath(root, [1], 'up');
    expect(getChildren(result)![0].id).toBe('b');
    expect(getChildren(result)![1].id).toBe('a');
  });

  it("'down' → 인덱스 증가", () => {
    const a = makeText('a');
    const b = makeText('b');
    const root = makeStack('r', [a, b]);
    const result = moveAtPath(root, [0], 'down');
    expect(getChildren(result)![0].id).toBe('b');
    expect(getChildren(result)![1].id).toBe('a');
  });

  it('첫 번째 요소 up → 변화 없음', () => {
    const root = makeStack('r', [makeText('a'), makeText('b')]);
    const result = moveAtPath(root, [0], 'up');
    expect(getChildren(result)![0].id).toBe('a');
  });

  it('마지막 요소 down → 변화 없음', () => {
    const root = makeStack('r', [makeText('a'), makeText('b')]);
    const result = moveAtPath(root, [1], 'down');
    expect(getChildren(result)![1].id).toBe('b');
  });
});

describe('addChildAtPath()', () => {
  it('빈 경로 → root children 끝에 추가', () => {
    const root = makeStack('r', [makeText('a')]);
    const newChild = makeText('new');
    const result = addChildAtPath(root, [], newChild);
    const children = getChildren(result)!;
    expect(children).toHaveLength(2);
    expect(children[1].id).toBe('new');
  });

  it('중첩 경로 → 해당 컨테이너 children 끝에 추가', () => {
    const inner = makeStack('inner', [makeText('t')]);
    const root = makeStack('r', [inner]);
    const newChild = makeText('new');
    const result = addChildAtPath(root, [0], newChild);
    expect(getChildren(getAtPath(result, [0])!)!).toHaveLength(2);
  });

  it('리프 노드에 추가 시도 → 변화 없음', () => {
    const leaf = makeText('leaf');
    const root = makeStack('r', [leaf]);
    const before = getChildren(root)!.length;
    addChildAtPath(root, [0], makeText('new'));
    expect(getChildren(root)!).toHaveLength(before);
  });
});

describe('isContainer()', () => {
  it('stack/card/list → true', () => {
    expect(isContainer(makeStack())).toBe(true);
    expect(isContainer(makeCard())).toBe(true);
    expect(isContainer(makeList())).toBe(true);
  });

  it('text/button → false', () => {
    expect(isContainer(makeText())).toBe(false);
    expect(isContainer(makeButton())).toBe(false);
  });
});

describe('generateId()', () => {
  it('type 문자열로 시작하는 ID를 생성한다', () => {
    expect(generateId('button')).toMatch(/^button-/);
    expect(generateId('text')).toMatch(/^text-/);
  });

  it('호출마다 다른 ID를 반환한다', () => {
    const ids = new Set(Array.from({ length: 10 }, () => generateId('x')));
    expect(ids.size).toBeGreaterThan(1);
  });
});
