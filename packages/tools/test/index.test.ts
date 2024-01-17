import { describe, expect, it } from 'vitest';
import { getNameInfo } from '../index';

describe('tools getNameInfo', () => {
  it('should test getNameInfo', () => {
    expect(getNameInfo('dnhyxc')).toBe('my name is dnhyxc');
  });
});
