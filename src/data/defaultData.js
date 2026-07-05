export const imageBank = {
  hero: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=1600&q=80',
  perfume: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80',
  skincare: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80',
  wigs: 'https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=900&q=80',
  about: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&q=80',
  blog: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=900&q=80'
};

export const defaultSettings = {
  storeName: 'GlowOut gh',
  tagline: 'Perfumes · Skincare · Wigs',
  announcement: '',
  email: 'hello@glowoutghbeauty.com',
  phone: '+233 55 000 0000',
  whatsapp: '+233550000000',
  address: 'Accra, Ghana',
  currency: 'GH₵',
  taxRate: 7.5,
  deliveryFee: 35,
  expressDeliveryFee: 60,
  freeDeliveryThreshold: 800,
  instagram: 'https://instagram.com/glowoutghbeauty',
  tiktok: 'https://tiktok.com/@glowoutghbeauty',
  facebook: 'https://facebook.com/glowoutghbeauty',
  lowStockThreshold: 5
};

export const defaultCategories = [
  {
    id: 'cat_perfumes',
    slug: 'perfumes',
    name: 'Perfumes',
    subtitle: 'Signature scents, body mists and luxury fragrance picks.',
    image: imageBank.perfume,
    visible: true,
    featured: true,
    core: true,
    order: 1,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_skincare',
    slug: 'skincare',
    name: 'Skincare',
    subtitle: 'Clean routines for glow, hydration and daily confidence.',
    image: imageBank.skincare,
    visible: true,
    featured: true,
    core: true,
    order: 2,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_wigs',
    slug: 'wigs',
    name: 'Wigs',
    subtitle: 'Ready-to-wear hair units, care kits and beauty styling support.',
    image: imageBank.wigs,
    visible: true,
    featured: true,
    core: true,
    order: 3,
    createdAt: '2026-01-01'
  },
  {
    id: 'cat_bodycare',
    slug: 'bodycare',
    name: 'Bodycare',
    subtitle: 'Body oils, lotions, scrubs and soft-skin essentials.',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
    visible: true,
    featured: false,
    core: false,
    order: 4,
    createdAt: '2026-04-12'
  }
];

