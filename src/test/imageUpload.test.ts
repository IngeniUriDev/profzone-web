import { describe, it, expect } from 'vitest';
import { normalizeImageUrl, DEFAULT_BUSINESS_IMAGE } from '../utils/imageUpload';

describe('Image Upload & URL Normalization Utilities', () => {
  it('correctly normalizes Google Drive shareable URLs into direct image URLs', () => {
    const gdriveShareUrl = 'https://drive.google.com/file/d/1a2B3c4D5e6F7g8H9/view?usp=sharing';
    const normalized = normalizeImageUrl(gdriveShareUrl);
    expect(normalized).toBe('https://drive.google.com/uc?export=view&id=1a2B3c4D5e6F7g8H9');
  });

  it('correctly normalizes Dropbox links to raw image downloads', () => {
    const dropboxUrl = 'https://www.dropbox.com/s/xyz123/my-shop.jpg?dl=0';
    const normalized = normalizeImageUrl(dropboxUrl);
    expect(normalized).toContain('raw=1');
    expect(normalized).not.toContain('dl=0');
  });

  it('preserves valid standard image URLs unchanged', () => {
    const standardUrl = 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80';
    expect(normalizeImageUrl(standardUrl)).toBe(standardUrl);
  });

  it('handles empty or whitespace inputs gracefully', () => {
    expect(normalizeImageUrl('')).toBe('');
    expect(normalizeImageUrl('   ')).toBe('');
  });

  it('exports a valid default business image fallback', () => {
    expect(DEFAULT_BUSINESS_IMAGE).toMatch(/^https:\/\//);
  });
});
