db = db.getSiblingDB("coffeemug");

const now = new Date();

db.products.insertMany([
  { _id: 1, name: "Invisible Socks", description: "Perfect for barefoot lovers.", unitPrice: 999, stock: 25, categoryId: 1, createdAt: now, updatedAt: now },
  { _id: 2, name: "Diet Water", description: "Now with 0% more calories!", unitPrice: 199, stock: 100, categoryId: 4, createdAt: now, updatedAt: now },
  { _id: 3, name: "Pet Rock", description: "Loyal, silent, and never hungry.", unitPrice: 499, stock: 50, categoryId: 3, createdAt: now, updatedAt: now },
  { _id: 4, name: "Air Guitar", description: "Shreds like a dream, weighs nothing.", unitPrice: 1499, stock: 10, categoryId: 3, createdAt: now, updatedAt: now },
  { _id: 5, name: "USB Toaster", description: "For warm bread while you work.", unitPrice: 2999, stock: 5, categoryId: 2, createdAt: now, updatedAt: now },
  { _id: 6, name: "Anti-Gravity Shoes", description: "Warning: Results may vary.", unitPrice: 19999, stock: 2, categoryId: 4, createdAt: now, updatedAt: now },
  { _id: 7, name: "World’s Smallest Violin", description: "For dramatic moments.", unitPrice: 799, stock: 30, categoryId: 3, createdAt: now, updatedAt: now },
  { _id: 8, name: "404 Not Found Shirt", description: "Shirt not included.", unitPrice: 1299, stock: 20, categoryId: 1, createdAt: now, updatedAt: now },
  { _id: 9, name: "Keyboard Waffle Iron", description: "Breakfast just got nerdier.", unitPrice: 2599, stock: 8, categoryId: 4, createdAt: now, updatedAt: now },
  { _id: 10, name: "Self-Stirring Mug", description: "Because spoons are outdated.", unitPrice: 1799, stock: 15, categoryId: 2, createdAt: now, updatedAt: now },
  { _id: 11, name: "Emergency Clown Nose", description: "For instant fun.", unitPrice: 499, stock: 60, categoryId: 3, createdAt: now, updatedAt: now },
  { _id: 12, name: "Cat Translator", description: "Meow means feed me.", unitPrice: 5999, stock: 3, categoryId: 2, createdAt: now, updatedAt: now },
  { _id: 13, name: "USB-Powered Candle", description: "The future is here.", unitPrice: 1299, stock: 12, categoryId: 2, createdAt: now, updatedAt: now },
  { _id: 14, name: "Coffee Alarm Clock", description: "Wakes you up and brews.", unitPrice: 3499, stock: 7, categoryId: 2, createdAt: now, updatedAt: now },
  { _id: 15, name: "Mini Desktop Fan", description: "Blows away your stress.", unitPrice: 1099, stock: 25, categoryId: 2, createdAt: now, updatedAt: now },
  { _id: 16, name: "LED Shoelaces", description: "For futuristic fashion.", unitPrice: 899, stock: 40, categoryId: 1, createdAt: now, updatedAt: now },
  { _id: 17, name: "Pocket Sand", description: "For emergency defense.", unitPrice: 399, stock: 50, categoryId: 3, createdAt: now, updatedAt: now },
  { _id: 18, name: "Unicorn Tears", description: "100% magical.", unitPrice: 7999, stock: 5, categoryId: 4, createdAt: now, updatedAt: now },
  { _id: 19, name: "Stress Banana", description: "Squeeze away the tension.", unitPrice: 999, stock: 35, categoryId: 3, createdAt: now, updatedAt: now },
  { _id: 20, name: "Fake Window", description: "For rooms without a view.", unitPrice: 4599, stock: 4, categoryId: 4, createdAt: now, updatedAt: now }
]);

db.products.updateMany({}, { $set: { reservedStock: [] } });

db.customers.insertMany([
  { _id: 1, name: "Buck Rogers", location: "US", createdAt: now, updatedAt: now },
  { _id: 2, name: "Euro Vision", location: "Europe", createdAt: now, updatedAt: now },
  { _id: 3, name: "Bao Bucks", location: "Asia", createdAt: now, updatedAt: now }
]);
