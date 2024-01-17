import { describe, expect, it } from 'vitest';
import { add } from '../index';

describe('core add', () => {
  it('should test add', () => {
    expect(add(1, 2)).toBe(3);
  });
});
