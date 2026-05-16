import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SDUIRenderer } from '../SDUIRenderer';
import type { Component } from '@sdui/schema';

describe('SDUIRenderer — text', () => {
  it('heading → h2 렌더링', () => {
    const c: Component = { id: 't1', type: 'text', props: { content: '제목', style: 'heading' } };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('h2')).not.toBeNull();
    expect(screen.getByText('제목')).toBeInTheDocument();
  });

  it('heading → text-2xl font-bold 클래스', () => {
    const c: Component = { id: 't1', type: 'text', props: { content: '제목', style: 'heading' } };
    const { container } = render(<SDUIRenderer component={c} />);
    const el = container.querySelector('h2')!;
    expect(el.className).toContain('text-2xl');
    expect(el.className).toContain('font-bold');
  });

  it('body → p 렌더링', () => {
    const c: Component = { id: 't2', type: 'text', props: { content: '본문', style: 'body' } };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('style 미지정 → p 렌더링', () => {
    const c: Component = { id: 't3', type: 'text', props: { content: '기본' } };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('p')).not.toBeNull();
  });

  it('caption → span 렌더링 + text-sm text-gray-500 클래스', () => {
    const c: Component = { id: 't4', type: 'text', props: { content: '캡션', style: 'caption' } };
    const { container } = render(<SDUIRenderer component={c} />);
    const el = container.querySelector('span')!;
    expect(el).not.toBeNull();
    expect(el.className).toContain('text-sm');
    expect(el.className).toContain('text-gray-500');
  });
});

describe('SDUIRenderer — image', () => {
  it('img 요소를 렌더링하고 속성을 올바르게 전달한다', () => {
    const c: Component = {
      id: 'img1',
      type: 'image',
      props: { src: '/test.png', alt: '테스트 이미지', width: 400, height: 300 },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    const img = container.querySelector('img')!;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/test.png');
    expect(img.getAttribute('alt')).toBe('테스트 이미지');
    expect(img.getAttribute('width')).toBe('400');
    expect(img.getAttribute('height')).toBe('300');
  });

  it('rounded-lg object-cover w-full 클래스를 가진다', () => {
    const c: Component = {
      id: 'img2',
      type: 'image',
      props: { src: '/x.png', alt: 'x' },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    const img = container.querySelector('img')!;
    expect(img.className).toContain('rounded-lg');
    expect(img.className).toContain('object-cover');
    expect(img.className).toContain('w-full');
  });
});

describe('SDUIRenderer — button', () => {
  const action = { type: 'navigate' as const, url: '/' };

  it('primary → bg-blue-600 text-white 클래스', () => {
    const c: Component = {
      id: 'b1',
      type: 'button',
      props: { label: '클릭', variant: 'primary', action },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-blue-600');
    expect(btn.className).toContain('text-white');
  });

  it('secondary → bg-gray-100 text-gray-900 클래스', () => {
    const c: Component = {
      id: 'b2',
      type: 'button',
      props: { label: '두 번째', variant: 'secondary', action },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('button')!.className).toContain('bg-gray-100');
  });

  it('ghost → text-blue-600 클래스', () => {
    const c: Component = {
      id: 'b3',
      type: 'button',
      props: { label: '고스트', variant: 'ghost', action },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('button')!.className).toContain('text-blue-600');
  });

  it('variant 미지정 → primary 기본값 적용', () => {
    const c: Component = {
      id: 'b4',
      type: 'button',
      props: { label: '기본', action },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('button')!.className).toContain('bg-blue-600');
  });

  it('label이 버튼 내부에 렌더링된다', () => {
    const c: Component = {
      id: 'b5',
      type: 'button',
      props: { label: '구매하기', variant: 'primary', action },
    };
    render(<SDUIRenderer component={c} />);
    expect(screen.getByText('구매하기')).toBeInTheDocument();
  });
});

describe('SDUIRenderer — stack', () => {
  it('direction row → flex-row 클래스', () => {
    const c: Component = {
      id: 's1',
      type: 'stack',
      props: { direction: 'row', gap: 8, children: [] },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.firstElementChild!.className).toContain('flex-row');
  });

  it('direction column → flex-col 클래스', () => {
    const c: Component = {
      id: 's2',
      type: 'stack',
      props: { direction: 'column', gap: 8, children: [] },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.firstElementChild!.className).toContain('flex-col');
  });

  it('children이 재귀적으로 렌더링된다', () => {
    const c: Component = {
      id: 's3',
      type: 'stack',
      props: {
        direction: 'column',
        gap: 8,
        children: [
          { id: 'c1', type: 'text', props: { content: '자식1' } },
          { id: 'c2', type: 'text', props: { content: '자식2' } },
        ],
      },
    };
    render(<SDUIRenderer component={c} />);
    expect(screen.getByText('자식1')).toBeInTheDocument();
    expect(screen.getByText('자식2')).toBeInTheDocument();
  });
});

describe('SDUIRenderer — card', () => {
  it('rounded-xl border border-gray-200 클래스를 가진다', () => {
    const c: Component = { id: 'card1', type: 'card', props: { children: [] } };
    const { container } = render(<SDUIRenderer component={c} />);
    const el = container.firstElementChild!;
    expect(el.className).toContain('rounded-xl');
    expect(el.className).toContain('border');
  });

  it('children이 렌더링된다', () => {
    const c: Component = {
      id: 'card2',
      type: 'card',
      props: {
        children: [{ id: 'inner', type: 'text', props: { content: '카드 내용' } }],
      },
    };
    render(<SDUIRenderer component={c} />);
    expect(screen.getByText('카드 내용')).toBeInTheDocument();
  });
});

describe('SDUIRenderer — list', () => {
  it('ul 요소를 렌더링한다', () => {
    const c: Component = { id: 'list1', type: 'list', props: { items: [] } };
    const { container } = render(<SDUIRenderer component={c} />);
    expect(container.querySelector('ul')).not.toBeNull();
  });

  it('items가 li 안에 렌더링된다', () => {
    const c: Component = {
      id: 'list2',
      type: 'list',
      props: {
        items: [
          { id: 'i1', type: 'text', props: { content: '항목1' } },
          { id: 'i2', type: 'text', props: { content: '항목2' } },
        ],
      },
    };
    const { container } = render(<SDUIRenderer component={c} />);
    const items = container.querySelectorAll('li');
    expect(items).toHaveLength(2);
    expect(screen.getByText('항목1')).toBeInTheDocument();
    expect(screen.getByText('항목2')).toBeInTheDocument();
  });
});