export const defaultProducts = [
  {
    id: 'p_luna_001', sku: 'GOGH-PER-001', name: 'Luna Oud Eau de Parfum', brand: 'GLOWOUT GH Select', category: 'perfumes',
    price: 420, wasPrice: 520, stock: 14, available: true, featured: true, badge: 'Best Seller', rating: 4.9, reviews: 126,
    images: ['https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=900&q=80'],
    description: 'A warm, lasting oud fragrance with amber, rose and soft vanilla notes for evening confidence.',
    createdAt: '2026-03-04'
  },
  {
    id: 'p_rose_002', sku: 'GOGH-PER-002', name: 'Rose Velvet Body Mist', brand: 'Maison Bloom', category: 'perfumes',
    price: 165, wasPrice: 0, stock: 28, available: true, featured: false, badge: 'New', rating: 4.7, reviews: 64,
    images: ['https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80'],
    description: 'A feminine everyday mist with rose petals, pear and creamy musk.', createdAt: '2026-05-10'
  },
  {
    id: 'p_glow_003', sku: 'GOGH-SKI-003', name: 'Radiance Vitamin C Serum', brand: 'Skin Ritual', category: 'skincare',
    price: 210, wasPrice: 260, stock: 7, available: true, featured: true, badge: 'Sale', rating: 4.8, reviews: 91,
    images: ['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=900&q=80'],
    description: 'A brightening serum made for dull skin, uneven tone and a healthy morning glow.', createdAt: '2026-02-16'
  },
  {
    id: 'p_hydra_004', sku: 'GOGH-SKI-004', name: 'Hydra Cloud Moisturiser', brand: 'Glow Lab', category: 'skincare',
    price: 180, wasPrice: 0, stock: 21, available: true, featured: false, badge: '', rating: 4.6, reviews: 53,
    images: ['https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80'],
    description: 'Lightweight daily hydration with a soft finish under sunscreen or makeup.', createdAt: '2026-04-11'
  },
  {
    id: 'p_bob_005', sku: 'GOGH-WIG-005', name: 'Silk Press Bob Wig', brand: 'Haus Hair', category: 'wigs',
    price: 760, wasPrice: 899, stock: 5, available: true, featured: true, badge: 'Limited', rating: 4.9, reviews: 44,
    images: ['https://images.unsplash.com/photo-1522336572468-97b06e8ef143?auto=format&fit=crop&w=900&q=80', 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80'],
    description: 'A sleek, ready-to-wear bob unit with natural movement and soft lace finish.', createdAt: '2026-01-20'
  },
  {
    id: 'p_curls_006', sku: 'GOGH-WIG-006', name: 'Luxury Deep Wave Unit', brand: 'Haus Hair', category: 'wigs',
    price: 980, wasPrice: 0, stock: 3, available: true, featured: false, badge: 'Low Stock', rating: 4.8, reviews: 36,
    images: ['https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=900&q=80'],
    description: 'Defined deep wave texture with volume, soft bounce and premium finish.', createdAt: '2026-05-01'
  },
  {
    id: 'p_body_007', sku: 'GOGH-BOD-007', name: 'Golden Body Oil', brand: 'Glow Ritual', category: 'bodycare',
    price: 145, wasPrice: 190, stock: 18, available: true, featured: true, badge: 'Glow Pick', rating: 4.7, reviews: 77,
    images: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80'],
    description: 'Silky body oil for a soft sheen, evening moisture and fragrance layering.', createdAt: '2026-04-17'
  }
];

export const demoOrders = [
  {
    id: 'GH-1001', createdAt: '2026-06-12T10:30:00.000Z', status: 'processing', paid: true, paymentMethod: 'Mobile Money', courier: 'Bolt Courier', trackingCode: 'BT-98210', notes: 'Pack with thank-you card.',
    customer: { name: 'Ama Mensah', email: 'ama@example.com', phone: '+233 24 111 2222', city: 'Accra', address: 'East Legon, Accra' },
    items: [{ productId: 'p_luna_001', name: 'Luna Oud Eau de Parfum', qty: 1, price: 420 }, { productId: 'p_glow_003', name: 'Radiance Vitamin C Serum', qty: 1, price: 210 }],
    subtotal: 630, shipping: 35, tax: 47.25, discount: 0, total: 712.25
  },
  {
    id: 'GH-1002', createdAt: '2026-06-14T15:45:00.000Z', status: 'shipped', paid: true, paymentMethod: 'Card', courier: 'DHL Local', trackingCode: 'DHL-00145', notes: '',
    customer: { name: 'Nana Boateng', email: 'nana@example.com', phone: '+233 50 333 4444', city: 'Kumasi', address: 'Ahodwo, Kumasi' },
    items: [{ productId: 'p_bob_005', name: 'Silk Press Bob Wig', qty: 1, price: 760 }],
    subtotal: 760, shipping: 35, tax: 57, discount: 0, total: 852
  }
];

export const defaultReturns = [
  {
    id: 'RET-1001', orderId: 'GH-1001', customer: 'Ama Mensah', reason: 'Wrong scent selected', status: 'requested', refundAmount: 165, createdAt: '2026-06-15', notes: 'Customer wants exchange if possible.'
  }
];

export const defaultTeam = [
  { id: 'u_owner', name: 'Store Owner', email: 'owner@glowoutgh.test', role: 'Owner', active: true, lastSeen: 'Today' },
  { id: 'u_admin', name: 'Admin Manager', email: 'admin@glowoutgh.test', role: 'Admin', active: true, lastSeen: 'Yesterday' },
  { id: 'u_staff', name: 'Product Assistant', email: 'staff@glowoutgh.test', role: 'Product Manager', active: true, lastSeen: 'This week' }
];

export const demoCustomers = [
  { id: 'cust_demo_1', name: 'Ama Mensah', email: 'ama@example.com', phone: '+233 24 111 2222', city: 'Accra', vip: true, blocked: false, orders: 3, spend: 1840 },
  { id: 'cust_demo_2', name: 'Nana Boateng', email: 'nana@example.com', phone: '+233 50 333 4444', city: 'Kumasi', vip: false, blocked: false, orders: 1, spend: 852 }
];

export const blogPosts = [
  { id: 'b1', category: 'Perfume Guide', title: 'How to layer fragrance without overpowering your look', image: imageBank.perfume, excerpt: 'A simple routine for making your scent last from morning to evening.' },
  { id: 'b2', category: 'Skincare', title: 'Build a simple glow routine for busy mornings', image: imageBank.skincare, excerpt: 'Cleanse, hydrate, protect and treat without overloading your shelf.' },
  { id: 'b3', category: 'Hair', title: 'Wig care habits that keep units looking premium', image: imageBank.wigs, excerpt: 'Small care steps that protect texture, lace and overall shape.' }
];
