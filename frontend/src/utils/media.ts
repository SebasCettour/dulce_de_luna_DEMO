import { PLACEHOLDER } from "../demo/store";

export function buildFotoSrc(_foto?: string | null): string {
  return PLACEHOLDER;
}

export function buildFotoVariant(
  foto: string | null | undefined,
  variant: "avif" | "webp" | "thumb",
): string {
  void variant;
  return buildFotoSrc(foto);
}

export function hasGeneratedVariants(foto?: string | null): boolean {
  void foto;
  return false;
}