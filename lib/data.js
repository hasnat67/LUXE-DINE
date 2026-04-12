export const RESTAURANT = {
  name: "LUXE DINE",
  tagline: "A Culinary Experience Beyond Imagination",
  description: "Where art meets gastronomy. Explore our menu in stunning 3D and AR.",
  currency: "USD",
  currencySymbol: "$",
  taxRate: 0.08,
  serviceCharge: 0.05,
};

export const CATEGORIES = [
  { id: "starters", name: "Starters", icon: "🥗" },
  { id: "pizza", name: "Pizza", icon: "🍕" },
  { id: "burgers", name: "Burgers", icon: "🍔" },
  { id: "mains", name: "Main Course", icon: "🥘" },
  { id: "desserts", name: "Desserts", icon: "🍰" },
  { id: "beverages", name: "Beverages", icon: "🥤" },
];

export const MENU_ITEMS = [
  // Starters
  {
    id: "bruschetta",
    name: "Bruschetta Classica",
    category: "starters",
    price: 12.99,
    calories: 280,
    description:
      "Crispy artisan bread topped with diced Roma tomatoes, fresh basil, garlic, and extra virgin olive oil. A timeless Italian appetizer.",
    ingredients: [
      "Artisan Bread",
      "Roma Tomatoes",
      "Fresh Basil",
      "Garlic",
      "Olive Oil",
      "Balsamic Glaze",
    ],
    image: "/images/bruschetta.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  {
    id: "garlic-bread",
    name: "Truffle Garlic Bread",
    category: "starters",
    price: 9.99,
    calories: 320,
    description:
      "Golden-toasted sourdough bread infused with roasted garlic butter, truffle oil, and fresh herbs.",
    ingredients: [
      "Sourdough Bread",
      "Roasted Garlic",
      "Truffle Oil",
      "Parsley",
      "Butter",
    ],
    image: "/images/garlic-bread.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "caesar-salad",
    name: "Caesar Salad",
    category: "starters",
    price: 14.99,
    calories: 350,
    description:
      "Crisp romaine lettuce, house-made croutons, aged Parmigiano-Reggiano, and our signature anchovy-free Caesar dressing.",
    ingredients: [
      "Romaine Lettuce",
      "Croutons",
      "Parmesan",
      "Caesar Dressing",
      "Lemon",
      "Black Pepper",
    ],
    image: "/images/caesar-salad.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },

  // Pizza
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    category: "pizza",
    price: 18.99,
    calories: 850,
    description:
      "San Marzano tomato sauce, fresh buffalo mozzarella, fragrant basil leaves on a hand-stretched Neapolitan crust. Baked in our wood-fired oven at 900°F.",
    ingredients: [
      "San Marzano Tomatoes",
      "Buffalo Mozzarella",
      "Fresh Basil",
      "Olive Oil",
      "Sea Salt",
      "Neapolitan Dough",
    ],
    image: "/images/margherita-pizza.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  {
    id: "pepperoni-pizza",
    name: "Pepperoni Inferno",
    category: "pizza",
    price: 21.99,
    calories: 980,
    description:
      "Spicy cup-and-char pepperoni, tangy tomato sauce, premium low-moisture mozzarella, and a drizzle of hot honey on our signature crust.",
    ingredients: [
      "Pepperoni",
      "Mozzarella",
      "Tomato Sauce",
      "Hot Honey",
      "Chili Flakes",
      "Oregano",
    ],
    image: "/images/pepperoni-pizza.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "bbq-chicken-pizza",
    name: "BBQ Chicken Pizza",
    category: "pizza",
    price: 22.99,
    calories: 920,
    description:
      "Smoky BBQ sauce base, marinated grilled chicken, caramelized red onions, fresh cilantro, and smoked gouda cheese.",
    ingredients: [
      "Grilled Chicken",
      "BBQ Sauce",
      "Red Onions",
      "Cilantro",
      "Smoked Gouda",
      "Mozzarella",
    ],
    image: "/images/bbq-chicken-pizza.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "four-cheese-pizza",
    name: "Quattro Formaggi",
    category: "pizza",
    price: 23.99,
    calories: 950,
    description:
      "A luxurious blend of mozzarella, gorgonzola, Parmigiano-Reggiano, and fontina on a garlic-infused cream base.",
    ingredients: [
      "Mozzarella",
      "Gorgonzola",
      "Parmesan",
      "Fontina",
      "Garlic Cream",
      "Truffle Oil",
    ],
    image: "/images/margherita-pizza.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },

  // Burgers
  {
    id: "classic-burger",
    name: "Classic Smash Burger",
    category: "burgers",
    price: 19.99,
    calories: 780,
    description:
      "Double-smashed Wagyu beef patties, aged cheddar, house-made pickles, caramelized onions, and secret sauce on a toasted brioche bun.",
    ingredients: [
      "Wagyu Beef",
      "Aged Cheddar",
      "Pickles",
      "Caramelized Onions",
      "Secret Sauce",
      "Brioche Bun",
    ],
    image: "/images/classic-burger.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  {
    id: "chicken-burger",
    name: "Chicken Tikka Burger",
    category: "burgers",
    price: 18.99,
    calories: 720,
    description:
      "Tandoori-spiced crispy chicken thigh, mint yogurt, pickled red onions, butter lettuce on a sesame bun.",
    ingredients: [
      "Chicken Thigh",
      "Tikka Spices",
      "Mint Yogurt",
      "Red Onions",
      "Lettuce",
      "Sesame Bun",
    ],
    image: "/images/chicken-burger.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "veggie-burger",
    name: "Beyond Garden Burger",
    category: "burgers",
    price: 17.99,
    calories: 580,
    description:
      "Plant-based patty with roasted portobello, avocado cream, sun-dried tomatoes, and arugula on multigrain bun.",
    ingredients: [
      "Plant Patty",
      "Portobello",
      "Avocado",
      "Sun-Dried Tomatoes",
      "Arugula",
      "Multigrain Bun",
    ],
    image: "/images/classic-burger.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },

  // Main Course
  {
    id: "grilled-salmon",
    name: "Atlantic Grilled Salmon",
    category: "mains",
    price: 32.99,
    calories: 520,
    description:
      "Pan-seared Atlantic salmon with lemon-herb butter, grilled asparagus, and roasted fingerling potatoes. Finished with a white wine reduction.",
    ingredients: [
      "Atlantic Salmon",
      "Lemon Butter",
      "Asparagus",
      "Fingerling Potatoes",
      "White Wine",
      "Fresh Herbs",
    ],
    image: "/images/grilled-salmon.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  {
    id: "pasta-carbonara",
    name: "Pasta Carbonara",
    category: "mains",
    price: 24.99,
    calories: 680,
    description:
      "Al dente spaghetti tossed with crispy guanciale, egg yolk, Pecorino Romano, and freshly cracked black pepper. True Roman tradition.",
    ingredients: [
      "Spaghetti",
      "Guanciale",
      "Egg Yolk",
      "Pecorino Romano",
      "Black Pepper",
      "Parmesan",
    ],
    image: "/images/pasta-carbonara.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "lamb-shank",
    name: "Braised Lamb Shank",
    category: "mains",
    price: 36.99,
    calories: 750,
    description:
      "12-hour slow-braised lamb shank with rosemary jus, truffle mashed potatoes, and roasted root vegetables.",
    ingredients: [
      "Lamb Shank",
      "Rosemary",
      "Truffle Potatoes",
      "Root Vegetables",
      "Red Wine Jus",
      "Thyme",
    ],
    image: "/images/lamb-shank.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },

  // Desserts
  {
    id: "tiramisu",
    name: "Classic Tiramisu",
    category: "desserts",
    price: 14.99,
    calories: 420,
    description:
      "Layers of espresso-soaked Savoiardi, mascarpone cream, and Valrhona cocoa. Made fresh daily.",
    ingredients: [
      "Mascarpone",
      "Espresso",
      "Ladyfingers",
      "Cocoa Powder",
      "Marsala Wine",
      "Egg Yolk",
    ],
    image: "/images/tiramisu.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
    featured: true,
  },
  {
    id: "chocolate-lava",
    name: "Chocolate Lava Cake",
    category: "desserts",
    price: 15.99,
    calories: 480,
    description:
      "Warm Valrhona dark chocolate cake with a molten center, served with Madagascar vanilla bean ice cream.",
    ingredients: [
      "Dark Chocolate",
      "Butter",
      "Eggs",
      "Flour",
      "Vanilla Ice Cream",
      "Cocoa",
    ],
    image: "/images/chocolate-lava.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "creme-brulee",
    name: "Crème Brûlée",
    category: "desserts",
    price: 13.99,
    calories: 380,
    description:
      "Silky vanilla bean custard with a crackling caramelized sugar crust, garnished with fresh seasonal berries.",
    ingredients: [
      "Heavy Cream",
      "Vanilla Bean",
      "Egg Yolk",
      "Sugar",
      "Fresh Berries",
    ],
    image: "/images/creme-brulee.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },

  // Beverages
  {
    id: "lemonade",
    name: "Fresh Lemonade",
    category: "beverages",
    price: 7.99,
    calories: 120,
    description:
      "Hand-squeezed lemons, organic cane sugar, fresh mint, and sparkling water. Refreshingly simple.",
    ingredients: ["Fresh Lemons", "Cane Sugar", "Mint", "Sparkling Water", "Ice"],
    image: "/images/lemonade.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "espresso",
    name: "Double Espresso",
    category: "beverages",
    price: 5.99,
    calories: 10,
    description:
      "Rich, aromatic double shot of our house-roasted single-origin Ethiopian Yirgacheffe beans.",
    ingredients: ["Ethiopian Coffee Beans", "Filtered Water"],
    image: "/images/espresso.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
  {
    id: "mango-smoothie",
    name: "Tropical Mango Smoothie",
    category: "beverages",
    price: 9.99,
    calories: 220,
    description:
      "Alphonso mango puree blended with coconut cream, passion fruit, and a hint of lime.",
    ingredients: [
      "Alphonso Mango",
      "Coconut Cream",
      "Passion Fruit",
      "Lime",
      "Ice",
    ],
    image: "/images/mango-smoothie.png",
    modelUrl: "https://modelviewer.dev/shared-assets/models/Astronaut.glb",
  },
];

export function getItemById(id) {
  return MENU_ITEMS.find((item) => item.id === id);
}

export function getItemsByCategory(categoryId) {
  return MENU_ITEMS.filter((item) => item.category === categoryId);
}

export function getFeaturedItems() {
  return MENU_ITEMS.filter((item) => item.featured);
}
