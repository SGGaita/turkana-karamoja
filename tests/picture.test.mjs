import { describe, it, expect } from 'vitest';
import { canOptimize } from '../lib/image-hosts.js';

describe('Picture: which pictures go through the image optimiser', () => {
  const hosts = ['images.unsplash.com', 'cms.example.org'];
  it('same-site and allowed hosts', () => {
    expect(canOptimize('/images/x.png', hosts)).toBe(true);
    expect(canOptimize('https://cms.example.org/wp-content/uploads/a.png', hosts)).toBe(true);
    expect(canOptimize('https://images.unsplash.com/photo-1?w=1600', hosts)).toBe(true);
  });
  it('other hosts load as they are', () => {
    expect(canOptimize('https://elsewhere.example/a.png', hosts)).toBe(false);
    expect(canOptimize('//cms.example.org/a.png', hosts)).toBe(false);
    expect(canOptimize('', hosts)).toBe(false);
    expect(canOptimize('not a url', hosts)).toBe(false);
  });
});
