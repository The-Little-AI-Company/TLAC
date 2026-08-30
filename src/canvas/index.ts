export type { CanvasSize, CanvasEffect, CanvasHandle, MountOptions } from './types';
export { mount } from './mount';
export {
  createOrderedDitherEffect,
  generateBayerMatrix,
  normalizeBayerMatrix,
  type OrderedDitherOptions,
} from './effects/orderedDither';
