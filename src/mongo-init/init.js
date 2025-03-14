db = db.getSiblingDB("coffeemug");

db.products.insertMany([
  { _id: 1, name: "Invisible Socks", description: "Perfect for barefoot lovers.", price: 999, stock: 25 },
  { _id: 2, name: "Diet Water", description: "Now with 0% more calories!", price: 199, stock: 100 },
  { _id: 3, name: "Pet Rock", description: "Loyal, silent, and never hungry.", price: 499, stock: 50 },
  { _id: 4, name: "Air Guitar", description: "Shreds like a dream, weighs nothing.", price: 1499, stock: 10 },
  { _id: 5, name: "USB Toaster", description: "For warm bread while you work.", price: 2999, stock: 5 },
  { _id: 6, name: "Anti-Gravity Shoes", description: "Warning: Results may vary.", price: 19999, stock: 2 },
  { _id: 7, name: "World’s Smallest Violin", description: "For dramatic moments.", price: 799, stock: 30 },
  { _id: 8, name: "404 Not Found Shirt", description: "Shirt not included.", price: 1299, stock: 20 },
  { _id: 9, name: "Keyboard Waffle Iron", description: "Breakfast just got nerdier.", price: 2599, stock: 8 },
  { _id: 10, name: "Self-Stirring Mug", description: "Because spoons are outdated.", price: 1799, stock: 15 },
  { _id: 11, name: "Emergency Clown Nose", description: "For instant fun.", price: 499, stock: 60 },
  { _id: 12, name: "Cat Translator", description: "Meow means feed me.", price: 5999, stock: 3 },
  { _id: 13, name: "USB-Powered Candle", description: "The future is here.", price: 1299, stock: 12 },
  { _id: 14, name: "Coffee Alarm Clock", description: "Wakes you up and brews.", price: 3499, stock: 7 },
  { _id: 15, name: "Mini Desktop Fan", description: "Blows away your stress.", price: 1099, stock: 25 },
  { _id: 16, name: "LED Shoelaces", description: "For futuristic fashion.", price: 899, stock: 40 },
  { _id: 17, name: "Pocket Sand", description: "For emergency defense.", price: 399, stock: 50 },
  { _id: 18, name: "Unicorn Tears", description: "100% magical.", price: 7999, stock: 5 },
  { _id: 19, name: "Stress Banana", description: "Squeeze away the tension.", price: 999, stock: 35 },
  { _id: 20, name: "Fake Window", description: "For rooms without a view.", price: 4599, stock: 4 }
]);

db.customers.insertMany([
  { _id: 1, name: "Buck Rogers", location: "US" },
  { _id: 2, name: "Euro Vision", location: "Europe" },
  { _id: 3, name: "Bao Bucks", location: "Asia" }
]);