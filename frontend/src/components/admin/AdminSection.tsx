"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  Download,
  Eye,
  EyeOff,
  GripVertical,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { z } from "zod";
import { adminFetch, errorMessage } from "@/lib/admin-api";

type Section = "projects" | "categories" | "testimonials" | "services" | "messages" | "settings";
type Row = Record<string, string | number | boolean | null>;
type Field = {
  name: string;
  label: string;
  kind?: "textarea" | "checkbox" | "select" | "url" | "email" | "number" | "upload";
  uploadKind?: "image" | "document";
  required?: boolean;
  hint?: string;
};
type CategoryOption = { id: number; name: string };

const sectionInfo: Record<Section, { title: string; eyebrow: string; singular: string }> = {
  projects: { title: "Projects", eyebrow: "YOUR SELECTED WORK", singular: "project" },
  categories: { title: "Categories", eyebrow: "ORGANIZE YOUR PORTFOLIO", singular: "category" },
  testimonials: { title: "Testimonials", eyebrow: "KIND WORDS, REAL PEOPLE", singular: "testimonial" },
  services: { title: "Services", eyebrow: "WHAT YOU OFFER", singular: "service" },
  messages: { title: "Messages", eyebrow: "CLIENT INQUIRIES", singular: "message" },
  settings: { title: "Site settings", eyebrow: "YOUR PORTFOLIO IDENTITY", singular: "settings" },
};

const fields: Record<Exclude<Section, "messages">, Field[]> = {
  projects: [
    { name: "title", label: "Project title", required: true },
    { name: "slug", label: "URL slug", required: true, hint: "Lowercase words separated by hyphens." },
    { name: "description", label: "Description", kind: "textarea", required: true },
    { name: "client", label: "Client" },
    { name: "year", label: "Year", kind: "number", required: true },
    { name: "categoryId", label: "Category", kind: "select", required: true },
    { name: "videoUrl", label: "Video URL", kind: "url", required: true, hint: "YouTube, Vimeo, or HTTPS MP4." },
    { name: "thumbnailUrl", label: "Thumbnail image", kind: "upload", uploadKind: "image" },
    { name: "beforeAfterUrl", label: "Before / after URL", kind: "url" },
    { name: "tools", label: "Tools used", hint: "Separate tools with commas." },
    { name: "sortOrder", label: "Display order", kind: "number" },
    { name: "isFeatured", label: "Feature on home page", kind: "checkbox" },
    { name: "isPublished", label: "Published", kind: "checkbox" },
  ],
  categories: [
    { name: "name", label: "Category name", required: true },
    { name: "slug", label: "URL slug", required: true },
    { name: "sortOrder", label: "Display order", kind: "number" },
  ],
  testimonials: [
    { name: "clientName", label: "Client name", required: true },
    { name: "clientTitle", label: "Client role / company" },
    { name: "clientImageUrl", label: "Client photo", kind: "upload", uploadKind: "image" },
    { name: "quote", label: "Testimonial", kind: "textarea", required: true },
    { name: "sortOrder", label: "Display order", kind: "number" },
    { name: "isPublished", label: "Published", kind: "checkbox" },
  ],
  services: [
    { name: "title", label: "Service name", required: true },
    { name: "description", label: "Description", kind: "textarea", required: true },
    { name: "priceLabel", label: "Pricing label" },
    { name: "sortOrder", label: "Display order", kind: "number" },
    { name: "isPublished", label: "Published", kind: "checkbox" },
  ],
  settings: [
    { name: "heroTitle", label: "Hero title", required: true },
    { name: "heroSubtitle", label: "Hero subtitle", required: true },
    { name: "showreelUrl", label: "Showreel URL", kind: "url" },
    { name: "aboutText", label: "About text", kind: "textarea", required: true },
    { name: "profilePhotoUrl", label: "Profile photo", kind: "upload", uploadKind: "image" },
    { name: "cvUrl", label: "CV document", kind: "upload", uploadKind: "document" },
    { name: "contactEmail", label: "Contact email", kind: "email", required: true },
    { name: "whatsApp", label: "WhatsApp number" },
    { name: "telegram", label: "Telegram handle or link" },
    { name: "instagramUrl", label: "Instagram URL", kind: "url" },
    { name: "youTubeUrl", label: "YouTube URL", kind: "url" },
    { name: "tikTokUrl", label: "TikTok URL", kind: "url" },
    { name: "linkedInUrl", label: "LinkedIn URL", kind: "url" },
    { name: "behanceUrl", label: "Behance URL", kind: "url" },
    { name: "location", label: "Location", required: true },
    { name: "seoTitle", label: "SEO title", required: true },
    { name: "seoDescription", label: "SEO description", kind: "textarea", required: true },
  ],
};

