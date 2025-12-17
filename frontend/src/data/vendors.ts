export type VendorStatus = "draft" | "submitted" | "approved" | "rejected";

export interface Vendor {
  id: number | string;
  name: string;
  category?: string;
  location?: string;
  description?: string;
  email?: string;
  phone?: string;
  vendorUserId?: number;
  status: VendorStatus;
  rejectionReason?: string;
  openingHours?: string;
  flaggedReason?: string;
  
}

export const initialVendors: Vendor[] = [
  {
    id: 1,
    name: "Fresh Market",
    category: "Groceries",
    location: "Nijmegen",
    description: "Local produce, fresh vegetables and fruits.",
    email: "fresh@market.com",
    phone: "+31000000001",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "approved",          
  },
  {
    id: 2,
    name: "Evening Bakery",
    category: "Bakery",
    location: "Nijmegen",
    description: "Fresh bread and pastries every afternoon.",
    email: "hello@eveningbakery.com",
    phone: "+31000000002",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "submitted",         
  },
  {
    id: 3,
    name: "Green & Clean Laundry",
    category: "Laundry Service",
    location: "Arnhem",
    description:
      "Eco-friendly laundry and dry cleaning service with same-day delivery.",
    email: "service@greenandclean.nl",
    phone: "+31000000003",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "approved", 
  },
  {
    id: 4,
    name: "Cafe Luna",
    category: "Cafe",
    location: "Utrecht",
    description:
      "Cozy neighbourhood café serving fresh coffee, tea, and homemade snacks.",
    email: "contact@cafeluna.com",
    phone: "+31000000004",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "rejected",
    rejectionReason: "Insufficient listing description", 
  },
  {
    id: 5,
    name: "Blooming Florals",
    category: "Flower Shop",
    location: "Eindhoven",
    description:
      "Fresh bouquets, custom arrangements, and same-day flower delivery for all occasions.",
    email: "info@bloomingflorals.nl",
    phone: "+31000000005",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "approved",
  },
  {
    id: 6,
    name: "Urban Bicycle Repair",
    category: "Bike Repair",
    location: "Nijmegen",
    description:
      "Fast and affordable bicycle repairs, tune-ups, and parts replacement for daily commuters.",
    email: "support@urbanbikerepair.nl",
    phone: "+31000000006",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "submitted", 

  },
  {
    id: 7,
    name: "Taste of Istanbul",
    category: "Restaurant",
    location: "Arnhem",
    description:
      "Authentic Turkish cuisine with freshly prepared kebabs, mezes, and traditional desserts.",
    email: "contact@tasteofistanbul.nl",
    phone: "+31000000007",
    openingHours: "Mon-Fri 9:00-18:00, Sat 10:00-16:00",
    status: "approved",
  },  

];
