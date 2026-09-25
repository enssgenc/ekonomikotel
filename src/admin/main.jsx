import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  useBlocker,
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  SquaresFour,
  Bed,
  SuitcaseRolling,
  Images,
  ClockCounterClockwise,
  Gear,
  ArrowUpRight,
  SignOut,
  Plus,
  MagnifyingGlass,
  CaretLeft,
  CaretRight,
  X,
  UploadSimple,
  CheckCircle,
  WarningCircle,
  FloppyDisk,
  Globe,
  NotePencil,
  Archive,
  ArrowUp,
  ArrowDown,
  Trash,
  Eye,
  DownloadSimple,
  List,
  LockKey,
  Image as ImageIcon,
} from "@phosphor-icons/react";
import { api, setCsrf } from "./api.js";
import "./styles.css";

let hasUnsavedChanges = false;
const statusNames = {
  published: "Yayında",
  draft: "Taslak",
  archived: "Arşivde",
};
const kindNames = { hotel: "Otel", tour: "Tur" };
const dateText = (value) =>
  new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
const slugify = (value) =>
  value
    .toLocaleLowerCase("tr")
    .replaceAll("ı", "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 120);
const actionName = (value) =>
  value.startsWith("content.create")
    ? "İçerik oluşturuldu"
    : value.startsWith("content.update")
      ? "İçerik güncellendi"
      : {
          "media.upload": "Görsel yüklendi",
          "auth.login": "Yönetici girişi",
          "auth.failed": "Başarısız giriş",
          "account.create": "Hesap oluşturuldu",
          "account.update": "Hesap güncellendi",
          "catalog.import": "Katalog içe aktarıldı",
        }[value] || value;
function useData(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    api(path, { signal: controller.signal })
      .then((value) => {
        if (controller.signal.aborted) return;
        if (
          (path.startsWith("/media") ||
            path.startsWith("/content?") ||
            path.startsWith("/audit")) &&
          !Array.isArray(value.items)
        )
          throw new Error("Liste yanıtı okunamadı. Sayfayı yenileyin.");
        setData(value);
        setLoading(false);
      })
      .catch((e) => {
        if (e.name !== "AbortError") {
          setError(e.message);
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [path, revision]);
  return { data, error, loading, reload: () => setRevision((v) => v + 1) };
}
function Status({ status }) {
  return (
    <span className={`a-status ${status}`}>
      <i />
      {statusNames[status]}
    </span>
  );
}
function Button({ children, secondary = false, danger = false, ...props }) {
  return (
    <button
      type="button"
      className={`a-btn ${secondary ? "secondary" : ""} ${danger ? "danger" : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
function ErrorBox({ error }) {
  return error ? (
    <div className="a-error" role="alert">
      <WarningCircle size={21} />
      <div>
        {typeof error === "string" ? error : error.message}
        {error.fields?.length > 0 && (
          <ul>
            {error.fields.map((e, i) => (
              <li key={i}>
                {e.field}: {e.message}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  ) : null;
}
function Loading() {
  return (
    <div className="a-loading" role="status">
      <span />
      Yükleniyor…
    </div>
  );
}
function Empty({ title, copy, children }) {
  return (
    <div className="a-empty">
      <NotePencil size={38} />
      <h2>{title}</h2>
      <p>{copy}</p>
      {children}
    </div>
  );
}
function PageHeader({ eyebrow = "YÖNETİM PANELİ", title, copy, children }) {
  return (
    <div className="a-page-head">
      <div>
        <span className="a-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        {copy && <p>{copy}</p>}
      </div>
      <div className="a-head-actions">{children}</div>
    </div>
  );
}
function Pagination({ data, setPage }) {
  return data && data.pages > 1 ? (
    <div className="a-pagination">
      <span>
        {data.total} kayıt · {data.page} / {data.pages}
      </span>
      <div>
        <Button
          secondary
          aria-label="Önceki sayfa"
          disabled={data.page <= 1}
          onClick={() => setPage(data.page - 1)}
        >
          <CaretLeft />
        </Button>
        <Button
          secondary
          aria-label="Sonraki sayfa"
          disabled={data.page >= data.pages}
          onClick={() => setPage(data.page + 1)}
        >
          <CaretRight />
        </Button>
      </div>
    </div>
  ) : null;
}
function Field({
  label,
  hint,
  type = "text",
  value,
  onChange,
  textarea = false,
  children,
  ...props
}) {
  const change = (e) =>
    onChange(type === "number" ? Number(e.target.value) : e.target.value);
  return (
    <label className={`a-field ${textarea ? "wide" : ""}`}>
      <span>{label}</span>
      {children ||
        (textarea ? (
          <textarea value={value ?? ""} onChange={change} rows={5} {...props} />
        ) : (
          <input
            type={type}
            value={value ?? ""}
            onChange={change}
            onInput={type === "date" ? change : undefined}
            {...props}
          />
        ))}
      {hint && <small>{hint}</small>}
    </label>
  );
}
function Section({ title, copy, children, action }) {
  return (
    <section className="a-section">
      <div className="a-section-head">
        <div>
          <h2>{title}</h2>
          {copy && <p>{copy}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Login({ onLogin }) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const value = await api("/login", {
        method: "POST",
        body: { username, password },
      });
      setPassword("");
      onLogin(value);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="a-login">
      <div className="a-login-story">
        <a href="/" className="a-brand">
          ekonomik<span>otel.</span>
        </a>
        <div>
          <span className="a-eyebrow">HER GÜZEL TATİLİN ARKASINDA</span>
          <h1>
            İyi hazırlanmış
            <br />
            bir hikâye var.
          </h1>
          <p>
            Otellerinizi, turlarınızı ve yeni yolculukları
            <br />
            tek bir yerden yönetin.
          </p>
        </div>
        <img
          src="/media/packages/kapadokya/kapadokya-3-gece-kapak-v2.webp"
          alt="Kapadokya manzarası"
        />
      </div>
      <main className="a-login-form">
        <a href="/" className="a-back-link">
          <CaretLeft />
          Siteye dön
        </a>
        <div className="a-login-inner">
          <div className="a-login-icon">
            <LockKey size={28} />
          </div>
          <span className="a-eyebrow">EKONOMİKOTEL YÖNETİM</span>
          <h2>Tekrar hoş geldiniz.</h2>
          <p>İçeriklerinizi yönetmek için giriş yapın.</p>
          <form onSubmit={submit}>
            <Field
              label="Kullanıcı adı"
              value={username}
              onChange={setUsername}
              autoComplete="username"
              required
              autoFocus
            />
            <Field
              label="Şifre"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete="current-password"
              required
            />
            <ErrorBox error={error} />
            <Button type="submit" disabled={busy}>
              {busy ? "Giriş yapılıyor…" : "Panele giriş yap"}
              <ArrowUpRight />
            </Button>
          </form>
          <small>
            Yalnızca yetkili yönetici erişimi. Oturum süresi 12 saattir.
          </small>
        </div>
      </main>
    </div>
  );
}
function Dashboard() {
  const { data, error, loading } = useData("/dashboard");
  if (loading) return <Loading />;
  if (error) return <ErrorBox error={error} />;
  const count = (kind, status) =>
    data.counts
      .filter(
        (c) => (!kind || c.kind === kind) && (!status || c.status === status),
      )
      .reduce((n, c) => n + c.count, 0);
  return (
    <>
      <PageHeader
        title="Yeni yolculuklar burada başlar."
        copy="Kataloğunuzun son durumunu görün, bir sonraki içeriğinizi hazırlayın."
      >
        <Link className="a-btn secondary" to="/admin/yeni/tour">
          <Plus />
          Tur ekle
        </Link>
        <Link className="a-btn" to="/admin/yeni/hotel">
          <Plus />
          Otel ekle
        </Link>
      </PageHeader>
      <div className="a-stats">
        {[
          [
            Bed,
            "Oteller",
            count("hotel"),
            `${count("hotel", "published")} yayında`,
            "/admin/oteller",
          ],
          [
            SuitcaseRolling,
            "Turlar",
            count("tour"),
            `${count("tour", "published")} yayında`,
            "/admin/turlar",
          ],
          [
            NotePencil,
            "Taslaklar",
            count(null, "draft"),
            "Yayınlanmayı bekliyor",
            "/admin/oteller",
          ],
          [
            Images,
            "Görseller",
            data.media,
            "Kütüphanenizde",
            "/admin/gorseller",
          ],
        ].map(([Icon, label, value, note, to]) => (
          <Link key={label} to={to} className="a-stat">
            <div>
              <span>{label}</span>
              <Icon size={22} />
            </div>
            <strong>{value}</strong>
            <small>{note}</small>
          </Link>
        ))}
      </div>
      <div className="a-dashboard-grid">
        <Section
          title="Son düzenlenen içerikler"
          copy="Kaldığınız yerden devam edin."
        >
          <div className="a-recent-list">
            {data.recent.map((r) => (
              <Link to={`/admin/icerik/${r.id}`} key={r.id}>
                <div className="a-item-icon">
                  {r.kind === "hotel" ? <Bed /> : <SuitcaseRolling />}
                </div>
                <div>
                  <strong>{r.title}</strong>
                  <small>
                    {kindNames[r.kind]} · {dateText(r.updated_at)}
                  </small>
                </div>
                <Status status={r.status} />
                <CaretRight />
              </Link>
            ))}
          </div>
        </Section>
        <aside className="a-publishing-guide">
          <span className="a-eyebrow">İÇERİKTEN YAYINA</span>
          <h2>
            İyi bir sayfa,
            <br />
            eksiksiz bir başlangıç.
          </h2>
          <ol>
            <li>
              <b>01</b>
              <div>
                <strong>Bilgileri hazırlayın</strong>
                <p>Konum, açıklama ve hizmetleri ekleyin.</p>
              </div>
            </li>
            <li>
              <b>02</b>
              <div>
                <strong>Görselleri seçin</strong>
                <p>Kapak ve galerinin sırasını belirleyin.</p>
              </div>
            </li>
            <li>
              <b>03</b>
              <div>
                <strong>Kontrol edip yayınlayın</strong>
                <p>Önizlemeyi açın, durumunu Yayında yapıp kaydedin.</p>
              </div>
            </li>
          </ol>
          <div>
            <Globe size={19} />
            Taslaklar ziyaretçilere gösterilmez.
          </div>
        </aside>
      </div>
    </>
  );
}
function ContentList({ kind }) {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1);
  const { data, error, loading } = useData(
    `/content?kind=${kind}&status=${status}&q=${encodeURIComponent(q)}&page=${page}`,
  );
  return (
    <>
      <PageHeader
        title={kind === "hotel" ? "Oteller" : "Turlar"}
        copy={
          kind === "hotel"
            ? "Konaklama bilgileri, oda tipleri, olanaklar ve görseller."
            : "Tur programları, rotalar, hizmetler ve yayın durumları."
        }
      >
        <Link className="a-btn" to={`/admin/yeni/${kind}`}>
          <Plus />
          {kindNames[kind]} ekle
        </Link>
      </PageHeader>
      <div className="a-list-controls">
        <label className="a-search">
          <MagnifyingGlass />
          <input
            aria-label={`${kindNames[kind]} ara`}
            placeholder="Ad veya sayfa adresiyle ara…"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <select
          aria-label="Yayın durumu filtresi"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(statusNames).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
        {data && <span>{data.total} kayıt</span>}
      </div>
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : data?.items.length ? (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>{kindNames[kind]} adı</th>
                <th>Durum</th>
                <th className="a-hide-mobile">Son güncelleme</th>
                <th>
                  <span className="a-sr">İşlem</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <Link
                      className="a-content-link"
                      to={`/admin/icerik/${r.id}`}
                    >
                      {r.img ? (
                        <img src={r.img} alt="" />
                      ) : (
                        <span className="a-thumbnail-empty">
                          <ImageIcon />
                        </span>
                      )}
                      <span>
                        <strong>{r.title}</strong>
                        <small>
                          {r.city || "Konum eklenmemiş"}
                          {r.featured ? " · Ana sayfada" : ""}
                        </small>
                      </span>
                    </Link>
                  </td>
                  <td>
                    <Status status={r.status} />
                  </td>
                  <td className="a-hide-mobile a-muted">
                    {dateText(r.updatedAt)}
                  </td>
                  <td>
                    <Link
                      className="a-icon-btn"
                      aria-label={`${r.title} düzenle`}
                      to={`/admin/icerik/${r.id}`}
                    >
                      <NotePencil />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination data={data} setPage={setPage} />
        </div>
      ) : (
        <Empty
          title="Eşleşen içerik bulunamadı."
          copy="Arama veya durum filtresini değiştirebilir, yeni içerik oluşturabilirsiniz."
        />
      )}
    </>
  );
}
function UploadButton({ onUploaded }) {
  const ref = useRef(null),
    [busy, setBusy] = useState(false),
    [progress, setProgress] = useState(""),
    [error, setError] = useState("");
  async function upload(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 12 * 1024 * 1024)
          throw new Error(`${file.name}: en fazla 12 MB yükleyebilirsiniz.`);
        setProgress(`${i + 1} / ${files.length}`);
        const result = await api("/media", {
          method: "POST",
          raw: true,
          headers: {
            "Content-Type": file.type,
            "X-File-Name": encodeURIComponent(file.name),
          },
          body: file,
        });
        onUploaded(result);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      setProgress("");
    }
  }
  return (
    <div className="a-upload-control">
      <input
        ref={ref}
        className="a-sr"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp"
        onChange={upload}
        aria-label="Görsel dosyaları seç"
      />
      <Button disabled={busy} onClick={() => ref.current.click()}>
        <UploadSimple />
        {busy ? `Yükleniyor ${progress}` : "Görsel yükle"}
      </Button>
      <ErrorBox error={error} />
    </div>
  );
}
function MediaGrid({ picker = false, selected = [], onSelect, revision = 0 }) {
  const [q, setQ] = useState(""),
    [page, setPage] = useState(1),
    [detail, setDetail] = useState(null);
  const { data, error, loading, reload } = useData(
    `/media?q=${encodeURIComponent(q)}&page=${page}&revision=${revision}`,
  );
  return (
    <>
      <label className="a-search">
        <MagnifyingGlass />
        <input
          aria-label="Kütüphanede görsel ara"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Otel, tur veya dosya adı…"
        />
      </label>
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="a-media-grid">
            {data?.items?.map((item) => (
              <button
                type="button"
                className={`a-media-item ${selected.includes(item.path) ? "selected" : ""}`}
                key={item.id}
                aria-label={item.name}
                aria-pressed={picker ? selected.includes(item.path) : undefined}
                onClick={() => (picker ? onSelect(item.path) : setDetail(item))}
              >
                <img src={item.path} alt="" loading="lazy" />
                {selected.includes(item.path) && (
                  <CheckCircle className="a-media-selected" weight="fill" />
                )}
                <span>{item.name}</span>
                <small>
                  {item.source === "import"
                    ? "Aktarılan görsel"
                    : `${item.width} × ${item.height}`}
                </small>
              </button>
            ))}
          </div>
          {!data?.items?.length && (
            <Empty
              title="Görsel bulunamadı."
              copy="Aramayı değiştirebilir veya yeni görsel yükleyebilirsiniz."
            />
          )}
          <Pagination data={data} setPage={setPage} />
        </>
      )}
      {detail && (
        <Modal title="Görsel bilgileri" close={() => setDetail(null)}>
          <img
            className="a-media-preview"
            src={detail.path}
            alt={detail.name}
          />
          <h3>{detail.name}</h3>
          <p className="a-muted">
            {detail.width
              ? `${detail.width} × ${detail.height} · ${Math.round(detail.bytes / 1024)} KB`
              : "Kaynak katalogdan aktarıldı."}
          </p>
          <a
            className="a-btn secondary"
            href={detail.path}
            target="_blank"
            rel="noreferrer"
          >
            Görseli aç
            <ArrowUpRight />
          </a>
        </Modal>
      )}
    </>
  );
}
function Modal({ title, close, children, footer }) {
  const ref = useRef(null);
  useEffect(() => {
    ref.current.showModal();
    document.body.classList.add("a-modal-open");
    return () => document.body.classList.remove("a-modal-open");
  }, []);
  return (
    <dialog
      ref={ref}
      className="a-modal"
      aria-label={title}
      onCancel={(e) => {
        e.preventDefault();
        close();
      }}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <div className="a-modal-head">
        <h2>{title}</h2>
        <button
          type="button"
          className="a-icon-btn"
          aria-label="Pencereyi kapat"
          onClick={close}
        >
          <X />
        </button>
      </div>
      <div className="a-modal-body">{children}</div>
      {footer && <div className="a-modal-footer">{footer}</div>}
    </dialog>
  );
}
function MediaPicker({ initial, onDone, close }) {
  const [selected, setSelected] = useState(initial),
    [revision, setRevision] = useState(0);
  return (
    <Modal
      title="Görsel kütüphanesi"
      close={close}
      footer={
        <>
          <span>{selected.length} / 60 görsel seçildi</span>
          <Button onClick={() => onDone(selected)}>
            Seçilenleri kullan
            <CheckCircle />
          </Button>
        </>
      }
    >
      <div className="a-modal-tools">
        <p>JPG, PNG veya WebP · en fazla 12 MB / dosya</p>
        <UploadButton
          onUploaded={(image) => {
            setSelected((s) => (s.length < 60 ? [...s, image.path] : s));
            setRevision((v) => v + 1);
          }}
        />
      </div>
      <MediaGrid
        picker
        selected={selected}
        revision={revision}
        onSelect={(path) =>
          setSelected((s) =>
            s.includes(path)
              ? s.filter((p) => p !== path)
              : s.length < 60
                ? [...s, path]
                : s,
          )
        }
      />
    </Modal>
  );
}
function MediaPage() {
  const [revision, setRevision] = useState(0);
  return (
    <>
      <PageHeader
        title="Görsel kütüphanesi"
        copy="Yüklediğiniz görselleri otel ve tur sayfalarında tekrar kullanın."
      >
        <UploadButton onUploaded={() => setRevision((v) => v + 1)} />
      </PageHeader>
      <div className="a-info">
        <ImageIcon />
        JPG, PNG ve WebP yükleyebilirsiniz. Görseller site için otomatik
        optimize edilir. En fazla 12 MB / dosya.
      </div>
      <MediaGrid revision={revision} />
    </>
  );
}
function StringList({ label, value, onChange, hint }) {
  return (
    <Field
      label={label}
      textarea
      hint={hint || "Her maddeyi ayrı satıra yazın."}
      value={value.join("\n")}
      onChange={(s) => onChange(s.split("\n"))}
    />
  );
}
function move(items, index, direction) {
  const next = [...items],
    target = index + direction;
  if (target < 0 || target >= next.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
function ArrayActions({ index, length, onMove, onRemove, label }) {
  return (
    <div className="a-array-actions">
      <button
        type="button"
        className="a-icon-btn"
        disabled={!index}
        aria-label={`${label} yukarı taşı`}
        onClick={() => onMove(-1)}
      >
        <ArrowUp />
      </button>
      <button
        type="button"
        className="a-icon-btn"
        disabled={index === length - 1}
        aria-label={`${label} aşağı taşı`}
        onClick={() => onMove(1)}
      >
        <ArrowDown />
      </button>
      <button
        type="button"
        className="a-icon-btn danger"
        aria-label={`${label} kaldır`}
        onClick={onRemove}
      >
        <Trash />
      </button>
    </div>
  );
}
const fresh = (kind) => ({
  id: null,
  kind,
  status: "draft",
  version: 0,
  data: {
    slug: "",
    name: "",
    title: "",
    city: "Nevşehir",
    district: "",
    concept: "",
    address: "",
    maps: "",
    blurb: "",
    longBlurb: "",
    shortDesc: "",
    hotelBlurb: "",
    category: "kapadokya-tatil",
    duration: "",
    transport: "",
    img: "",
    gallery: [],
    amenities: [],
    rooms: [],
    itinerary: [],
    includes: [],
    excludes: [],
    terms: [],
    tourRoutes: [],
    departureCity: "",
    departureDates: [],
    featured: false,
    priceMode: "request",
    fromPrice: 0,
    currency: "TRY",
    priceUnit: "",
    priceValidUntil: "",
    seoTitle: "",
    seoDescription: "",
    internalNotes: "",
  },
});
function Editor() {
  const { id, kind } = useParams(),
    navigate = useNavigate();
  const [record, setRecord] = useState(null),
    [baseline, setBaseline] = useState(""),
    [tab, setTab] = useState("general"),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [picker, setPicker] = useState(false),
    [slugTouched, setSlugTouched] = useState(false),
    [revisions, setRevisions] = useState([]);
  const { data: dashboard } = useData("/dashboard");
  useEffect(() => {
    let alive = true;
    setRecord(null);
    setError(null);
    setTab("general");
    setNotice("");
    if (id) {
      api(`/content/${id}`)
        .then((v) => {
          if (alive) {
            setRecord(v);
            setBaseline(JSON.stringify(v));
            setSlugTouched(true);
          }
        })
        .catch((e) => {
          if (alive) setError(e);
        });
    } else if (["hotel", "tour"].includes(kind)) {
      const v = fresh(kind);
      setRecord(v);
      setBaseline(JSON.stringify(v));
      setSlugTouched(false);
    } else setError(new Error("İçerik türü bulunamadı."));
    return () => {
      alive = false;
    };
  }, [id, kind]);
  const dirty = !!record && JSON.stringify(record) !== baseline;
  const navigatingAfterSave = useRef(false);
  const blocker = useBlocker(() => dirty && !navigatingAfterSave.current);
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    if (
      window.confirm(
        "Kaydedilmemiş değişiklikler var. Bu sayfadan ayrılmak istiyor musunuz?",
      )
    )
      blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  useEffect(() => {
    hasUnsavedChanges = dirty;
    if (!dirty) navigatingAfterSave.current = false;
    const before = (e) => {
      if (!dirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", before);
    return () => {
      hasUnsavedChanges = false;
      window.removeEventListener("beforeunload", before);
    };
  }, [dirty]);
  useEffect(() => {
    if (tab === "history" && id)
      api(`/content/${id}/revisions`)
        .then((v) => setRevisions(v.items))
        .catch(setError);
  }, [tab, id]);
  if (!record) return error ? <ErrorBox error={error} /> : <Loading />;
  const hotel = record.kind === "hotel",
    data = record.data,
    title = data.name || data.title || `Yeni ${hotel ? "otel" : "tur"}`;
  const field = (name, value) => {
    setNotice("");
    setRecord((r) => ({
      ...r,
      data: {
        ...r.data,
        [name]: value,
        ...((name === "name" || name === "title") && !id && !slugTouched
          ? { slug: slugify(value) }
          : {}),
      },
    }));
  };
  const changeItem = (key, index, patch) =>
    field(
      key,
      (data[key] || []).map((v, i) => (i === index ? { ...v, ...patch } : v)),
    );
  const editArray = (key, index, direction) =>
    field(
      key,
      direction === null
        ? data[key].filter((_, i) => i !== index)
        : move(data[key], index, direction),
    );
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice("");
    try {
      const value = await api(id ? `/content/${id}` : "/content", {
        method: id ? "PUT" : "POST",
        body: record,
      });
      setRecord(value);
      setBaseline(JSON.stringify(value));
      setNotice(
        value.status === "published"
          ? "İçerik kaydedildi ve sitede yayında."
          : value.status === "archived"
            ? "İçerik arşivlendi. Ziyaretçilere gösterilmiyor."
            : "Taslak kaydedildi. Ziyaretçilere gösterilmiyor.",
      );
      if (!id) {
        navigatingAfterSave.current = true;
        navigate(`/admin/icerik/${value.id}`, { replace: true });
      }
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  }
  const tabs = [
    ["general", "Genel bilgiler"],
    ["media", "Görseller"],
    [hotel ? "rooms" : "program", hotel ? "Oda tipleri" : "Tur programı"],
    ["services", hotel ? "Olanaklar" : "Hizmetler"],
    ...(!hotel ? [["terms", "Rotalar ve koşullar"]] : []),
    ["seo", "Fiyat ve SEO"],
    ["history", "Geçmiş"],
  ];
  const readiness = [
    ["Ad ve sayfa adresi", !!((data.name || data.title) && data.slug)],
    ["Konum", !!(data.city && (!hotel || data.district))],
    ["Kapak görseli", !!data.img],
    ["Açıklama", (hotel ? data.blurb : data.shortDesc)?.length >= 20],
    ...(!hotel
      ? [["Tur programı", !!(data.duration && data.itinerary?.length)]]
      : []),
  ];
  return (
    <form onSubmit={save} className="a-editor">
      <div className="a-editor-top">
        <Link
          className="a-back-link"
          to={`/admin/${hotel ? "oteller" : "turlar"}`}
        >
          <CaretLeft />
          {hotel ? "Otellere" : "Turlara"} dön
        </Link>
        <span className="a-save-state">
          {dirty
            ? "Kaydedilmemiş değişiklikler"
            : id
              ? `Son kayıt: ${dateText(record.updatedAt)}`
              : "Yeni içerik"}
        </span>
      </div>
      <PageHeader
        eyebrow={hotel ? "OTEL YÖNETİMİ" : "TUR YÖNETİMİ"}
        title={title}
      >
        <Status status={record.status} />
        {id && (
          <a
            href={`/${hotel ? "oteller" : "turlar"}/${data.slug}?onizleme=${id}`}
            className="a-btn secondary"
            target="_blank"
            rel="noreferrer"
          >
            <Eye />
            Kayıtlı önizleme
          </a>
        )}
      </PageHeader>
      <ErrorBox error={error} />
      {notice && (
        <div className="a-success" role="status">
          <CheckCircle />
          {notice}
        </div>
      )}
      <div className="a-editor-layout">
        <div className="a-editor-main">
          <nav className="a-editor-tabs" aria-label="Düzenleme bölümleri">
            {tabs.map(([key, label]) => (
              <button
                type="button"
                key={key}
                aria-pressed={tab === key}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="a-editor-body">
            {tab === "general" && (
              <>
                <Section
                  title="Temel bilgiler"
                  copy="Ziyaretçilerin göreceği bilgileri buradan düzenleyin."
                >
                  <div className="a-form-grid">
                    <Field
                      label={hotel ? "Otel adı" : "Tur adı"}
                      value={hotel ? data.name : data.title}
                      onChange={(v) => field(hotel ? "name" : "title", v)}
                      maxLength={180}
                      required
                    />
                    <Field
                      label="Sayfa adresi"
                      value={data.slug}
                      onChange={(v) => {
                        setSlugTouched(true);
                        field("slug", v);
                      }}
                      hint={`/${hotel ? "oteller" : "turlar"}/${data.slug || "sayfa-adresi"}`}
                      maxLength={120}
                      required
                    />
                    <Field
                      label="Şehir / destinasyon"
                      value={data.city}
                      onChange={(v) => field("city", v)}
                    />
                    {hotel ? (
                      <Field
                        label="Bölge / ilçe"
                        value={data.district}
                        onChange={(v) => field("district", v)}
                      />
                    ) : (
                      <Field
                        label="Süre"
                        value={data.duration}
                        onChange={(v) => field("duration", v)}
                        placeholder="Örn. 2 Gece 3 Gün"
                      />
                    )}
                    <Field
                      label="Konsept"
                      value={data.concept}
                      onChange={(v) => field("concept", v)}
                      placeholder={
                        hotel ? "Örn. Butik Otel" : "Örn. Konaklama + Kahvaltı"
                      }
                    />
                    {!hotel && (
                      <Field
                        label="Ulaşım"
                        value={data.transport}
                        onChange={(v) => field("transport", v)}
                        placeholder="Örn. Otobüs ile"
                      />
                    )}
                  </div>
                  <Field
                    label="Kısa açıklama"
                    textarea
                    value={hotel ? data.blurb : data.shortDesc}
                    onChange={(v) => field(hotel ? "blurb" : "shortDesc", v)}
                    hint="Yayınlamak için en az 20 karakter. Bilgileri gerçek hizmet kapsamıyla uyumlu tutun."
                  />
                  <Field
                    label={hotel ? "Detaylı açıklama" : "Konaklama açıklaması"}
                    textarea
                    rows={8}
                    value={hotel ? data.longBlurb : data.hotelBlurb}
                    onChange={(v) =>
                      field(hotel ? "longBlurb" : "hotelBlurb", v)
                    }
                  />
                </Section>
                {hotel ? (
                  <Section title="Konum">
                    <Field
                      label="Adres"
                      textarea
                      rows={3}
                      value={data.address}
                      onChange={(v) => field("address", v)}
                    />
                    <Field
                      label="Harita bağlantısı"
                      type="url"
                      value={data.maps}
                      onChange={(v) => field("maps", v)}
                      placeholder="https://www.google.com/maps/…"
                    />
                  </Section>
                ) : (
                  <Section title="Hareket bilgileri">
                    <div className="a-form-grid">
                      <Field
                        label="Hareket noktası"
                        value={data.departureCity}
                        onChange={(v) => field("departureCity", v)}
                      />
                      <Field
                        label="Kategori"
                        value={data.category}
                        onChange={(v) => field("category", v)}
                      />
                    </div>
                    <StringList
                      label="Planlanan hareket tarihleri"
                      value={data.departureDates || []}
                      onChange={(v) =>
                        field("departureDates", v.filter(Boolean))
                      }
                      hint="Her satıra YYYY-AA-GG biçiminde bir tarih. Bu alan kontenjan veya kesin hareket garantisi oluşturmaz."
                    />
                  </Section>
                )}
                <Section
                  title="Yönetici notu"
                  copy="Bu alan yalnızca panelde görünür."
                >
                  <Field
                    label="İç notlar"
                    textarea
                    value={data.internalNotes || ""}
                    onChange={(v) => field("internalNotes", v)}
                  />
                </Section>
              </>
            )}
            {tab === "media" && (
              <Section
                title="Kapak ve fotoğraf galerisi"
                copy="Kapak görselini seçin, diğer görsellerin sırasını düzenleyin. Kaldırma işlemi yalnızca bu kaydın galerisini değiştirir."
                action={
                  <Button secondary onClick={() => setPicker(true)}>
                    <Plus />
                    Görsel seç
                  </Button>
                }
              >
                {data.gallery?.length ? (
                  <div className="a-gallery-editor">
                    {data.gallery.map((path, i) => (
                      <div key={path} className="a-gallery-tile">
                        <img src={path} alt={`${i + 1}. galeri görseli`} />
                        <button
                          type="button"
                          className={`a-cover-label ${data.img === path ? "selected" : ""}`}
                          onClick={() =>
                            setRecord((r) => ({
                              ...r,
                              data: {
                                ...r.data,
                                img: path,
                                gallery: [
                                  path,
                                  ...r.data.gallery.filter((p) => p !== path),
                                ],
                              },
                            }))
                          }
                        >
                          {data.img === path ? (
                            <>
                              <CheckCircle />
                              Kapak görseli
                            </>
                          ) : (
                            "Kapak yap"
                          )}
                        </button>
                        <ArrayActions
                          index={i}
                          length={data.gallery.length}
                          label={`${i + 1}. görsel`}
                          onMove={(d) => editArray("gallery", i, d)}
                          onRemove={() => {
                            const gallery = data.gallery.filter(
                              (p) => p !== path,
                            );
                            setRecord((r) => ({
                              ...r,
                              data: {
                                ...r.data,
                                gallery,
                                img:
                                  r.data.img === path
                                    ? gallery[0] || ""
                                    : r.data.img,
                              },
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    title="Henüz görsel seçilmedi."
                    copy="Kütüphaneden seçebilir veya yeni görseller yükleyebilirsiniz."
                  >
                    <Button onClick={() => setPicker(true)}>
                      <Images />
                      Görsel ekle
                    </Button>
                  </Empty>
                )}
              </Section>
            )}
            {tab === "rooms" && (
              <Section
                title="Oda tipleri"
                copy="Oda özelliklerini tanımlayın. Bu alan canlı oda stoku oluşturmaz."
                action={
                  <Button
                    secondary
                    onClick={() =>
                      field("rooms", [
                        ...(data.rooms || []),
                        {
                          id: crypto.randomUUID(),
                          name: "Yeni oda tipi",
                          capacity: 2,
                          concept: "",
                          description: "",
                        },
                      ])
                    }
                  >
                    <Plus />
                    Oda tipi ekle
                  </Button>
                }
              >
                {(data.rooms || []).map((room, i) => (
                  <div className="a-repeat" key={room.id || i}>
                    <div className="a-repeat-head">
                      <h3>Oda tipi {i + 1}</h3>
                      <ArrayActions
                        index={i}
                        length={data.rooms.length}
                        label={`${i + 1}. oda tipi`}
                        onMove={(d) => editArray("rooms", i, d)}
                        onRemove={() => editArray("rooms", i, null)}
                      />
                    </div>
                    <div className="a-form-grid">
                      <Field
                        label="Oda adı"
                        value={room.name}
                        onChange={(v) => changeItem("rooms", i, { name: v })}
                      />
                      <Field
                        label="En fazla kişi"
                        type="number"
                        min={1}
                        max={20}
                        value={room.capacity}
                        onChange={(v) =>
                          changeItem("rooms", i, { capacity: v })
                        }
                      />
                      <Field
                        label="Pansiyon / konsept"
                        value={room.concept}
                        onChange={(v) => changeItem("rooms", i, { concept: v })}
                      />
                    </div>
                    <Field
                      label="Oda açıklaması"
                      textarea
                      value={room.description}
                      onChange={(v) =>
                        changeItem("rooms", i, { description: v })
                      }
                    />
                  </div>
                ))}
                {!data.rooms?.length && (
                  <Empty
                    title="Oda tipi eklenmedi."
                    copy="Standart, aile veya süit oda seçeneklerini tanımlayabilirsiniz."
                  />
                )}
              </Section>
            )}
            {tab === "program" && (
              <Section
                title="Gün gün tur programı"
                copy="Her günün numarasını, başlığını ve programını ayrı düzenleyin."
                action={
                  <Button
                    secondary
                    onClick={() =>
                      field("itinerary", [
                        ...(data.itinerary || []),
                        {
                          day:
                            Math.max(
                              0,
                              ...(data.itinerary || []).map((d) => d.day),
                            ) + 1,
                          title: "",
                          text: "",
                        },
                      ])
                    }
                  >
                    <Plus />
                    Gün ekle
                  </Button>
                }
              >
                {(data.itinerary || []).map((day, i) => (
                  <div className="a-repeat" key={i}>
                    <div className="a-repeat-head">
                      <h3>{day.day}. gün</h3>
                      <ArrayActions
                        index={i}
                        length={data.itinerary.length}
                        label={`${i + 1}. program günü`}
                        onMove={(d) => editArray("itinerary", i, d)}
                        onRemove={() => editArray("itinerary", i, null)}
                      />
                    </div>
                    <div className="a-form-grid">
                      <Field
                        label="Gün numarası"
                        type="number"
                        min={1}
                        max={365}
                        value={day.day}
                        onChange={(v) => changeItem("itinerary", i, { day: v })}
                      />
                      <Field
                        label="Gün başlığı"
                        value={day.title}
                        onChange={(v) =>
                          changeItem("itinerary", i, { title: v })
                        }
                      />
                    </div>
                    <Field
                      label="Program açıklaması"
                      textarea
                      rows={7}
                      value={day.text}
                      onChange={(v) => changeItem("itinerary", i, { text: v })}
                    />
                  </div>
                ))}
                {!data.itinerary?.length && (
                  <Empty
                    title="Program henüz hazırlanmadı."
                    copy="Gün ekle düğmesiyle başlayın."
                  />
                )}
              </Section>
            )}
            {tab === "services" && (
              <Section
                title={hotel ? "Otel olanakları" : "Dahil ve hariç hizmetler"}
                copy="Yalnızca sağlanan hizmetleri belirtin."
              >
                {hotel ? (
                  <div className="a-checkbox-grid">
                    {Object.entries(dashboard?.amenities || {}).map(
                      ([key, label]) => (
                        <label key={key}>
                          <input
                            type="checkbox"
                            checked={data.amenities?.includes(key) || false}
                            onChange={() =>
                              field(
                                "amenities",
                                data.amenities.includes(key)
                                  ? data.amenities.filter((k) => k !== key)
                                  : [...data.amenities, key],
                              )
                            }
                          />
                          <span>{label}</span>
                        </label>
                      ),
                    )}
                  </div>
                ) : (
                  <>
                    <StringList
                      label="Dahil olanlar"
                      value={data.includes || []}
                      onChange={(v) => field("includes", v)}
                    />
                    <StringList
                      label="Dahil olmayanlar"
                      value={data.excludes || []}
                      onChange={(v) => field("excludes", v)}
                    />
                  </>
                )}
              </Section>
            )}
            {tab === "terms" && (
              <>
                <Section
                  title="Tur rotaları"
                  action={
                    <Button
                      secondary
                      onClick={() =>
                        field("tourRoutes", [
                          ...(data.tourRoutes || []),
                          {
                            key: crypto.randomUUID(),
                            name: "Yeni rota",
                            badge: "",
                            stops: [],
                            isDefault: false,
                          },
                        ])
                      }
                    >
                      <Plus />
                      Rota ekle
                    </Button>
                  }
                >
                  {(data.tourRoutes || []).map((route, i) => (
                    <div className="a-repeat" key={route.key || i}>
                      <div className="a-repeat-head">
                        <h3>Rota {i + 1}</h3>
                        <ArrayActions
                          index={i}
                          length={data.tourRoutes.length}
                          label={`${i + 1}. rota`}
                          onMove={(d) => editArray("tourRoutes", i, d)}
                          onRemove={() => editArray("tourRoutes", i, null)}
                        />
                      </div>
                      <div className="a-form-grid">
                        <Field
                          label="Rota adı"
                          value={route.name}
                          onChange={(v) =>
                            changeItem("tourRoutes", i, { name: v })
                          }
                        />
                        <Field
                          label="Rota notu"
                          value={route.badge}
                          onChange={(v) =>
                            changeItem("tourRoutes", i, { badge: v })
                          }
                        />
                      </div>
                      <StringList
                        label="Duraklar"
                        value={route.stops}
                        onChange={(v) =>
                          changeItem("tourRoutes", i, { stops: v })
                        }
                      />
                    </div>
                  ))}
                </Section>
                <Section
                  title="Koşullar ve bilgilendirme"
                  action={
                    <Button
                      secondary
                      onClick={() =>
                        field("terms", [
                          ...(data.terms || []),
                          { title: "Yeni koşul", items: [] },
                        ])
                      }
                    >
                      <Plus />
                      Koşul ekle
                    </Button>
                  }
                >
                  {(data.terms || []).map((term, i) => (
                    <div className="a-repeat" key={i}>
                      <div className="a-repeat-head">
                        <h3>Koşul {i + 1}</h3>
                        <ArrayActions
                          index={i}
                          length={data.terms.length}
                          label={`${i + 1}. koşul`}
                          onMove={(d) => editArray("terms", i, d)}
                          onRemove={() => editArray("terms", i, null)}
                        />
                      </div>
                      <Field
                        label="Koşul başlığı"
                        value={term.title}
                        onChange={(v) => changeItem("terms", i, { title: v })}
                      />
                      <StringList
                        label="Koşul maddeleri"
                        value={term.items}
                        onChange={(v) => changeItem("terms", i, { items: v })}
                      />
                    </div>
                  ))}
                </Section>
              </>
            )}
            {tab === "seo" && (
              <>
                <Section
                  title="Fiyat sunumu"
                  copy="Başlangıç fiyatı bir teklif bilgisidir; canlı müsaitlik veya rezervasyon onayı değildir."
                >
                  <Field label="Fiyat gösterimi">
                    <select
                      value={data.priceMode || "request"}
                      onChange={(e) => field("priceMode", e.target.value)}
                    >
                      <option value="request">Fiyat için teklif isteyin</option>
                      <option value="from">Başlangıç fiyatı göster</option>
                    </select>
                  </Field>
                  {data.priceMode === "from" && (
                    <div className="a-form-grid">
                      <Field
                        label="Başlangıç fiyatı"
                        type="number"
                        min={0}
                        max={10000000}
                        step="0.01"
                        value={data.fromPrice || 0}
                        onChange={(v) => field("fromPrice", v)}
                      />
                      <Field label="Para birimi">
                        <select
                          value={data.currency || "TRY"}
                          onChange={(e) => field("currency", e.target.value)}
                        >
                          {["TRY", "EUR", "USD"].map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                        </select>
                      </Field>
                      <Field
                        label="Fiyat birimi"
                        value={data.priceUnit || ""}
                        onChange={(v) => field("priceUnit", v)}
                        placeholder="Örn. 2 kişi / 2 gece"
                      />
                      <Field
                        label="Fiyatın son geçerlilik tarihi"
                        type="date"
                        value={data.priceValidUntil || ""}
                        onChange={(v) => field("priceValidUntil", v)}
                        hint="Tarih geçince sitede otomatik olarak teklif isteyin gösterilir."
                      />
                    </div>
                  )}
                </Section>
                <Section
                  title="Arama motoru görünümü"
                  copy="Boş bırakıldığında ad ve kısa açıklama kullanılır."
                >
                  <Field
                    label="SEO başlığı"
                    value={data.seoTitle || ""}
                    maxLength={90}
                    onChange={(v) => field("seoTitle", v)}
                    hint={`${(data.seoTitle || "").length} / 90 karakter`}
                  />
                  <Field
                    label="SEO açıklaması"
                    textarea
                    rows={3}
                    value={data.seoDescription || ""}
                    maxLength={180}
                    onChange={(v) => field("seoDescription", v)}
                    hint={`${(data.seoDescription || "").length} / 180 karakter`}
                  />
                  <div className="a-seo-preview">
                    <small>
                      ekonomikotel.com › {hotel ? "oteller" : "turlar"} ›{" "}
                      {data.slug}
                    </small>
                    <h3>{data.seoTitle || title} | Ekonomikotel</h3>
                    <p>
                      {data.seoDescription ||
                        (hotel ? data.blurb : data.shortDesc) ||
                        "Sayfanızın kısa açıklaması burada görünecek."}
                    </p>
                  </div>
                </Section>
              </>
            )}
            {tab === "history" && (
              <Section
                title="İçerik geçmişi"
                copy="Önceki bir sürümü forma yüklemek yayındaki içeriği değiştirmez. Sonuç için yeniden kaydetmeniz gerekir."
              >
                {revisions.length ? (
                  <div className="a-history-list">
                    {revisions.map((r) => (
                      <div key={r.id}>
                        <ClockCounterClockwise />
                        <span>
                          <strong>Sürüm {r.version}</strong>
                          <small>
                            {dateText(r.created_at)} · {r.actor}
                          </small>
                        </span>
                        <Status status={r.status} />
                        <Button
                          secondary
                          onClick={async () => {
                            if (
                              dirty &&
                              !window.confirm(
                                "Formdaki kaydedilmemiş değişiklikler yerine bu sürüm yüklensin mi?",
                              )
                            )
                              return;
                            try {
                              const old = await api(
                                `/content/${id}/revisions/${r.id}`,
                              );
                              setRecord((v) => ({ ...v, data: old.data }));
                              setNotice(
                                `Sürüm ${r.version} forma yüklendi. Henüz kaydedilmedi.`,
                              );
                              setTab("general");
                            } catch (e) {
                              setError(e);
                            }
                          }}
                        >
                          Forma yükle
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <Empty
                    title="Önceki sürüm yok."
                    copy="Kaydı düzenlediğinizde önceki içerik burada saklanır."
                  />
                )}
              </Section>
            )}
          </div>
        </div>
        <aside className="a-publish-panel">
          <Section title="Yayın ayarları">
            <Field label="İçerik durumu">
              <select
                value={record.status}
                onChange={(e) =>
                  setRecord((r) => ({ ...r, status: e.target.value }))
                }
              >
                {Object.entries(statusNames).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <p className="a-status-help">
              {record.status === "published"
                ? "Kaydettiğinizde içerik ziyaretçilere açık olur."
                : record.status === "archived"
                  ? "Kaydettiğinizde site listesinden kaldırılır. İçerik ve geçmişi saklanır."
                  : "Yalnızca yönetici görebilir. Site listesinde yer almaz."}
            </p>
            <label className="a-check">
              <input
                type="checkbox"
                checked={data.featured || false}
                onChange={(e) => field("featured", e.target.checked)}
              />
              Ana sayfada öne çıkar
            </label>
            <small className="a-muted">
              Vitrinde ilk dört uygun içerik gösterilir.
            </small>
            <div className="a-checklist">
              <h3>Yayın öncesi</h3>
              {readiness.map(([label, done]) => (
                <div key={label} className={done ? "done" : ""}>
                  {done ? <CheckCircle weight="fill" /> : <WarningCircle />}
                  {label}
                </div>
              ))}
            </div>
            {id && (
              <p className="a-version">
                Sürüm {record.version}
                <br />
                Oluşturulma: {dateText(record.createdAt)}
              </p>
            )}
          </Section>
        </aside>
      </div>
      <div className="a-save-bar">
        <span>
          {dirty ? (
            <>
              <span className="a-dirty-dot" />
              Değişiklikler henüz kaydedilmedi
            </>
          ) : (
            "Tüm değişiklikler kaydedildi"
          )}
        </span>
        <Button type="submit" disabled={busy}>
          <FloppyDisk />
          {busy
            ? "Kaydediliyor…"
            : record.status === "published"
              ? "Kaydet ve yayına al"
              : "Değişiklikleri kaydet"}
        </Button>
      </div>
      {picker && (
        <MediaPicker
          initial={data.gallery || []}
          close={() => setPicker(false)}
          onDone={(gallery) => {
            setRecord((r) => ({
              ...r,
              data: {
                ...r.data,
                gallery,
                img: gallery.includes(r.data.img)
                  ? r.data.img
                  : gallery[0] || "",
              },
            }));
            setPicker(false);
          }}
        />
      )}
    </form>
  );
}
function Audit() {
  const [page, setPage] = useState(1),
    { data, error, loading } = useData(`/audit?page=${page}`);
  return (
    <>
      <PageHeader
        title="İşlem geçmişi"
        copy="Girişleri, içerik düzenlemelerini ve görsel yüklemelerini takip edin."
      />
      <ErrorBox error={error} />
      {loading ? (
        <Loading />
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th>İşlem</th>
                <th>Kullanıcı</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{actionName(r.action)}</strong>
                    <small className="a-table-sub">{r.target}</small>
                  </td>
                  <td>{r.actor}</td>
                  <td>{dateText(r.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination data={data} setPage={setPage} />
        </div>
      )}
    </>
  );
}
function Settings({ user, onLogout }) {
  const [name, setName] = useState(user.name),
    [currentPassword, setCurrentPassword] = useState(""),
    [newPassword, setNewPassword] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/account", {
        method: "PUT",
        body: { name, currentPassword, newPassword },
      });
      onLogout();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <PageHeader
        title="Hesap ve yedekleme"
        copy="Yönetici bilgilerinizi düzenleyin, kataloğunuzun bir kopyasını alın."
      />
      <div className="a-settings-grid">
        <form onSubmit={submit}>
          <Section
            title="Yönetici hesabı"
            copy="Hesap güncellenince tüm oturumlar kapatılır; yeniden giriş yapmanız gerekir."
          >
            <Field label="Kullanıcı adı" value={user.username} readOnly />
            <Field
              label="Görünen ad"
              value={name}
              onChange={setName}
              required
              maxLength={100}
            />
            <Field
              label="Mevcut şifre"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
            />
            <Field
              label="Yeni şifre (isteğe bağlı)"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
              minLength={12}
              maxLength={128}
              hint="Değiştirmek istiyorsanız en az 12 karakter girin."
            />
            <ErrorBox error={error} />
            <Button type="submit" disabled={busy}>
              {busy ? "Güncelleniyor…" : "Hesabı güncelle"}
            </Button>
          </Section>
        </form>
        <Section
          title="Katalog dışa aktarımı"
          copy="Otel ve tur içerikleriyle görsel yollarını JSON dosyası olarak indirin."
        >
          <div className="a-export-icon">
            <DownloadSimple size={35} />
          </div>
          <p className="a-muted">
            Görsel dosyaları ve giriş bilgileri bu dosyaya dahil değildir. Tam
            sunucu yedeği veritabanı ve yüklenen görsellerle ayrıca alınmalıdır.
          </p>
          <a className="a-btn secondary" href="/api/admin/export" download>
            <DownloadSimple />
            Katalog JSON indir
          </a>
        </Section>
      </div>
    </>
  );
}
function Shell({ session, onLogout }) {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape") setMenu(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  const entries = [
    ["/admin", SquaresFour, "Genel bakış"],
    ["/admin/oteller", Bed, "Oteller"],
    ["/admin/turlar", SuitcaseRolling, "Turlar"],
    ["/admin/gorseller", Images, "Görsel kütüphanesi"],
    ["/admin/gecmis", ClockCounterClockwise, "İşlem geçmişi"],
    ["/admin/ayarlar", Gear, "Ayarlar"],
  ];
  return (
    <div className="a-app">
      <aside className={`a-sidebar ${menu ? "open" : ""}`}>
        <Link className="a-brand" to="/admin">
          ekonomik<span>otel.</span>
        </Link>
        <span className="a-sidebar-label">YÖNETİM PANELİ</span>
        <nav aria-label="Panel menüsü">
          {entries.map(([to, Icon, label]) => (
            <NavLink
              end={to === "/admin"}
              to={to}
              key={to}
              onClick={() => setMenu(false)}
            >
              <Icon size={21} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="a-sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer">
            <Globe />
            Siteyi görüntüle
            <ArrowUpRight />
          </a>
          <div className="a-user">
            <span>{session.user.name.slice(0, 1)}</span>
            <div>
              <strong>{session.user.name}</strong>
              <small>Yönetici</small>
            </div>
          </div>
          <button onClick={onLogout}>
            <SignOut />
            Güvenli çıkış
          </button>
        </div>
      </aside>
      <div className="a-workspace">
        <header className="a-topbar">
          <button
            className="a-icon-btn a-menu"
            aria-expanded={menu}
            aria-label={menu ? "Panel menüsünü kapat" : "Panel menüsünü aç"}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <List />}
          </button>
          <span>
            <i />
            Ekonomikotel içerik yönetimi
          </span>
          <a href="/" target="_blank" rel="noreferrer">
            Siteyi görüntüle
            <ArrowUpRight />
          </a>
        </header>
        <main className="a-main">
          <Routes>
            <Route index element={<Dashboard />} />
            <Route
              path="oteller"
              element={<ContentList key="hotel" kind="hotel" />}
            />
            <Route
              path="turlar"
              element={<ContentList key="tour" kind="tour" />}
            />
            <Route path="yeni/:kind" element={<Editor />} />
            <Route path="icerik/:id" element={<Editor />} />
            <Route path="gorseller" element={<MediaPage />} />
            <Route path="gecmis" element={<Audit />} />
            <Route
              path="ayarlar"
              element={<Settings user={session.user} onLogout={onLogout} />}
            />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
function Admin() {
  const [session, setSession] = useState(null),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    api("/session")
      .then((v) => {
        setSession(v);
        setCsrf(v.csrf);
      })
      .catch((e) => {
        if (e.status !== 401) setError(e.message);
      })
      .finally(() => setLoading(false));
    const expired = () => {
      setSession(null);
      setCsrf("");
    };
    window.addEventListener("admin:unauthorized", expired);
    return () => window.removeEventListener("admin:unauthorized", expired);
  }, []);
  async function logout() {
    if (
      hasUnsavedChanges &&
      !window.confirm(
        "Kaydedilmemiş değişiklikler var. Yine de çıkış yapılsın mı?",
      )
    )
      return;
    try {
      await api("/logout", { method: "POST" });
    } catch (e) {
      if (e.status !== 401) {
        window.alert(
          "Çıkış tamamlanamadı. Bağlantınızı kontrol edip tekrar deneyin.",
        );
        return;
      }
    }
    setCsrf("");
    setSession(null);
    navigate("/admin/giris", { replace: true });
  }
  if (loading) return <Loading />;
  if (!session)
    return (
      <>
        {error && <ErrorBox error={error} />}
        <Login
          onLogin={(v) => {
            setSession(v);
            setCsrf(v.csrf);
            setError("");
            navigate("/admin", { replace: true });
          }}
        />
      </>
    );
  return (
    <Routes>
      <Route
        path="/admin/*"
        element={<Shell session={session} onLogout={logout} />}
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
createRoot(document.getElementById("admin-root")).render(
  <RouterProvider
    router={createBrowserRouter([{ path: "*", element: <Admin /> }])}
  />,
);