const optionalText = z.string().trim().max(2000).or(z.literal("")).nullable().optional();
const optionalUrl = z.string().trim().max(2000).refine((value) => {
  if (!value) return true;
  if (value.startsWith("/uploads/")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}, "Use an HTTPS URL or an uploaded file.").or(z.literal("")).nullable().optional();
const slug = z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words with hyphens.");
const videoUrl = z.string().url().max(2000).refine((value) => {
  const url = new URL(value);
  return url.protocol === "https:" &&
    (["youtube.com", "www.youtube.com", "youtu.be", "vimeo.com", "www.vimeo.com"].includes(url.hostname) ||
      url.pathname.toLowerCase().endsWith(".mp4"));
}, "Use a YouTube, Vimeo, or HTTPS MP4 link.");
const schemas = {
  projects: z.object({
    title: z.string().trim().min(1).max(160), slug: slug, description: z.string().trim().min(1).max(5000),
    client: optionalText, year: z.number().int().min(1900).max(2200), categoryId: z.number().int().positive(),
    videoUrl, thumbnailUrl: optionalUrl, beforeAfterUrl: optionalUrl, tools: optionalText,
    sortOrder: z.number().int().min(0), isFeatured: z.boolean(), isPublished: z.boolean(),
  }),
  categories: z.object({
    name: z.string().trim().min(1).max(80), slug: slug, sortOrder: z.number().int().min(0),
  }),
  testimonials: z.object({
    clientName: z.string().trim().min(1).max(160), clientTitle: optionalText, clientImageUrl: optionalUrl,
    quote: z.string().trim().min(1).max(2000), isPublished: z.boolean(), sortOrder: z.number().int().min(0),
  }),
  services: z.object({
    title: z.string().trim().min(1).max(160), description: z.string().trim().min(1).max(2000),
    priceLabel: optionalText, isPublished: z.boolean(), sortOrder: z.number().int().min(0),
  }),
  settings: z.object({
    heroTitle: z.string().trim().min(1).max(160), heroSubtitle: z.string().trim().min(1).max(200),
    showreelUrl: optionalUrl, aboutText: z.string().trim().min(1).max(10000),
    profilePhotoUrl: optionalUrl, cvUrl: optionalUrl, contactEmail: z.string().trim().email(),
    whatsApp: optionalText, telegram: optionalText, instagramUrl: optionalUrl, youTubeUrl: optionalUrl,
    tikTokUrl: optionalUrl, linkedInUrl: optionalUrl, behanceUrl: optionalUrl,
    location: z.string().trim().min(1).max(120), seoTitle: z.string().trim().min(1).max(200),
    seoDescription: z.string().trim().min(1).max(500),
  }),
};

const blankValues: Record<Exclude<Section, "messages">, Row> = {
  projects: {
    title: "", slug: "", description: "", client: "", year: new Date().getFullYear(), categoryId: 1,
    videoUrl: "", thumbnailUrl: "", beforeAfterUrl: "", tools: "", sortOrder: 0, isFeatured: false, isPublished: false,
  },
  categories: { name: "", slug: "", sortOrder: 0 },
  testimonials: { clientName: "", clientTitle: "", clientImageUrl: "", quote: "", sortOrder: 0, isPublished: false },
  services: { title: "", description: "", priceLabel: "", sortOrder: 0, isPublished: false },
  settings: {
    heroTitle: "Demsew Andarge", heroSubtitle: "Video Editor & Motion Storyteller", showreelUrl: "",
    aboutText: "", profilePhotoUrl: "", cvUrl: "", contactEmail: "", whatsApp: "", telegram: "",
    instagramUrl: "", youTubeUrl: "", tikTokUrl: "", linkedInUrl: "", behanceUrl: "",
    location: "Ethiopia", seoTitle: "Demsew Andarge — Video Editor", seoDescription: "",
  },
};

export function AdminSection({ section: rawSection }: { section: string }) {
  const section = rawSection as Section;
  const info = sectionInfo[section];
  const isMessages = section === "messages";
  const isSettings = section === "settings";
  const [rows, setRows] = useState<Row[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [editing, setEditing] = useState<Row | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [uploadingField, setUploadingField] = useState("");

  const loadRows = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      if (isSettings) {
        const settings = await adminFetch<Row>("settings");
        setRows([settings]);
      } else {
        const query = new URLSearchParams();
        if (isMessages) {
          query.set("page", String(page));
          query.set("pageSize", "10");
          if (search.trim()) query.set("search", search.trim());
        }
        const suffix = query.size ? `?${query.toString()}` : "";
        const items = await adminFetch<Row[]>(`${section}${suffix}`);
        setRows(items);
        setHasMore(isMessages && items.length === 10);
      }
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setLoading(false);
    }
  }, [isMessages, isSettings, page, search, section]);

  useEffect(() => {
    const timer = window.setTimeout(() => { void loadRows(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadRows]);
  useEffect(() => {
    if (section !== "projects") return;
    adminFetch<CategoryOption[]>("categories").then(setCategoryOptions).catch((reason: unknown) => setError(errorMessage(reason)));
  }, [section]);

  const visibleRows = useMemo(() => {
    if (isMessages || isSettings || !search.trim()) return rows;
    const term = search.trim().toLowerCase();
    return rows.filter((row) => Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(term)));
  }, [isMessages, isSettings, rows, search]);

  function beginCreate() {
    setNotice("");
    setEditing({ ...blankValues[section as Exclude<Section, "messages">] });
  }

  function beginEdit(row: Row) {
    setNotice("");
    setEditing({ ...row });
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing || isMessages) return;
    const form = new FormData(event.currentTarget);
    const values: Record<string, unknown> = {};
    for (const field of fields[section as Exclude<Section, "messages">]) {
      if (field.kind === "checkbox") {
        values[field.name] = form.get(field.name) === "on";
      } else {
        const value = String(form.get(field.name) ?? "").trim();
        if (field.kind === "number") values[field.name] = Number(value);
        else values[field.name] = value || null;
      }
    }

    const schema = schemas[section as keyof typeof schemas];
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the highlighted form details.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const id = editing.id;
      const path = isSettings ? "settings" : id ? `${section}/${id}` : section;
      await adminFetch(path, {
        method: isSettings ? "PUT" : id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      setEditing(null);
      setNotice(`${info.singular[0]?.toUpperCase()}${info.singular.slice(1)} saved.`);
      await loadRows();
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setSaving(false);
    }
  }

  async function remove(row: Row) {
    const identity = String(row.title ?? row.name ?? row.clientName ?? "this item");
    if (!window.confirm(`Delete ${identity}? This cannot be undone.`)) return;
    try {
      await adminFetch(`${section}/${row.id}`, { method: "DELETE" });
      setNotice("Item deleted.");
      await loadRows();
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }

  async function toggleRead(row: Row) {
    try {
      await adminFetch(`messages/${row.id}/read?read=${!row.isRead}`, { method: "PUT" });
      await loadRows();
    } catch (reason) {
      setError(errorMessage(reason));
    }
  }

  async function reorder(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) return;
    await moveProject(dragIndex, targetIndex);
  }

  async function moveProject(sourceIndex: number, targetIndex: number) {
    if (targetIndex < 0 || targetIndex >= rows.length || sourceIndex === targetIndex) return;
    const reordered = [...rows];
    const [moved] = reordered.splice(sourceIndex, 1);
    if (!moved) return;
    reordered.splice(targetIndex, 0, moved);
    setRows(reordered);
    setDragIndex(null);
    try {
      await adminFetch("projects/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reordered.map((row) => row.id)),
      });
      setNotice("Project order saved.");
    } catch (reason) {
      setError(errorMessage(reason));
      await loadRows();
    }
  }

  async function uploadFile(field: Field, file: File) {
    setError("");
    setUploadingField(field.name);
    try {
      const { prepareUpload } = await import("@/lib/compress-image");
      const prepared = await prepareUpload(file);
      const body = new FormData();
      body.append("file", prepared);
      const result = await adminFetch<{ url: string }>(
        `uploads?folder=${field.uploadKind === "document" ? "documents" : "images"}`,
        { method: "POST", body },
      );
      setEditing((current) => current ? { ...current, [field.name]: result.url } : current);
      setNotice("File uploaded successfully.");
    } catch (reason) {
      setError(errorMessage(reason));
    } finally {
      setUploadingField("");
    }
  }

  if (!info) return <div className="notice notice-error">Unknown admin section.</div>;

  const tableColumns = isMessages
    ? ["name", "subject", "email", "createdAtUtc", "isRead"]
    : section === "projects"
      ? ["title", "categoryName", "client", "year", "isPublished"]
      : section === "categories"
        ? ["name", "slug", "sortOrder"]
        : section === "testimonials"
          ? ["clientName", "clientTitle", "quote", "isPublished"]
          : ["title", "priceLabel", "isPublished", "sortOrder"];

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">{info.eyebrow}</p><h1>{info.title}<span className="accent-dot">.</span></h1>
          <p className="page-description">{section === "settings" ? "Manage the details that shape your public profile." : `Manage, organize, and publish your ${info.title.toLowerCase()}.`}</p>
        </div>
        {!isMessages && !isSettings && <button className="button button-primary" onClick={beginCreate}><Plus size={17} /> Add {info.singular}</button>}
        {isSettings && <button className="button button-primary" onClick={() => beginEdit(rows[0] ?? blankValues.settings)}><Pencil size={16} /> Edit settings</button>}
        {isMessages && <button className="button button-secondary" onClick={() => {
          const link = document.createElement("a");
          link.href = "/api/admin/messages/export";
          link.download = "portfolio-messages.csv";
          link.click();
        }}><Download size={16} /> Export CSV</button>}
      </div>

      {notice && <div className="notice notice-success" role="status"><Check size={16} /> {notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15} /></button></div>}
      {error && <div className="notice notice-error" role="alert">{error}<button onClick={() => setError("")} aria-label="Dismiss"><X size={15} /></button></div>}

      {isSettings && !loading && rows[0] && (
        <section className="settings-summary panel">
          <span className="settings-monogram">DA</span>
          <div><p className="eyebrow">CURRENT PROFILE</p><h2>{String(rows[0].heroTitle)}</h2><p>{String(rows[0].heroSubtitle)}</p></div>
          <span className="status-pill status-live"><span /> Public profile</span>
        </section>
      )}

      <section className="panel content-panel">
        <div className="table-toolbar">
          <div><h2>{isMessages ? "All inquiries" : isSettings ? "Profile details" : `${info.title} list`}</h2>
            {!isSettings && <span className="table-count">{rows.length} {isMessages ? "on this page" : "items"}</span>}
          </div>
          {!isSettings && <label className="search-box"><Search size={16} /><input aria-label={`Search ${info.title}`} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder={`Search ${info.title.toLowerCase()}…`} /></label>}
        </div>

        {loading ? <div className="table-loading"><span className="loader" /> Loading {info.title.toLowerCase()}…</div> :
          isSettings ? <SettingsPreview row={rows[0]} onEdit={() => beginEdit(rows[0] ?? blankValues.settings)} /> :
          <div className="table-scroll"><table className="admin-table">
            <thead><tr>{section === "projects" && <th className="drag-column" aria-label="Reorder" />} {tableColumns.map((column) => <th key={column}>{columnLabel(column)}</th>)}<th className="actions-column">Actions</th></tr></thead>
            <tbody>
              {visibleRows.map((row) => {
                const originalIndex = rows.findIndex((item) => item.id === row.id);
                return <tr key={Number(row.id)} draggable={section === "projects" && !search.trim()}
                  onDragStart={() => setDragIndex(originalIndex)} onDragOver={(event) => event.preventDefault()}
                  onDrop={() => void reorder(originalIndex)} className={section === "projects" ? "draggable-row" : ""}>
                  {section === "projects" && <td className="drag-cell"><GripVertical size={16} aria-label="Drag to reorder" /></td>}
                  {tableColumns.map((column) => <td key={column}>{renderCell(column, row[column])}</td>)}
                  <td className="row-actions">
                    {isMessages ? <>
                      <a className="icon-button" href={`mailto:${encodeURIComponent(String(row.email ?? ""))}?subject=${encodeURIComponent(`Re: ${String(row.subject ?? "Your inquiry")}`)}`} title="Reply by email"><Mail size={15} /></a>
                      <button className="icon-button" onClick={() => void toggleRead(row)} title={row.isRead ? "Mark unread" : "Mark read"}>{row.isRead ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                      <button className="icon-button danger-icon" onClick={() => void remove(row)} title="Delete message"><Trash2 size={15} /></button>
                    </> : <>
                      {section === "projects" && <button className="icon-button reorder-button" onClick={() => void moveProject(originalIndex, originalIndex - 1)} disabled={originalIndex === 0 || Boolean(search.trim())} title="Move up"><ArrowUp size={15} /></button>}
                      {section === "projects" && <button className="icon-button reorder-button" onClick={() => void moveProject(originalIndex, originalIndex + 1)} disabled={originalIndex === rows.length - 1 || Boolean(search.trim())} title="Move down"><ArrowDown size={15} /></button>}
                      <button className="icon-button" onClick={() => beginEdit(row)} title={`Edit ${info.singular}`}><Pencil size={15} /></button>
                      <button className="icon-button danger-icon" onClick={() => void remove(row)} title={`Delete ${info.singular}`}><Trash2 size={15} /></button>
                    </>}
                  </td>
                </tr>;
              })}
              {visibleRows.length === 0 && <tr><td colSpan={tableColumns.length + 2} className="table-empty">{search ? "No matching items found." : `No ${info.title.toLowerCase()} yet. Add your first ${info.singular}.`}</td></tr>}
            </tbody>
          </table></div>}

        {isMessages && <div className="pagination"><span>Page {page}</span><div>
          <button className="button button-secondary button-small" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={page === 1}><ArrowLeft size={14} /> Previous</button>
          <button className="button button-secondary button-small" onClick={() => setPage((value) => value + 1)} disabled={!hasMore}>Next <ArrowRight size={14} /></button>
        </div></div>}
      </section>

      {editing && !isMessages && (
        <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditing(null); }}>
          <section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title">
            <header className="editor-header"><div><p className="eyebrow">{isSettings ? "YOUR PUBLIC PROFILE" : editing.id ? "EDIT ITEM" : "NEW ITEM"}</p><h2 id="editor-title">{isSettings ? "Edit site settings" : `${editing.id ? "Edit" : "Add"} ${info.singular}`}</h2></div><button className="icon-button" onClick={() => setEditing(null)} aria-label="Close editor"><X size={18} /></button></header>
            <form className="editor-form" onSubmit={save}>
              <div className="form-grid">{fields[section as Exclude<Section, "messages">].map((field) => (
                <FormField key={field.name} field={field} value={editing[field.name]}
                  options={field.name === "categoryId" ? categoryOptions : undefined}
                  uploading={uploadingField === field.name}
                  onValueChange={(value) => setEditing((current) => current ? { ...current, [field.name]: value } : current)}
                  onFile={(file) => void uploadFile(field, file)} />
              ))}</div>
              {error && <div className="notice notice-error" role="alert">{error}</div>}
              <footer className="editor-footer"><button type="button" className="button button-secondary" onClick={() => setEditing(null)}>Cancel</button>
                <button className="button button-primary" type="submit" disabled={saving}>{saving ? <><span className="loader loader-small" /> Saving…</> : <><Check size={16} /> Save changes</>}</button></footer>
            </form>
          </section>
        </div>
      )}
    </>
  );
}

