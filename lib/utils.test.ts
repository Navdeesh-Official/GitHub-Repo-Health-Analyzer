import { describe, expect, test } from 'vitest';
import { cn } from './utils';

describe('cn utility', () => {
  test('merges class names correctly', () => {
    expect(cn('c1', 'c2')).toBe('c1 c2');
  });

  test('handles conditional classes', () => {
    expect(cn('c1', false && 'c2', 'c3')).toBe('c1 c3');
    expect(cn('c1', true && 'c2', 'c3')).toBe('c1 c2 c3');
    expect(cn('c1', null, 'c3')).toBe('c1 c3');
    expect(cn('c1', undefined, 'c3')).toBe('c1 c3');
  });

  test('merges tailwind classes', () => {
    // Conflict resolution: p-2 should win over p-4 because it's last
    expect(cn('p-4', 'p-2')).toBe('p-2');
    // Different properties should be kept
    expect(cn('p-4', 'text-center')).toBe('p-4 text-center');
    // Color conflict
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
  });

  test('handles arrays', () => {
    expect(cn(['c1', 'c2'])).toBe('c1 c2');
    expect(cn('c1', ['c2', 'c3'])).toBe('c1 c2 c3');
  });

  test('handles objects', () => {
    expect(cn({ c1: true, c2: false })).toBe('c1');
    expect(cn('base', { active: true, disabled: false })).toBe('base active');
  });

  test('handles complex combinations', () => {
    const result = cn(
      'base-class',
      [
        'in-array',
        {
          'conditional-in-array': true,
          'falsy-in-array': false,
        },
      ],
      'p-4',
      'p-2', // Overrides p-4
      null,
      undefined,
      false
    );
    expect(result).toBe('base-class in-array conditional-in-array p-2');
  });

  test('handles empty input', () => {
    expect(cn()).toBe('');
  });
});
