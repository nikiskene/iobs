// src/components/institute/knobImage.ts
const OBJECT_PATH = '/storage/v1/object/public/';
const RENDER_PATH = '/storage/v1/render/image/public/';

export function knobImageUrl(url: string, width: number) {
  const transformed = url.replace(OBJECT_PATH, RENDER_PATH);
  const separator = transformed.includes('?') ? '&' : '?';
  return `${transformed}${separator}width=${width}&quality=75&resize=contain`;
}

export function knobImageSet(url: string) {
  return [420, 800, 1200]
    .map((width) => `${knobImageUrl(url, width)} ${width}w`)
    .join(', ');
}

export const KNOB_SIZES = '(max-width:560px) 312px, (max-width:980px) 650px, 871px';