function FormField({ field, value, options, uploading, onValueChange, onFile }: {
  field: Field;
  value: Row[string] | undefined;
  options?: CategoryOption[];
  uploading: boolean;
  onValueChange: (value: string | number | boolean | null) => void;
  onFile: (file: File) => void;
}) {
  const wide = field.kind === "textarea";
  if (field.kind === "checkbox") {
    return <label className="toggle-field"><input type="checkbox" name={field.name} checked={value === true} onChange={(event) => onValueChange(event.target.checked)} /><span className="toggle-copy"><strong>{field.label}</strong><small>{field.hint ?? "Enable this option."}</small></span></label>;
  }
  if (field.kind === "upload") {
    const current = typeof value === "string" ? value : "";
    const isImage = field.uploadKind === "image";
    const previewUrl = isSafePreviewUrl(current) ? current : "";
    return <div className={`form-field ${wide ? "field-wide" : ""}`}>
      <span>{field.label}</span>
      <div className="upload-control">
        {isImage && previewUrl && <div className="upload-preview" role="img" aria-label={`${field.label} preview`} style={{ backgroundImage: `url("${previewUrl}")` }} />}
        {!isImage && previewUrl && <a className="uploaded-file-link" href={previewUrl} target="_blank" rel="noreferrer">Open current CV ↗</a>}
        <label className="button button-secondary upload-button">
          {uploading ? <><span className="loader loader-small" /> Preparing…</> : <>Choose {isImage ? "image" : "PDF"}</>}
          <input type="file" accept={isImage ? "image/jpeg,image/png,image/webp" : "application/pdf"} disabled={uploading} onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFile(file);
            event.currentTarget.value = "";
          }} />
        </label>
      </div>
      <input className="upload-url-input" aria-label={`${field.label} URL`} name={field.name} value={current} onChange={(event) => onValueChange(event.target.value || null)} placeholder="Upload a file or paste its HTTPS URL" />
      <small>JPG, PNG, WebP, or PDF · Maximum 10 MB. Images are compressed before upload.</small>
    </div>;
  }
  return <label className={`form-field ${wide ? "field-wide" : ""}`}><span>{field.label}{field.required && <i> *</i>}</span>
    {field.kind === "textarea" ?
      <textarea name={field.name} value={String(value ?? "")} onChange={(event) => onValueChange(event.target.value || null)} required={field.required} rows={4} /> :
      field.kind === "select" ?
        <select name={field.name} value={String(value ?? options?.[0]?.id ?? "")} onChange={(event) => onValueChange(Number(event.target.value))} required={field.required}>
          {(options ?? []).map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}
        </select> :
        <input name={field.name} type={field.kind ?? "text"} value={String(value ?? "")} onChange={(event) => onValueChange(field.kind === "number" ? Number(event.target.value) : event.target.value || null)} required={field.required}
          min={field.kind === "number" ? 0 : undefined} />}
    {field.hint && <small>{field.hint}</small>}
  </label>;
}

