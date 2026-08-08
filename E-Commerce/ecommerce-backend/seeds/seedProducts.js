const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('../models/Product');

dotenv.config({ path: require('path').join(__dirname, '..', '.env') });

const products = [
  // ==================== ELECTRONICS ====================
  {
    name: 'ProBass X1 Wireless Headphones',
    description:
      'Premium noise-cancelling over-ear headphones with 40-hour battery life, Hi-Res Audio, and ultra-comfortable memory foam ear cushions. Features adaptive ANC and multipoint Bluetooth 5.3 connectivity.',
    price: 149.99,
    originalPrice: 199.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500',
    stock: 45,
    rating: 4.7,
    numReviews: 234,
    featured: true,
    tags: ['headphones', 'wireless', 'noise-cancelling'],
  },
  {
    name: 'NovaTech Smartwatch Pro',
    description:
      'Advanced fitness smartwatch with AMOLED display, SpO2 monitoring, GPS, 100+ workout modes, sleep tracking, and 14-day battery life. Water-resistant to 50 meters.',
    price: 229.99,
    originalPrice: 299.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1546868871-af0de0ae72be?w=500',
    stock: 30,
    rating: 4.5,
    numReviews: 189,
    featured: true,
    tags: ['smartwatch', 'fitness', 'wearable'],
  },
  {
    name: 'SoundWave Portable Speaker',
    description:
      'Compact Bluetooth speaker with 360° immersive sound, IP67 waterproof rating, 20-hour playtime, and built-in power bank. Perfect for outdoor adventures.',
    price: 79.99,
    originalPrice: 99.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500',
    stock: 60,
    rating: 4.3,
    numReviews: 156,
    featured: false,
    tags: ['speaker', 'bluetooth', 'portable'],
  },
  {
    name: 'UltraSlim Laptop 15 Pro',
    description:
      'Ultra-thin professional laptop with 15.6" 4K OLED display, Intel i7 processor, 16GB RAM, 512GB SSD, and all-day battery. Perfect for creators and professionals.',
    price: 1299.99,
    originalPrice: 1499.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500',
    stock: 15,
    rating: 4.8,
    numReviews: 312,
    featured: true,
    tags: ['laptop', 'computer', 'professional'],
  },
  {
    name: 'PowerPods TWS Earbuds',
    description:
      'True wireless earbuds with active noise cancellation, spatial audio, and 30-hour total battery with wireless charging case. Crystal-clear call quality.',
    price: 89.99,
    originalPrice: 129.99,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=500',
    stock: 80,
    rating: 4.4,
    numReviews: 278,
    featured: false,
    tags: ['earbuds', 'wireless', 'tws'],
  },

  // ==================== FASHION ====================
  {
    name: 'AeroStride Running Shoes',
    description:
      'Lightweight performance running shoes with responsive cushioning, breathable mesh upper, and carbon fiber plate for maximum energy return. Designed for distance runners.',
    price: 159.99,
    originalPrice: 189.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500',
    stock: 40,
    rating: 4.6,
    numReviews: 203,
    featured: true,
    tags: ['shoes', 'running', 'athletic'],
  },
  {
    name: 'Alpine Weatherproof Jacket',
    description:
      'Premium all-weather jacket with GORE-TEX membrane, taped seams, adjustable hood, and multiple pockets. Breathable, waterproof, and windproof for all conditions.',
    price: 249.99,
    originalPrice: 329.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500',
    stock: 25,
    rating: 4.7,
    numReviews: 145,
    featured: true,
    tags: ['jacket', 'outdoor', 'waterproof'],
  },
  {
    name: 'Voyager Canvas Backpack',
    description:
      'Durable waxed canvas backpack with leather accents, padded laptop compartment, multiple organizer pockets, and adjustable ergonomic straps. 30L capacity.',
    price: 89.99,
    originalPrice: 119.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500',
    stock: 35,
    rating: 4.5,
    numReviews: 167,
    featured: false,
    tags: ['backpack', 'bag', 'travel'],
  },
  {
    name: 'Polarized Aviator Sunglasses',
    description:
      'Classic aviator sunglasses with polarized UV400 lenses, titanium frame, scratch-resistant coating, and spring hinges for all-day comfort.',
    price: 69.99,
    originalPrice: 99.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500',
    stock: 55,
    rating: 4.3,
    numReviews: 198,
    featured: false,
    tags: ['sunglasses', 'accessories', 'polarized'],
  },
  {
    name: 'Classic Leather Watch',
    description:
      'Elegant analog watch with genuine Italian leather strap, sapphire crystal glass, Japanese quartz movement, and water-resistant stainless steel case.',
    price: 179.99,
    originalPrice: 229.99,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500',
    stock: 20,
    rating: 4.6,
    numReviews: 134,
    featured: true,
    tags: ['watch', 'leather', 'accessories'],
  },

  // ==================== HOME & KITCHEN ====================
  {
    name: 'Aurora Smart LED Lamp',
    description:
      'App-controlled smart lamp with 16 million color options, adjustable brightness, circadian rhythm mode, and voice assistant compatibility. Modern minimalist design.',
    price: 59.99,
    originalPrice: 79.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057ab6fe?w=500',
    stock: 50,
    rating: 4.4,
    numReviews: 213,
    featured: true,
    tags: ['lamp', 'smart-home', 'lighting'],
  },
  {
    name: 'BrewMaster Pro Coffee Maker',
    description:
      'Professional-grade drip coffee maker with built-in grinder, thermal carafe, programmable timer, and precision temperature control. Brews 12 cups of barista-quality coffee.',
    price: 199.99,
    originalPrice: 249.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500',
    stock: 22,
    rating: 4.7,
    numReviews: 276,
    featured: true,
    tags: ['coffee', 'kitchen', 'appliance'],
  },
  {
    name: 'Zen Ceramic Plant Pot Set',
    description:
      'Set of 3 handcrafted ceramic planters in graduated sizes with bamboo drainage trays. Minimalist Scandinavian design with matte finish. Perfect for indoor plants.',
    price: 44.99,
    originalPrice: 59.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=500',
    stock: 40,
    rating: 4.5,
    numReviews: 89,
    featured: false,
    tags: ['plants', 'decor', 'ceramic'],
  },
  {
    name: 'Cast Iron Dutch Oven',
    description:
      'Premium enameled cast iron Dutch oven with self-basting lid, even heat distribution, and oven-safe up to 500°F. 6-quart capacity, perfect for soups, stews, and bread.',
    price: 129.99,
    originalPrice: 169.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=500',
    stock: 18,
    rating: 4.8,
    numReviews: 321,
    featured: false,
    tags: ['cookware', 'kitchen', 'cast-iron'],
  },
  {
    name: 'Minimalist Wall Clock',
    description:
      'Silent sweep movement wall clock with clean Nordic design, solid wood frame, and anti-fog glass. Battery operated. 12-inch diameter.',
    price: 39.99,
    originalPrice: 54.99,
    category: 'Home & Kitchen',
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500',
    stock: 30,
    rating: 4.3,
    numReviews: 112,
    featured: false,
    tags: ['clock', 'decor', 'minimalist'],
  },

  // ==================== BOOKS ====================
  {
    name: 'The Midnight Algorithm',
    description:
      'A gripping techno-thriller about an AI researcher who discovers a hidden pattern in social media data that predicts human behavior. When powerful forces learn of her discovery, she must race to protect the truth.',
    price: 16.99,
    originalPrice: 24.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500',
    stock: 100,
    rating: 4.6,
    numReviews: 445,
    featured: true,
    tags: ['fiction', 'thriller', 'technology'],
  },
  {
    name: 'Clean Architecture Handbook',
    description:
      'Comprehensive guide to software architecture principles, design patterns, and best practices. Covers microservices, event-driven architecture, and domain-driven design with real-world examples.',
    price: 49.99,
    originalPrice: 59.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500',
    stock: 70,
    rating: 4.8,
    numReviews: 523,
    featured: true,
    tags: ['programming', 'architecture', 'technical'],
  },
  {
    name: 'Atomic Focus',
    description:
      'Transform your productivity with science-backed strategies for deep work, habit stacking, and energy management. Learn how small daily improvements lead to remarkable results.',
    price: 14.99,
    originalPrice: 19.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
    stock: 85,
    rating: 4.5,
    numReviews: 389,
    featured: false,
    tags: ['self-help', 'productivity', 'habits'],
  },
  {
    name: 'Data Structures & Algorithms',
    description:
      'Master data structures and algorithms with clear explanations, visual illustrations, and 200+ coding challenges in Python and JavaScript. From basics to advanced graph algorithms.',
    price: 39.99,
    originalPrice: 49.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=500',
    stock: 55,
    rating: 4.7,
    numReviews: 612,
    featured: false,
    tags: ['programming', 'algorithms', 'education'],
  },
  {
    name: 'The Art of Solitude',
    description:
      'A beautifully written exploration of finding peace and creativity in solitude. Drawing on philosophy, psychology, and personal essays, this book celebrates the power of being alone.',
    price: 12.99,
    originalPrice: 18.99,
    category: 'Books',
    image: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=500',
    stock: 65,
    rating: 4.4,
    numReviews: 267,
    featured: false,
    tags: ['non-fiction', 'philosophy', 'wellness'],
  },
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    const created = await Product.insertMany(products);
    console.log(`🌱 Seeded ${created.length} products successfully!`);

    await mongoose.connection.close();
    console.log('📦 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedProducts();
