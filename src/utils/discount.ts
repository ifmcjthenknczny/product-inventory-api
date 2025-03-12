// TODO: apply this in handler
// TODO: check if it is in line with requirements

export const calculateDiscount = (quantity: number, basePrice: number, location: string): number => {
    let discount = 0;
  
    if (quantity >= 50) {
        discount = 30;
    }
    else if (quantity >= 10) {
        discount = 20;
    }
    else if (quantity >= 5) {
        discount = 10;
    }
  
    const today = new Date();
    const isBlackFriday = today.getMonth() === 10 && today.getDate() === 29;
    const isHolidaySale = [0, 6].includes(today.getDay());
  
    if (isBlackFriday) discount = Math.max(discount, 25);
    if (isHolidaySale) discount = Math.max(discount, 15);
  
    const locationAdjustment = location === "Europe" ? 1.15 : location === "Asia" ? 0.95 : 1;
    
    return basePrice * ((100 - discount) / 100) * locationAdjustment;
  };
  