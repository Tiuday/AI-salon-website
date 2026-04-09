import { FaceShape, Hairstyle } from '@/types'

export const HAIRSTYLES: Hairstyle[] = [
  {
    id: '1',
    name: 'Soft Layered Lob',
    slug: 'soft-layered-lob',
    description: 'A versatile collarbone-length cut with soft face-framing layers that add movement and lightness.',
    image_urls: ['/images/hairstyles/lob-1.jpg'],
    thumbnail: '/images/hairstyles/lob-thumb.jpg',
    face_shapes: ['round', 'oval', 'square'],
    category: 'cut',
    tags: ['medium-length', 'layers', 'versatile'],
    is_featured: true,
    sort_order: 1
  },
  {
    id: '2',
    name: 'Pixie with Side-Swept Fringe',
    slug: 'pixie-fringe',
    description: 'A bold, low-maintenance short cut that highlights facial features with a textured, elongated fringe.',
    image_urls: ['/images/hairstyles/pixie-1.jpg'],
    thumbnail: '/images/hairstyles/pixie-thumb.jpg',
    face_shapes: ['oval', 'heart'],
    category: 'cut',
    tags: ['short', 'textured', 'bold'],
    is_featured: false,
    sort_order: 2
  },
  {
    id: '3',
    name: 'Curtain Bangs with Long Waves',
    slug: 'curtain-bangs-waves',
    description: 'Effortless 70s-inspired bangs paired with long, beachy waves for a romantic and soft look.',
    image_urls: ['/images/hairstyles/waves-1.jpg'],
    thumbnail: '/images/hairstyles/waves-thumb.jpg',
    face_shapes: ['square', 'oblong', 'oval'],
    category: 'styling',
    tags: ['long', 'bangs', 'waves'],
    is_featured: true,
    sort_order: 3
  },
  {
    id: '4',
    name: 'Angled Bob',
    slug: 'angled-bob',
    description: 'A sharp, architectural bob that is shorter in the back and tapers forward to frame the jawline.',
    image_urls: ['/images/hairstyles/bob-1.jpg'],
    thumbnail: '/images/hairstyles/bob-thumb.jpg',
    face_shapes: ['round', 'heart'],
    category: 'cut',
    tags: ['short', 'sharp', 'modern'],
    is_featured: false,
    sort_order: 4
  },
  {
    id: '5',
    name: 'Voluminous Bardot Layers',
    slug: 'bardot-layers',
    description: 'Chic, voluminous layers with a center-parted fringe that creates width and balance.',
    image_urls: ['/images/hairstyles/bardot-1.jpg'],
    thumbnail: '/images/hairstyles/bardot-thumb.jpg',
    face_shapes: ['oblong', 'oval'],
    category: 'cut',
    tags: ['long', 'volume', 'layers'],
    is_featured: true,
    sort_order: 5
  }
]

export function getRecommendationsByFaceShape(shape: FaceShape): Hairstyle[] {
  return HAIRSTYLES.filter(h => h.face_shapes.includes(shape))
}
