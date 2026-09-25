export type ProviderType =
  | "Influencer"
  | "Website"
  | "Mobile App"
  | "Billboard"
  | "Digital Screen"
  | "Radio"
  | "Newspaper";

export interface Provider {
  id: string;
  name: string;
  type: ProviderType;
  location: string;
  category: string;
  price: number; // INR
  audience: number;
  rating: number;
  image: string; // initials color seed
  description: string;
}

export interface Campaign {
  id: string;
  title: string;
  industry: string;
  budget: number;
  location: string;
  objective: string;
  description: string;
  status: "Active" | "Draft" | "Completed";
  responses: number;
  createdAt: string;
}

export interface RequestItem {
  id: string;
  campaignTitle: string;
  advertiser: string;
  budget: number;
  status: "Pending" | "Accepted" | "Rejected";
  date: string;
  providerId?: string;
}

export interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

export interface Message {
  id: string;
  conversationId: string;
  fromMe: boolean;
  text: string;
  time: string;
}

const seed = (i: number) => ((i * 9301 + 49297) % 233280) / 233280;

export const providers: Provider[] = [
  { id: "p1", name: "Aarav Mehta", type: "Influencer", location: "Mumbai", category: "Lifestyle", price: 25000, audience: 320000, rating: 4.8, image: "AM", description: "Lifestyle creator focused on Gen Z fashion and travel." },
  { id: "p2", name: "TechDaily.in", type: "Website", location: "Bangalore", category: "Technology", price: 15000, audience: 850000, rating: 4.6, image: "TD", description: "India's leading consumer-tech news site with deep SEO presence." },
  { id: "p3", name: "Mumbai Central Hoarding", type: "Billboard", location: "Mumbai", category: "Outdoor", price: 180000, audience: 1200000, rating: 4.5, image: "MC", description: "Prime 40x20 ft billboard near Mumbai Central station." },
  { id: "p4", name: "Priya Kapoor", type: "Influencer", location: "Delhi", category: "Beauty", price: 40000, audience: 540000, rating: 4.9, image: "PK", description: "Beauty and skincare reviewer with strong engagement." },
  { id: "p5", name: "Radio Mirchi 98.3", type: "Radio", location: "Pune", category: "Entertainment", price: 35000, audience: 2200000, rating: 4.4, image: "RM", description: "Drive-time prime slots on Pune's #1 FM channel." },
  { id: "p6", name: "FitTrack App", type: "Mobile App", location: "Hyderabad", category: "Health", price: 22000, audience: 680000, rating: 4.3, image: "FT", description: "Fitness tracking app with in-app banner inventory." },
  { id: "p7", name: "Times Local Hyderabad", type: "Newspaper", location: "Hyderabad", category: "News", price: 60000, audience: 950000, rating: 4.2, image: "TL", description: "Sunday edition quarter-page premium placement." },
  { id: "p8", name: "Cyber Hub Digital Screen", type: "Digital Screen", location: "Gurgaon", category: "Outdoor", price: 95000, audience: 480000, rating: 4.7, image: "CH", description: "LED screen at Cyber Hub food court — high dwell time." },
  { id: "p9", name: "Rohit Sharma (Foodie)", type: "Influencer", location: "Bangalore", category: "Food", price: 18000, audience: 210000, rating: 4.5, image: "RS", description: "Bangalore food reviewer, restaurant collabs." },
  { id: "p10", name: "ShopMart App", type: "Mobile App", location: "Mumbai", category: "Shopping", price: 30000, audience: 1500000, rating: 4.1, image: "SM", description: "E-commerce app push and banner inventory." },
  { id: "p11", name: "Connaught Place Billboard", type: "Billboard", location: "Delhi", category: "Outdoor", price: 220000, audience: 1800000, rating: 4.6, image: "CP", description: "Iconic CP rotunda billboard." },
  { id: "p12", name: "DevWeekly Newsletter", type: "Website", location: "Remote", category: "Technology", price: 12000, audience: 95000, rating: 4.8, image: "DW", description: "Newsletter for senior engineers, 40% open rate." },
];

export const campaigns: Campaign[] = [
  { id: "c1", title: "Summer Sneaker Launch", industry: "Fashion", budget: 250000, location: "Mumbai", objective: "Brand Awareness", description: "Push our new monsoon sneaker line to urban Gen Z.", status: "Active", responses: 12, createdAt: "2026-06-02" },
  { id: "c2", title: "FinApp User Acquisition", industry: "Fintech", budget: 500000, location: "Pan-India", objective: "App Installs", description: "Drive installs of our UPI rewards app.", status: "Active", responses: 8, createdAt: "2026-06-08" },
  { id: "c3", title: "Local Bakery Reopening", industry: "F&B", budget: 35000, location: "Pune", objective: "Event Promotion", description: "Promote relaunch event with offers.", status: "Draft", responses: 0, createdAt: "2026-06-14" },
  { id: "c4", title: "EdTech Lead Funnel", industry: "Education", budget: 180000, location: "Hyderabad", objective: "Lead Generation", description: "Generate qualified leads for JEE coaching.", status: "Completed", responses: 24, createdAt: "2026-05-21" },
];

