const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });

// Since we can't easily import ES modules in a quick node script without setup, 
// I will hardcode the primary data structures derived from your data.js for the seed.
// In a real scenario, you'd import them or use a build step.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const CATEGORIES = [
  { id: "starters", name: "Starters", icon: "🥗", display_order: 1 },
  { id: "pizza", name: "Pizza", icon: "🍕", display_order: 2 },
  { id: "burgers", name: "Burgers", icon: "🍔", display_order: 3 },
  { id: "mains", name: "Main Course", icon: "🥘", display_order: 4 },
  { id: "desserts", name: "Desserts", icon: "🍰", display_order: 5 },
  { id: "beverages", name: "Beverages", icon: "🥤", display_order: 6 },
];

const MENU_ITEMS = [
  {
    id: "bruschetta",
    name: "Bruschetta Classica",
    category_id: "starters",
    price: 12.99,
    calories: 280,
    description: "Crispy artisan bread topped with diced Roma tomatoes, fresh basil, garlic, and extra virgin olive oil.",
    ingredients: ["Artisan Bread", "Roma Tomatoes", "Fresh Basil", "Garlic", "Olive Oil", "Balsamic Glaze"],
    image_url: "/images/bruschetta.png",
    model_url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    category_id: "pizza",
    price: 18.99,
    calories: 850,
    description: "San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves on a hand-stretched Neapolitan crust.",
    ingredients: ["San Marzano Tomatoes", "Buffalo Mozzarella", "Fresh Basil", "Olive Oil", "Sea Salt", "Neapolitan Dough"],
    image_url: "/images/margherita-pizza.png",
    model_url: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  // ... can add more or just these for testing
];

async function seed() {
  console.log('Starting seed process...');

  // 1. Seed Categories
  console.log('Seeding categories...');
  const { error: catError } = await supabase
    .from('categories')
    .upsert(CATEGORIES);
  
  if (catError) console.error('Error seeding categories:', catError);
  else console.log('Categories seeded successfully.');

  // 2. Seed Menu Items
  console.log('Seeding menu items...');
  const { error: itemError } = await supabase
    .from('menu_items')
    .upsert(MENU_ITEMS);
  
  if (itemError) console.error('Error seeding menu items:', itemError);
  else console.log('Menu items seeded successfully.');

  // 3. Seed Restaurant Info
  console.log('Seeding restaurant info...');
  const { error: restError } = await supabase
    .from('restaurants')
    .upsert([{
      name: "LUXE DINE",
      tagline: "A Culinary Experience Beyond Imagination",
      description: "Where art meets gastronomy. Explore our menu in stunning 3D and AR.",
      currency: "USD",
      currency_symbol: "$",
      tax_rate: 0.08,
      service_charge: 0.05,
      theme_color: "#D4AF37"
    }]);

  if (restError) console.error('Error seeding restaurant info:', restError);
  else console.log('Restaurant info seeded successfully.');

  // 4. Seed Tables
  console.log('Seeding tables...');
  const initialTables = Array.from({ length: 12 }, (_, i) => ({ id: i + 1, status: "available" }));
  const { error: tableError } = await supabase
    .from('restaurant_tables')
    .upsert(initialTables);

  if (tableError) console.error('Error seeding tables:', tableError);
  else console.log('Tables seeded successfully.');

  console.log('Seed process completed.');
}

seed();
