// Types TypeScript pour l'API Preisradio

export interface Retailer {
  id: string;
  name: string;
  slug: string;
  website: string;
  logo?: string;
  count?: number;
}

export interface Price {
  retailer: Retailer;
  price: number;
  currency: string;
  stock_status: 'in_stock' | 'out_of_stock' | 'preorder' | 'discontinued';
  url: string;
  last_checked: string;
}

// Product interface qui correspond à la structure réelle du backend (Saturn/MediaMarkt)
export interface Product {
  id: string;
  sku?: string;
  brand?: string;
  category: string;
  currency: string;
  description?: string;
  discount?: string;
  gtin?: string;  // EAN/GTIN code
  image?: string;
  old_price?: number;
  price: number;  // Prix unique (pas un tableau)
  scraped_at?: string;
  title: string;  // Nom du produit
  url: string;  // URL vers le produit sur le site du retailer
  retailer?: string;  // Retailer source: 'saturn' ou 'mediamarkt'
  produktbeschreibung?: string;
  produktdaten?: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface HealthResponse {
  status: string;
  message: string;
  timestamp: string;
}

export interface StatusResponse {
  status: string;
  version: string;
  api: {
    products: number;
    retailers: number;
  };
  database: {
    status: string;
    collections: string[];
  };
}

// Brand is now just a string (brand name)
// The backend simplified the response to return only brand names
export type Brand = string;

export interface BrandsResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: string[];  // Array of brand names
}

// Category is now just a string (category name)
// The backend simplified the response to return only category names
export type Category = string;

export interface CategoriesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: string[];  // Array of category names
}
