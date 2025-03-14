db = db.getSiblingDB("coffeemug");

const now = new Date();

db.products.insertMany([
  { _id: 1, name: "Invisible Socks", description: "Perfect for barefoot lovers.", price: 999, stock: 25, createdAt: now, updatedAt: now },
  { _id: 2, name: "Diet Water", description: "Now with 0% more calories!", price: 199, stock: 100, createdAt: now, updatedAt: now },
  { _id: 3, name: "Pet Rock", description: "Loyal, silent, and never hungry.", price: 499, stock: 50, createdAt: now, updatedAt: now },
  { _id: 4, name: "Air Guitar", description: "Shreds like a dream, weighs nothing.", price: 1499, stock: 10, createdAt: now, updatedAt: now },
  { _id: 5, name: "USB Toaster", description: "For warm bread while you work.", price: 2999, stock: 5, createdAt: now, updatedAt: now },
  { _id: 6, name: "Anti-Gravity Shoes", description: "Warning: Results may vary.", price: 19999, stock: 2, createdAt: now, updatedAt: now },
  { _id: 7, name: "World’s Smallest Violin", description: "For dramatic moments.", price: 799, stock: 30, createdAt: now, updatedAt: now },
  { _id: 8, name: "404 Not Found Shirt", description: "Shirt not included.", price: 1299, stock: 20, createdAt: now, updatedAt: now },
  { _id: 9, name: "Keyboard Waffle Iron", description: "Breakfast just got nerdier.", price: 2599, stock: 8, createdAt: now, updatedAt: now },
  { _id: 10, name: "Self-Stirring Mug", description: "Because spoons are outdated.", price: 1799, stock: 15, createdAt: now, updatedAt: now },
  { _id: 11, name: "Emergency Clown Nose", description: "For instant fun.", price: 499, stock: 60, createdAt: now, updatedAt: now },
  { _id: 12, name: "Cat Translator", description: "Meow means feed me.", price: 5999, stock: 3, createdAt: now, updatedAt: now },
  { _id: 13, name: "USB-Powered Candle", description: "The future is here.", price: 1299, stock: 12, createdAt: now, updatedAt: now },
  { _id: 14, name: "Coffee Alarm Clock", description: "Wakes you up and brews.", price: 3499, stock: 7, createdAt: now, updatedAt: now },
  { _id: 15, name: "Mini Desktop Fan", description: "Blows away your stress.", price: 1099, stock: 25, createdAt: now, updatedAt: now },
  { _id: 16, name: "LED Shoelaces", description: "For futuristic fashion.", price: 899, stock: 40, createdAt: now, updatedAt: now },
  { _id: 17, name: "Pocket Sand", description: "For emergency defense.", price: 399, stock: 50, createdAt: now, updatedAt: now },
  { _id: 18, name: "Unicorn Tears", description: "100% magical.", price: 7999, stock: 5, createdAt: now, updatedAt: now },
  { _id: 19, name: "Stress Banana", description: "Squeeze away the tension.", price: 999, stock: 35, createdAt: now, updatedAt: now },
  { _id: 20, name: "Fake Window", description: "For rooms without a view.", price: 4599, stock: 4, createdAt: now, updatedAt: now }
]);

db.customers.insertMany([
  { _id: 1, name: "Buck Rogers", location: "US", createdAt: now, updatedAt: now },
  { _id: 2, name: "Euro Vision", location: "Europe", createdAt: now, updatedAt: now },
  { _id: 3, name: "Bao Bucks", location: "Asia", createdAt: now, updatedAt: now }
]);
