export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface TemplateDTO {
  id: number;
  slug: string;
  title: string;
  category: string | null;
  tags: string[];
  previewImage: string;
  demoUrl: string | null;
}

export interface CaseDTO {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  description: string;
  previewImage: string;
  videoUrl: string | null;
  tags: string[];
  sortOrder: number;
  createdAt: string;
}

export interface CertificateDTO {
  id: number;
  title: string;
  description: string;
  image: string;
  sortOrder: number;
  createdAt: string;
}
