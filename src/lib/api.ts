import type { Category, TemplateDTO, CaseDTO, CertificateDTO, LeadDTO } from "./types";

const TOKEN_KEY = "admin_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string | null): void {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options?.headers ?? {}),
      ...(options?.body && !(options.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
    },
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: "Ошибка запроса" }));
    throw new Error(data.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/* ── Auth ── */

export const api = {
  getToken,
  setToken,

  authStatus: () => request<{ hasAdmin: boolean }>("/api/auth/status"),

  setup: (username: string, password: string) =>
    request<{ ok: boolean }>("/api/auth/setup", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  login: (username: string, password: string) =>
    request<{ token: string; username: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  me: () => request<{ id: number; username: string }>("/api/auth/me"),

  /* ── Categories ── */

  listCategories: () => request<Category[]>("/api/categories"),

  createCategory: (name: string) =>
    request<Category>("/api/categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  updateCategory: (id: number, name: string) =>
    request<Category>(`/api/categories/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  deleteCategory: (id: number) =>
    request<{ ok: boolean }>(`/api/categories/${id}`, { method: "DELETE" }),

  /* ── Templates ── */

  listTemplates: () => request<TemplateDTO[]>("/api/templates"),

  getTemplate: (slug: string) => request<TemplateDTO>(`/api/templates/${slug}`),

  createTemplate: (data: {
    slug: string;
    title: string;
    categoryId: number | null;
    tags: string[];
    previewImage: string;
    archiveName?: string;
    extractedPath?: string;
  }) =>
    request<{ id: number; ok: boolean }>("/api/templates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateTemplate: (
    id: number,
    data: { title?: string; categoryId?: number | null; tags?: string[]; previewImage?: string },
  ) =>
    request<{ ok: boolean }>(`/api/templates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteTemplate: (id: number) =>
    request<{ ok: boolean }>(`/api/templates/${id}`, { method: "DELETE" }),

  uploadPreview: (file: File) => {
    const fd = new FormData();
    fd.append("preview", file);
    return request<{ path: string }>("/api/templates/upload-preview", {
      method: "POST",
      body: fd,
    });
  },

  uploadArchive: (file: File, slug: string) => {
    const fd = new FormData();
    fd.append("archive", file);
    fd.append("slug", slug);
    return request<{ archiveName: string; extractedPath: string }>(
      "/api/templates/upload-archive",
      { method: "POST", body: fd },
    );
  },

  /* ── Cases ── */

  listCases: () => request<CaseDTO[]>("/api/cases"),

  getCase: (slug: string) => request<CaseDTO>(`/api/cases/${slug}`),

  createCase: (data: {
    slug: string;
    title: string;
    excerpt?: string;
    description?: string;
    problem?: string;
    solution?: string;
    savings?: string;
    price?: string;
    previewImage: string;
    videoUrl?: string | null;
    tags?: string[];
    sortOrder?: number;
  }) =>
    request<{ id: number; ok: boolean }>("/api/cases", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCase: (
    id: number,
    data: {
      slug?: string;
      title?: string;
      excerpt?: string;
      description?: string;
      problem?: string;
      solution?: string;
      savings?: string;
      price?: string;
      previewImage?: string;
      videoUrl?: string | null;
      tags?: string[];
      sortOrder?: number;
    },
  ) =>
    request<{ ok: boolean }>(`/api/cases/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCase: (id: number) =>
    request<{ ok: boolean }>(`/api/cases/${id}`, { method: "DELETE" }),

  uploadCasePreview: (file: File) => {
    const fd = new FormData();
    fd.append("preview", file);
    return request<{ path: string }>("/api/cases/upload-preview", {
      method: "POST",
      body: fd,
    });
  },

  uploadCaseVideo: (file: File) => {
    const fd = new FormData();
    fd.append("video", file);
    return request<{ path: string }>("/api/cases/upload-video", {
      method: "POST",
      body: fd,
    });
  },

  uploadCaseVideoWithProgress: (
    file: File,
    onProgress: (percent: number) => void,
  ) => {
    const fd = new FormData();
    fd.append("video", file);
    const token = getToken();
    return new Promise<{ path: string }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      });
      xhr.addEventListener("load", () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch {
            reject(new Error("Ошибка парсинга ответа"));
          }
        } else {
          try {
            const data = JSON.parse(xhr.responseText);
            reject(new Error(data.error || `HTTP ${xhr.status}`));
          } catch {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        }
      });
      xhr.addEventListener("error", () => reject(new Error("Ошибка сети")));
      xhr.addEventListener("abort", () => reject(new Error("Загрузка отменена")));
      xhr.open("POST", "/api/cases/upload-video");
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(fd);
    });
  },

  /* ── Certificates ── */

  listCertificates: () => request<CertificateDTO[]>("/api/certificates"),

  createCertificate: (data: {
    title: string;
    description?: string;
    image: string;
    sortOrder?: number;
  }) =>
    request<{ id: number; ok: boolean }>("/api/certificates", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCertificate: (
    id: number,
    data: {
      title?: string;
      description?: string;
      image?: string;
      sortOrder?: number;
    },
  ) =>
    request<{ ok: boolean }>(`/api/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCertificate: (id: number) =>
    request<{ ok: boolean }>(`/api/certificates/${id}`, {
      method: "DELETE",
    }),

  uploadCertificateImage: (file: File) => {
    const fd = new FormData();
    fd.append("image", file);
    return request<{ path: string }>("/api/certificates/upload", {
      method: "POST",
      body: fd,
    });
  },

  /* ── Leads ── */

  listLeads: () => request<LeadDTO[]>("/api/leads"),

  createLead: (data: {
    name: string;
    contact: string;
    templateSlug?: string | null;
    comment?: string;
  }) =>
    request<{ id: number; ok: boolean }>("/api/leads", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateLeadStatus: (id: number, status: string) =>
    request<{ ok: boolean }>(`/api/leads/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),

  deleteLead: (id: number) =>
    request<{ ok: boolean }>(`/api/leads/${id}`, { method: "DELETE" }),
};
