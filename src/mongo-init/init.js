db = db.getSiblingDB("coffeemug");

db.products.insertMany([
  { name: "Invisible Socks", description: "Perfect for barefoot lovers.", price: 999, stock: 25 },
  { name: "Diet Water", description: "Now with 0% more calories!", price: 199, stock: 100 },
  { name: "Pet Rock", description: "Loyal, silent, and never hungry.", price: 499, stock: 50 },
  { name: "Air Guitar", description: "Shreds like a dream, weighs nothing.", price: 1499, stock: 10 },
  { name: "USB Toaster", description: "For warm bread while you work.", price: 2999, stock: 5 },
  { name: "Anti-Gravity Shoes", description: "Warning: Results may vary.", price: 19999, stock: 2 },
  { name: "World’s Smallest Violin", description: "For dramatic moments.", price: 799, stock: 30 },
  { name: "404 Not Found Shirt", description: "Shirt not included.", price: 1299, stock: 20 },
  { name: "Keyboard Waffle Iron", description: "Breakfast just got nerdier.", price: 2599, stock: 8 },
  { name: "Self-Stirring Mug", description: "Because spoons are outdated.", price: 1799, stock: 15 },
  { name: "Emergency Clown Nose", description: "For instant fun.", price: 499, stock: 60 },
  { name: "Cat Translator", description: "Meow means feed me.", price: 5999, stock: 3 },
  { name: "USB-Powered Candle", description: "The future is here.", price: 1299, stock: 12 },
  { name: "Coffee Alarm Clock", description: "Wakes you up and brews.", price: 3499, stock: 7 },
  { name: "Mini Desktop Fan", description: "Blows away your stress.", price: 1099, stock: 25 },
  { name: "LED Shoelaces", description: "For futuristic fashion.", price: 899, stock: 40 },
  { name: "Pocket Sand", description: "For emergency defense.", price: 399, stock: 50 },
  { name: "Unicorn Tears", description: "100% magical.", price: 7999, stock: 5 },
  { name: "Stress Banana", description: "Squeeze away the tension.", price: 999, stock: 35 },
  { name: "Fake Window", description: "For rooms without a view.", price: 4599, stock: 4 }
]);

db.customers.insertMany([
  { _id: 1, name: "Buck Rogers", location: "US" },
  { _id: 2, name: "Euro Vision", location: "Europe" },
  { _id: 3, name: "Bao Bucks", location: "Asia" }
]);