export const requests: RequestItem[] = [
  { id: "r1", campaignTitle: "Summer Sneaker Launch", advertiser: "StrideCo", budget: 25000, status: "Pending", date: "2026-06-12", providerId: "p1" },
  { id: "r2", campaignTitle: "FinApp User Acquisition", advertiser: "PayCircle", budget: 40000, status: "Accepted", date: "2026-06-10", providerId: "p4" },
  { id: "r3", campaignTitle: "EdTech Lead Funnel", advertiser: "LearnHub", budget: 60000, status: "Rejected", date: "2026-05-29", providerId: "p7" },
  { id: "r4", campaignTitle: "Local Bakery Reopening", advertiser: "Crumb & Co.", budget: 18000, status: "Pending", date: "2026-06-15", providerId: "p9" },
];

export const conversations: Conversation[] = [
  { id: "cv1", name: "Aarav Mehta", lastMessage: "Sounds good — let's lock the reel for next Friday.", time: "12:42", unread: 2 },
  { id: "cv2", name: "PayCircle Marketing", lastMessage: "Can you share the campaign brief?", time: "11:08", unread: 0 },
  { id: "cv3", name: "Mumbai Central Hoarding", lastMessage: "Slot available from 1st July.", time: "Yesterday", unread: 1 },
  { id: "cv4", name: "Priya Kapoor", lastMessage: "Loved the product, sending mood board.", time: "Mon", unread: 0 },
];

export const messagesByConv: Record<string, Message[]> = {
  cv1: [
    { id: "m1", conversationId: "cv1", fromMe: false, text: "Hey! Got your campaign request.", time: "12:30" },
    { id: "m2", conversationId: "cv1", fromMe: true, text: "Great — what's your availability for a reel + story combo?", time: "12:35" },
    { id: "m3", conversationId: "cv1", fromMe: false, text: "Sounds good — let's lock the reel for next Friday.", time: "12:42" },
  ],
  cv2: [
    { id: "m4", conversationId: "cv2", fromMe: false, text: "Can you share the campaign brief?", time: "11:08" },
  ],
  cv3: [
    { id: "m5", conversationId: "cv3", fromMe: false, text: "Slot available from 1st July.", time: "Yesterday" },
  ],
  cv4: [
    { id: "m6", conversationId: "cv4", fromMe: false, text: "Loved the product, sending mood board.", time: "Mon" },
  ],
};

export const users = [
  { id: "u1", name: "Sneha Iyer", email: "sneha@strideco.in", role: "Advertiser", joined: "2026-04-12", status: "Active" },
  { id: "u2", name: "Aarav Mehta", email: "aarav@creators.in", role: "Provider", joined: "2026-03-02", status: "Active" },
  { id: "u3", name: "Vikram Singh", email: "vikram@paycircle.io", role: "Advertiser", joined: "2026-05-19", status: "Active" },
  { id: "u4", name: "Priya Kapoor", email: "priya@beautylab.in", role: "Provider", joined: "2026-02-08", status: "Suspended" },
  { id: "u5", name: "Admin Root", email: "admin@adconnect.in", role: "Admin", joined: "2026-01-01", status: "Active" },
];

export const adminMetrics = {
  totalProviders: 348,
  totalAdvertisers: 1207,
  totalCampaigns: 524,
  revenue: 2840000,
};

export const industries = ["Fashion", "Fintech", "F&B", "Education", "Health", "Technology", "Real Estate", "Travel", "Other"];
export const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Gurgaon", "Pan-India"];
export const objectives = ["Brand Awareness", "Lead Generation", "Sales", "App Installs", "Event Promotion"];
export const budgetBuckets = [
  "Under ₹10,000",
  "₹10,000 - ₹50,000",
  "₹50,000 - ₹2,00,000",
  "₹2,00,000+",
];
export const providerTypes: ProviderType[] = [
  "Influencer",
  "Website",
  "Mobile App",
  "Billboard",
  "Digital Screen",
  "Radio",
  "Newspaper",
];

export const formatINR = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export const compactNumber = (n: number) =>
  new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 }).format(n);

// silence unused warning for deterministic seed util
void seed;