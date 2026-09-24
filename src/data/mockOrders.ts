export interface OrderProductItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  color: string;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  date: string;
  status: "Delivered" | "In Transit" | "Processing";
  trackingNumber: string;
  deliveryDate: string;
  totalAmount: number;
  items: OrderProductItem[];
  shippingAddress: string;
  paymentMethod: string;
}

export interface SavedAddress {
  id: string;
  type: "Home" | "Office";
  name: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

export const MOCK_ORDERS: OrderRecord[] = [
  {
    id: "ord-101",
    orderNumber: "PAL-2026-8912",
    date: "18 Sep 2026",
    status: "Delivered",
    trackingNumber: "FEDX98214022",
    deliveryDate: "21 Sep 2026",
    totalAmount: 2999,
    items: [
      {
        id: "pal-001",
        name: "Wine Tissue Silk Saree",
        image: "/images/hero-saree.jpg",
        price: 2999,
        quantity: 1,
        color: "Wine",
      },
    ],
    shippingAddress: "Flat 402, Lotus Towers, Indiranagar, Bangalore, Karnataka - 560038",
    paymentMethod: "UPI (Google Pay)",
  },
  {
    id: "ord-102",
    orderNumber: "PAL-2026-7451",
    date: "02 Sep 2026",
    status: "Delivered",
    trackingNumber: "BLUE78219901",
    deliveryDate: "06 Sep 2026",
    totalAmount: 4998,
    items: [
      {
        id: "pal-006",
        name: "Chanderi Gold Tissue Festive Saree",
        image: "https://images.unsplash.com/photo-1616756141603-6d37d5cde2a2?q=80&w=600&auto=format&fit=crop",
        price: 2499,
        quantity: 2,
        color: "Gold",
      },
    ],
    shippingAddress: "Flat 402, Lotus Towers, Indiranagar, Bangalore, Karnataka - 560038",
    paymentMethod: "Credit Card (HDFC **** 8821)",
  },
];

export const MOCK_ADDRESSES: SavedAddress[] = [
  {
    id: "addr-1",
    type: "Home",
    name: "Radhika Sharma",
    phone: "+91 98765 43210",
    addressLine: "Flat 402, Lotus Towers, 12th Main Road, Indiranagar",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560038",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Office",
    name: "Radhika Sharma",
    phone: "+91 98765 43210",
    addressLine: "Level 4, Prestige Tech Park, Marathahalli-Sarjapur Ring Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560103",
    isDefault: false,
  },
];