function SettingsPreview({ row, onEdit }: { row?: Row; onEdit: () => void }) {
  if (!row) return <p className="empty-state">Settings have not been initialized.</p>;
  return <div className="settings-preview">
    <div className="settings-preview-row"><span>Hero headline</span><strong>{String(row.heroTitle ?? "—")}</strong></div>
    <div className="settings-preview-row"><span>Contact email</span><strong>{String(row.contactEmail ?? "—")}</strong></div>
    <div className="settings-preview-row"><span>Location</span><strong>{String(row.location ?? "—")}</strong></div>
    <div className="settings-preview-row"><span>Search description</span><strong>{String(row.seoDescription ?? "—")}</strong></div>
    <button className="text-link" onClick={onEdit}><Pencil size={15} /> Edit all details</button>
  </div>;
}

function columnLabel(value: string) {
  return value.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase());
}

function isSafePreviewUrl(value: string) {
  if (value.startsWith("/uploads/")) return true;
  try { return new URL(value).protocol === "https:"; } catch { return false; }
}

function renderCell(column: string, value: Row[string] | undefined) {
  if (column === "isPublished" || column === "isRead") {
    const active = value === true;
    return <span className={`status-pill ${active ? "status-live" : "status-draft"}`}><span />{column === "isRead" ? active ? "Read" : "Unread" : active ? "Published" : "Draft"}</span>;
  }
  if (column === "createdAtUtc" && typeof value === "string") return <time>{new Date(value).toLocaleDateString()}</time>;
  if (column === "quote" || column === "description") return <span className="cell-truncate">{String(value ?? "—")}</span>;
  if (column === "title" && typeof value === "string") return <strong>{value}</strong>;
  return String(value ?? "—");
}
