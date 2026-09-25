import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useBlocker } from "react-router-dom";
import {
  Plus,
  ArrowUp,
  ArrowDown,
  Trash,
  Copy,
  DownloadSimple,
  UploadSimple,
  CheckCircle,
  ClockCounterClockwise,
} from "@phosphor-icons/react";
import { api } from "./api.js";
export const B = ({ children, secondary = false, ...p }) => (
  <button
    type="button"
    className={`a-btn ${secondary ? "secondary" : ""}`}
    {...p}
  >
    {children}
  </button>
);
export const F = ({
  label,
  value,
  onChange,
  type = "text",
  children,
  ...p
}) => (
  <label className="a-field">
    <span>{label}</span>
    {children ||
      (type === "textarea" ? (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          {...p}
        />
      ) : (
        <input
          type={type}
          value={value ?? ""}
          onChange={(e) =>
            onChange(
              type === "number" ? Number(e.target.value) : e.target.value,
            )
          }
          {...p}
        />
      ))}
  </label>
);
export const Box = ({ title, children, copy }) => (
  <section className="a-section">
    <div className="a-section-head">
      <div>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
    </div>
    {children}
  </section>
);
const Alert = ({ error, notice }) => (
  <>
    {error && (
      <div role="alert" className="a-error">
        {error}
      </div>
    )}
    {notice && (
      <div role="status" className="a-success">
        <CheckCircle />
        {notice}
      </div>
    )}
  </>
);
function useLoad(path) {
  const [data, setData] = useState(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    setError("");
    api(path)
      .then((v) => {
        if (active) setData(v);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [path, revision]);
  return {
    data,
    setData,
    error,
    setError,
    reload: () => setRevision((v) => v + 1),
  };
}
export function useLeaveGuard(dirty) {
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state === "blocked") {
      if (
        window.confirm(
          "Kaydedilmemiş değişiklikler var. Ayrılmak istiyor musunuz?",
        )
      )
        blocker.proceed();
      else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    const fn = (e) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", fn);
    return () => window.removeEventListener("beforeunload", fn);
  }, [dirty]);
}
const head = (title, copy) => (
  <div className="a-page-header">
    <div>
      <h1>{title}</h1>
      <p>{copy}</p>
    </div>
  </div>
);
const money = (v, c = "TRY") =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: c }).format(v);
const date = (v) => (v ? new Date(v).toLocaleString("tr-TR") : "Henüz yok");
export function RoomDetails({ room, onChange, onImages }) {
  return (
    <div className="a-room-details">
      <div className="a-form-grid">
        <F
          label="Alan (m²)"
          type="number"
          min="0"
          max="2000"
          value={room.area || 0}
          onChange={(area) => onChange({ area })}
        />
        <F
          label="Yatak düzeni"
          value={room.bedType}
          onChange={(bedType) => onChange({ bedType })}
          placeholder="1 çift kişilik + 1 tek kişilik"
        />
        <F
          label="Manzara"
          value={room.view}
          onChange={(view) => onChange({ view })}
        />
      </div>
      <F
        label="Odaya özel özellikler (her satıra bir özellik)"
        type="textarea"
        value={(room.features || []).join("\n")}
        onChange={(v) => onChange({ features: v.split("\n") })}
      />
      <div className="a-inline-gallery">
        {(room.gallery || []).map((p, i) => (
          <img key={p} src={p} alt={`${room.name} · ${i + 1}`} />
        ))}
      </div>
      <B secondary onClick={onImages}>
        Oda fotoğraflarını seç ({room.gallery?.length || 0}/12)
      </B>
    </div>
  );
}
export function RatesEditor({ rooms = [], plans = [], onChange }) {
  const set = (i, patch) =>
    onChange(plans.map((p, j) => (j === i ? { ...p, ...patch } : p)));
  return (
    <Box
      title="Dönemsel oda fiyatları"
      copy="Gecelik oda fiyatı, dahil yetişkin sayısına kadar sabittir. Ek yetişkin ve her çocuk için gecelik ek ücret hesaplanır. Bitiş tarihi fiyatın geçerli olduğu son gecedir."
    >
      {!rooms.length ? (
        <p>Önce Oda tipleri bölümünden en az bir oda ekleyin.</p>
      ) : (
        <B
          secondary
          onClick={() =>
            onChange([
              ...plans,
              {
                id: crypto.randomUUID(),
                name: "Yeni dönem",
                roomId: rooms[0].id,
                start: "",
                end: "",
                enabled: true,
                currency: "TRY",
                basePrice: 0,
                includedAdults: Math.min(2, rooms[0].capacity),
                extraAdultPrice: 0,
                minNights: 1,
                childBands: [],
              },
            ])
          }
        >
          <Plus />
          Fiyat dönemi ekle
        </B>
      )}
      {!plans.length && (
        <p className="a-muted">
          Fiyat dönemi eklenmedi. Ziyaretçi özel teklif isteyebilir.
        </p>
      )}
      {plans.map((p, i) => (
        <div className="a-repeat" key={p.id}>
          <div className="a-repeat-head">
            <h3>{p.name}</h3>
            <B
              secondary
              aria-label={`${i + 1}. fiyat dönemini kaldır`}
              onClick={() => onChange(plans.filter((_, j) => i !== j))}
            >
              <Trash />
            </B>
          </div>
          <div className="a-form-grid">
            <F
              label="Dönem adı"
              value={p.name}
              onChange={(name) => set(i, { name })}
            />
            <F label="Oda tipi">
              <select
                value={p.roomId}
                onChange={(e) => set(i, { roomId: e.target.value })}
              >
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </F>
            <F
              label="İlk gece"
              type="date"
              value={p.start}
              onChange={(start) => set(i, { start })}
            />
            <F
              label="Son gece"
              type="date"
              value={p.end}
              onChange={(end) => set(i, { end })}
            />
            <F
              label="Gecelik oda fiyatı"
              type="number"
              min="0.01"
              step="0.01"
              value={p.basePrice}
              onChange={(basePrice) => set(i, { basePrice })}
            />
            <F label="Para birimi">
              <select
                value={p.currency}
                onChange={(e) => set(i, { currency: e.target.value })}
              >
                {["TRY", "EUR", "USD"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </F>
            <F
              label="Fiyata dahil yetişkin"
              type="number"
              min="1"
              max="20"
              value={p.includedAdults}
              onChange={(includedAdults) => set(i, { includedAdults })}
            />
            <F
              label="Ek yetişkin / gece"
              type="number"
              min="0"
              step="0.01"
              value={p.extraAdultPrice}
              onChange={(extraAdultPrice) => set(i, { extraAdultPrice })}
            />
            <F
              label="En az gece"
              type="number"
              min="1"
              max="90"
              value={p.minNights}
              onChange={(minNights) => set(i, { minNights })}
            />
          </div>
          <label className="a-check">
            <input
              type="checkbox"
              checked={p.enabled}
              onChange={(e) => set(i, { enabled: e.target.checked })}
            />
            Fiyat dönemi etkin
          </label>
          <h4>Çocuk yaş aralıkları</h4>
          <p className="a-muted">
            Örn. 0–5 yaş ücretsiz, 6–11 yaş ücretli. Tanımlanmayan yaşlar için
            otomatik fiyat hesaplanmaz.
          </p>
          {p.childBands.map((b, j) => (
            <div className="a-age-band" key={j}>
              {[
                ["minAge", "En küçük yaş"],
                ["maxAge", "En büyük yaş"],
                ["price", "Çocuk / gece"],
              ].map(([key, label]) => (
                <F
                  key={key}
                  label={label}
                  type="number"
                  min="0"
                  max={key === "price" ? 10000000 : 17}
                  step={key === "price" ? "0.01" : "1"}
                  value={b[key]}
                  onChange={(v) =>
                    set(i, {
                      childBands: p.childBands.map((x, n) =>
                        n === j ? { ...x, [key]: v } : x,
                      ),
                    })
                  }
                />
              ))}
              <B
                secondary
                aria-label={`${j + 1}. çocuk yaş aralığını kaldır`}
                onClick={() =>
                  set(i, { childBands: p.childBands.filter((_, n) => n !== j) })
                }
              >
                <Trash />
              </B>
            </div>
          ))}
          <B
            secondary
            onClick={() =>
              set(i, {
                childBands: [
                  ...p.childBands,
                  { minAge: 0, maxAge: 5, price: 0 },
                ],
              })
            }
          >
            <Plus />
            Yaş aralığı ekle
          </B>
        </div>
      ))}
    </Box>
  );
}
export function HomepagePage({ MediaPicker }) {
  const { data: loaded, error, setError, reload } = useLoad("/homepage"),
    { data: choices } = useLoad("/choices");
  const [form, setForm] = useState(null),
    [baseline, setBaseline] = useState(""),
    [picker, setPicker] = useState(null),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (loaded) {
      setForm(loaded);
      setBaseline(JSON.stringify(loaded));
    }
  }, [loaded]);
  useLeaveGuard(!!form && JSON.stringify(form) !== baseline);
  if (!form) return <Alert error={error || "Yükleniyor…"} />;
  const d = form.data,
    set = (key, v) => setForm((f) => ({ ...f, data: { ...f.data, [key]: v } }));
  const campaign = (i, patch) =>
    set(
      "campaigns",
      d.campaigns.map((c, j) => (j === i ? { ...c, ...patch } : c)),
    );
  const reorder = (key, i, delta) => {
    const list = [...d[key]],
      j = i + delta;
    if (j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
    set(key, list);
  };
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const v = await api("/homepage", { method: "PUT", body: form });
      setForm(v);
      setBaseline(JSON.stringify(v));
      setNotice("Ana sayfa güncellendi.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {head(
        "Ana sayfa yönetimi",
        "Açılış alanını, kampanyaları ve vitrin sırasını düzenleyin. Kaydettiğiniz değişiklikler sitede yayınlanır.",
      )}
      <Alert error={error} notice={notice} />
      <form onSubmit={save}>
        <Box title="Açılış alanı">
          <div className="a-form-grid">
            {[
              ["eyebrow", "Konum etiketi"],
              ["title", "Ana başlık"],
              ["accent", "İkinci başlık satırı"],
              ["linkLabel", "Buton yazısı"],
              ["link", "Buton bağlantısı"],
              ["imageAlt", "Fotoğraf açıklaması"],
            ].map(([key, label]) => (
              <F
                key={key}
                label={label}
                value={d[key]}
                onChange={(v) => set(key, v)}
              />
            ))}
          </div>
          <F
            label="Açıklama"
            type="textarea"
            value={d.description}
            onChange={(v) => set("description", v)}
          />
          <img className="a-banner-preview" src={d.image} alt={d.imageAlt} />
          <B secondary onClick={() => setPicker("hero")}>
            Açılış görselini değiştir
          </B>
        </Box>
        {["hotel", "tour"].map((kind) => {
          const key = kind === "hotel" ? "hotelSlugs" : "tourSlugs",
            items = (choices?.items || []).filter(
              (c) => c.kind === kind && c.status === "published",
            );
          return (
            <Box
              key={key}
              title={kind === "hotel" ? "Otel vitrini" : "Tur vitrini"}
              copy="Sıra yukarıdan aşağıya uygulanır. Boş bırakırsanız mevcut öne çıkan içerikler kullanılır; en fazla 12 kayıt seçin."
            >
              {d[key].map((slug, i) => (
                <div className="a-order-row" key={slug}>
                  <span>
                    {i + 1}. {items.find((x) => x.slug === slug)?.title || slug}
                  </span>
                  <B
                    secondary
                    disabled={!i}
                    aria-label={`${slug} yukarı`}
                    onClick={() => reorder(key, i, -1)}
                  >
                    <ArrowUp />
                  </B>
                  <B
                    secondary
                    disabled={i === d[key].length - 1}
                    aria-label={`${slug} aşağı`}
                    onClick={() => reorder(key, i, 1)}
                  >
                    <ArrowDown />
                  </B>
                  <B
                    secondary
                    aria-label={`${slug} vitrinden çıkar`}
                    onClick={() =>
                      set(
                        key,
                        d[key].filter((s) => s !== slug),
                      )
                    }
                  >
                    <Trash />
                  </B>
                </div>
              ))}
              <F
                label={
                  kind === "hotel" ? "Vitrine otel ekle" : "Vitrine tur ekle"
                }
              >
                <select
                  value=""
                  disabled={d[key].length >= 12}
                  onChange={(e) => {
                    if (e.target.value) set(key, [...d[key], e.target.value]);
                  }}
                >
                  <option value="">İçerik seçin</option>
                  {items
                    .filter((x) => !d[key].includes(x.slug))
                    .map((x) => (
                      <option key={x.id} value={x.slug}>
                        {x.title}
                      </option>
                    ))}
                </select>
              </F>
            </Box>
          );
        })}
        <Box
          title="Kampanya alanları"
          copy="En fazla 6 kart. Tarihi boş bırakırsanız süre sınırı uygulanmaz; etkin olmayan kartlar gösterilmez."
        >
          {d.campaigns.map((c, i) => (
            <div className="a-repeat" key={c.id}>
              <div className="a-repeat-head">
                <h3>Kampanya {i + 1}</h3>
                <div className="a-inline-actions">
                  <B
                    secondary
                    disabled={!i}
                    onClick={() => reorder("campaigns", i, -1)}
                    aria-label={`${i + 1}. kampanya yukarı`}
                  >
                    <ArrowUp />
                  </B>
                  <B
                    secondary
                    disabled={i === d.campaigns.length - 1}
                    onClick={() => reorder("campaigns", i, 1)}
                    aria-label={`${i + 1}. kampanya aşağı`}
                  >
                    <ArrowDown />
                  </B>
                  <B
                    secondary
                    onClick={() =>
                      set(
                        "campaigns",
                        d.campaigns.filter((_, n) => n !== i),
                      )
                    }
                    aria-label={`${i + 1}. kampanyayı kaldır`}
                  >
                    <Trash />
                  </B>
                </div>
              </div>
              <div className="a-form-grid">
                {[
                  ["title", "Kampanya başlığı"],
                  ["description", "Kampanya açıklaması"],
                  ["label", "Buton metni"],
                  ["link", "Bağlantı"],
                ].map(([key, label]) => (
                  <F
                    key={key}
                    label={label}
                    value={c[key]}
                    onChange={(v) => campaign(i, { [key]: v })}
                  />
                ))}
                <F
                  label="Başlangıç"
                  type="date"
                  value={c.start}
                  onChange={(start) => campaign(i, { start })}
                />
                <F
                  label="Bitiş"
                  type="date"
                  value={c.end}
                  onChange={(end) => campaign(i, { end })}
                />
              </div>
              <label className="a-check">
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={(e) => campaign(i, { enabled: e.target.checked })}
                />
                Kampanya etkin
              </label>
              {c.image && (
                <img className="a-banner-preview" src={c.image} alt={c.title} />
              )}
              <B secondary onClick={() => setPicker(c.id)}>
                Kampanya görseli seç
              </B>
            </div>
          ))}
          <B
            secondary
            disabled={d.campaigns.length >= 6}
            onClick={() =>
              set("campaigns", [
                ...d.campaigns,
                {
                  id: crypto.randomUUID(),
                  title: "Yeni kampanya",
                  description: "",
                  label: "İncele",
                  link: "/oteller",
                  image: "",
                  enabled: false,
                  start: "",
                  end: "",
                },
              ])
            }
          >
            <Plus />
            Kampanya ekle
          </B>
        </Box>
        <div className="a-sticky-actions">
          <B type="submit" disabled={busy}>
            {busy ? "Kaydediliyor…" : "Ana sayfayı kaydet"}
          </B>
          <a
            className="a-btn secondary"
            href="/"
            target="_blank"
            rel="noreferrer"
          >
            Siteyi görüntüle
          </a>
        </div>
      </form>
      {picker !== null && (
        <MediaPicker
          initial={[]}
          close={() => setPicker(null)}
          onDone={(images) => {
            if (images[0]) {
              if (picker === "hero") set("image", images[0]);
              else
                set(
                  "campaigns",
                  d.campaigns.map((c) =>
                    c.id === picker ? { ...c, image: images[0] } : c,
                  ),
                );
            }
            setPicker(null);
          }}
        />
      )}
    </>
  );
}
const leadNames = {
  new: "Yeni",
  contacted: "Görüşülüyor",
  quoted: "Teklif gönderildi",
  closed: "Sonuçlandı",
};
export function LeadsPage() {
  const [q, setQ] = useState(""),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(1);
  const { data, error } = useLoad(
    `/leads?q=${encodeURIComponent(q)}&status=${status}&page=${page}`,
  );
  return (
    <>
      {head(
        "Talepler ve teklifler",
        "Web sitesinden gelen talepleri, görüşme notlarını ve teklif sonuçlarını takip edin.",
      )}
      <Alert error={error} />
      <div className="a-list-controls">
        <F
          label="Ad, telefon veya talep numarası"
          value={q}
          onChange={(v) => {
            setQ(v);
            setPage(1);
          }}
        />
        <F label="Talep durumu">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Tümü</option>
            {Object.entries(leadNames).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </F>
      </div>
      {!data ? (
        <p>Yükleniyor…</p>
      ) : (
        <Box title={`${data.total} talep`}>
          {data.items.length ? (
            data.items.map((r) => (
              <Link
                className="a-lead-row"
                to={`/admin/talepler/${r.id}`}
                key={r.id}
              >
                <div>
                  <strong>{r.data.name}</strong>
                  <small>
                    {r.reference} · {r.data.title}
                  </small>
                  <small>
                    {r.data.phone} · {date(r.created_at)}
                  </small>
                </div>
                <span className="a-status">{leadNames[r.status]}</span>
              </Link>
            ))
          ) : (
            <p>Bu filtreye uyan talep bulunamadı.</p>
          )}
          <div className="a-inline-actions">
            <B secondary disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Önceki
            </B>
            <span>
              {page} / {data.pages}
            </span>
            <B
              secondary
              disabled={page >= data.pages}
              onClick={() => setPage(page + 1)}
            >
              Sonraki
            </B>
          </div>
        </Box>
      )}
    </>
  );
}
export function LeadDetail() {
  const { id } = useParams(),
    { data: loaded, error, setError, reload } = useLoad(`/leads/${id}`);
  const [form, setForm] = useState(null),
    [baseline, setBaseline] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (loaded) {
      const v = {
        version: loaded.version,
        status: loaded.status,
        notes: loaded.data.notes,
        offerAmount: loaded.data.offerAmount,
        offerCurrency: loaded.data.offerCurrency,
        offerText: loaded.data.offerText,
        outcome: loaded.data.outcome,
      };
      setForm(v);
      setBaseline(JSON.stringify(v));
    }
  }, [loaded]);
  useLeaveGuard(!!form && JSON.stringify(form) !== baseline);
  if (!loaded || !form) return <Alert error={error || "Yükleniyor…"} />;
  const d = loaded.data,
    set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  return (
    <>
      <Link className="a-back-link" to="/admin/talepler">
        Taleplere dön
      </Link>
      {head(d.name, `${loaded.reference} · ${d.title}`)}
      <Alert error={error} notice={notice} />
      <div className="a-operation-grid">
        <Box title="Talep bilgileri">
          <p>
            <a href={`tel:${d.phone.replace(/[^+\d]/g, "")}`}>{d.phone}</a>
            {d.email && (
              <>
                {" "}
                · <a href={`mailto:${d.email}`}>{d.email}</a>
              </>
            )}
          </p>
          <p>
            {d.start || "Tarih belirtilmedi"} {d.end && `– ${d.end}`} ·{" "}
            {d.adults} yetişkin
            {d.childAges.length
              ? ` · Çocuk yaşları: ${d.childAges.join(", ")}`
              : ""}
          </p>
          <p className="a-preserve-lines">{d.message || "Ek mesaj yok."}</p>
          {d.quote?.available && (
            <p>
              Hesaplanan gösterge fiyat:{" "}
              <strong>{money(d.quote.total, d.quote.currency)}</strong> ·{" "}
              {d.quote.nights} gece
            </p>
          )}
          <small>
            Talep: {date(loaded.created_at)} · İletişim izni:{" "}
            {date(d.consentAt)}
          </small>
        </Box>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError("");
            setNotice("");
            try {
              await api(`/leads/${id}`, { method: "PUT", body: form });
              setNotice("Talep güncellendi.");
              setBaseline(JSON.stringify(form));
              reload();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <Box title="Görüşme ve teklif">
            <F label="Durum">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
              >
                {Object.entries(leadNames).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </F>
            <F
              label="Görüşme notları"
              type="textarea"
              value={form.notes}
              onChange={(v) => set("notes", v)}
            />
            <div className="a-form-grid">
              <F
                label="Teklif tutarı"
                type="number"
                min="0"
                step="0.01"
                value={form.offerAmount}
                onChange={(v) => set("offerAmount", v)}
              />
              <F label="Teklif para birimi">
                <select
                  value={form.offerCurrency}
                  onChange={(e) => set("offerCurrency", e.target.value)}
                >
                  {["TRY", "EUR", "USD"].map((v) => (
                    <option key={v}>{v}</option>
                  ))}
                </select>
              </F>
            </div>
            <F
              label="Teklif açıklaması"
              type="textarea"
              value={form.offerText}
              onChange={(v) => set("offerText", v)}
            />
            <p className="a-muted">
              Bu alan kayıt tutar. Müşteriye otomatik mesaj gönderilmez;
              gönderdiğiniz teklifi burada işaretleyin.
            </p>
            <F label="Görüşme sonucu">
              <select
                value={form.outcome}
                onChange={(e) => set("outcome", e.target.value)}
              >
                <option value="">Seçin</option>
                <option value="won">Olumlu sonuçlandı</option>
                <option value="lost">Olumsuz sonuçlandı</option>
                <option value="cancelled">Müşteri vazgeçti</option>
              </select>
            </F>
            <B type="submit" disabled={busy}>
              Talebi kaydet
            </B>
          </Box>
        </form>
      </div>
      <Box title="Önceki görüşme kayıtları">
        {loaded.history.length ? (
          loaded.history.map((h) => (
            <details key={h.id}>
              <summary>
                {date(h.created_at)} · {leadNames[h.data.status]}
              </summary>
              <p className="a-preserve-lines">{h.data.notes || "Not yok."}</p>
              <p>{h.data.offerText}</p>
            </details>
          ))
        ) : (
          <p>Henüz güncelleme yok.</p>
        )}
      </Box>
    </>
  );
}
export function ImportsPage() {
  const [preview, setPreview] = useState(null),
    [selected, setSelected] = useState([]),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    ref = useRef(null);
  return (
    <>
      {head(
        "Excel ile toplu aktarım",
        "Şablonu doldurun, satırları kontrol edin ve seçtiğiniz içerikleri taslak oluşturun.",
      )}
      <Alert error={error} notice={notice} />
      <Box
        title="Dosya hazırlığı"
        copy=".xlsx · en fazla 2 MB ve 200 kayıt. Mevcut içeriklerin üzerine yazılmaz. Oda ve fiyat detayları aktarım sonrası düzenlenir."
      >
        <div className="a-inline-actions">
          <a className="a-btn secondary" href="/api/admin/import-template">
            <DownloadSimple />
            Excel şablonu indir
          </a>
          <B disabled={busy} onClick={() => ref.current.click()}>
            <UploadSimple />
            {busy ? "İşleniyor…" : "Excel dosyası seç"}
          </B>
        </div>
        <input
          ref={ref}
          type="file"
          accept=".xlsx"
          aria-label="Excel dosyası"
          className="a-sr"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setError("");
            setNotice("");
            setPreview(null);
            if (file.size > 2 * 1024 * 1024) {
              setError("Dosya en fazla 2 MB olabilir.");
              return;
            }
            setBusy(true);
            try {
              const v = await api("/imports/preview", {
                method: "POST",
                raw: true,
                headers: { "Content-Type": "application/octet-stream" },
                body: file,
              });
              setPreview(v);
              setSelected(v.rows.filter((r) => !r.error).map((r) => r.row));
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        />
      </Box>
      {preview && (
        <Box
          title="Aktarım önizlemesi"
          copy="Hatalı satırlar seçilemez. Aktarım tüm seçili satırlar için birlikte tamamlanır."
        >
          <div className="a-import-rows">
            {preview.rows.map((r) => (
              <label
                className={`a-import-row ${r.error ? "invalid" : ""}`}
                key={r.row}
              >
                <input
                  type="checkbox"
                  disabled={!!r.error || busy}
                  checked={selected.includes(r.row)}
                  onChange={(e) =>
                    setSelected((s) =>
                      e.target.checked
                        ? [...s, r.row]
                        : s.filter((n) => n !== r.row),
                    )
                  }
                />
                <span>
                  <strong>
                    Satır {r.row} · {r.title || "Adsız içerik"}
                  </strong>
                  <small>
                    {r.kind} · {r.slug}
                  </small>
                  {r.error && <small role="status">{r.error}</small>}
                </span>
                <span>{r.error ? "Düzeltme gerekli" : "Hazır"}</span>
              </label>
            ))}
          </div>
          <B
            disabled={busy || !selected.length}
            onClick={async () => {
              setBusy(true);
              setError("");
              try {
                const result = await api(`/imports/${preview.id}/commit`, {
                  method: "POST",
                  body: { rows: selected },
                });
                setNotice(
                  `${result.items.length} içerik taslak olarak oluşturuldu.`,
                );
                setPreview(null);
              } catch (e) {
                setError(e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {selected.length} kaydı taslak oluştur
          </B>
        </Box>
      )}
    </>
  );
}
export function BackupsPage() {
  const { data, error, setError, reload } = useLoad("/backups");
  const [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  useEffect(() => {
    if (!data?.running) return;
    const timer = setInterval(reload, 2000);
    return () => clearInterval(timer);
  }, [data?.running]);
  if (!data) return <Alert error={error || "Yükleniyor…"} />;
  const change = async (patch) => {
    setError("");
    setBusy(true);
    try {
      await api("/backups", {
        method: "PUT",
        body: { version: data.version, data: { ...data.data, ...patch } },
      });
      setNotice("Yedekleme ayarı kaydedildi.");
      reload();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      {head(
        "Yedekleme",
        "Veritabanı ve yüklenen görseller düzenli olarak birlikte yedeklenir.",
      )}
      <Alert error={error} notice={notice} />
      <Box title="Otomatik yedekleme">
        <label className="a-check">
          <input
            type="checkbox"
            disabled={busy}
            checked={data.data.enabled}
            onChange={(e) => change({ enabled: e.target.checked })}
          />
          Otomatik yedekleme açık
        </label>
        <F label="Yedekleme sıklığı">
          <select
            disabled={busy}
            value={data.data.intervalHours}
            onChange={(e) => change({ intervalHours: Number(e.target.value) })}
          >
            {[6, 12, 24].map((n) => (
              <option key={n} value={n}>
                {n} saatte bir
              </option>
            ))}
          </select>
        </F>
        <p className="a-muted">
          Sunucu açıkken çalışır. Sunucu kapalıyken kaçırılan yedek ilk açılışta
          alınır. Yedekler otomatik silinmez.
        </p>
        <p className="a-storage-path">Depolama: {data.storage}</p>
        <p className="a-muted">
          Bu dizini ayrıca sunucu dışında koruyun. Aynı diskteki kopya disk
          arızasına karşı koruma sağlamaz.
        </p>
        <B
          disabled={data.running || busy}
          onClick={async () => {
            setBusy(true);
            setError("");
            try {
              await api("/backups/run", { method: "POST" });
              setNotice("Yedekleme başlatıldı. Sonucu aşağıdan takip edin.");
              reload();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          <ClockCounterClockwise />
          {data.running ? "Yedekleniyor…" : "Şimdi yedekle"}
        </B>
      </Box>
      <Box title="Yedek geçmişi">
        {data.items.length ? (
          data.items.map((b) => (
            <div className="a-backup-row" key={b.id}>
              <div>
                <strong>{date(b.created_at)}</strong>
                <small>
                  {b.status === "complete"
                    ? `${(b.bytes / 1024 / 1024).toFixed(1)} MB · Bütünlük doğrulandı`
                    : b.error || "İşlem devam ediyor"}
                </small>
              </div>
              <span
                className={`a-status ${b.status === "complete" ? "published" : b.status === "failed" ? "archived" : "draft"}`}
              >
                {
                  {
                    complete: "Başarılı",
                    running: "Sürüyor",
                    failed: "Başarısız",
                  }[b.status]
                }
              </span>
            </div>
          ))
        ) : (
          <p>Henüz yedek yok.</p>
        )}
      </Box>
    </>
  );
}
export function BulkActions({ items, onComplete }) {
  const [selected, setSelected] = useState([]),
    [status, setStatus] = useState("draft"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    setSelected([]);
  }, [items]);
  return (
    <div className="a-bulk">
      <div className="a-inline-actions">
        <label className="a-check">
          <input
            type="checkbox"
            checked={items.length > 0 && selected.length === items.length}
            onChange={(e) =>
              setSelected(e.target.checked ? items.map((r) => r.id) : [])
            }
          />
          Bu sayfadaki kayıtları seç
        </label>
        <select
          aria-label="Toplu yayın durumu"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="draft">Taslak yap</option>
          <option value="published">Yayınla</option>
          <option value="archived">Arşivle</option>
        </select>
        <B
          secondary
          disabled={!selected.length || busy}
          onClick={async () => {
            if (
              !window.confirm(
                `${selected.length} kayıt için seçilen durum uygulansın mı?`,
              )
            )
              return;
            setBusy(true);
            setError("");
            try {
              await api("/bulk-status", {
                method: "POST",
                body: {
                  status,
                  items: items
                    .filter((i) => selected.includes(i.id))
                    .map(({ id, version }) => ({ id, version })),
                },
              });
              onComplete();
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          }}
        >
          {selected.length} kayda uygula
        </B>
      </div>
      {selected.length > 0 && (
        <div className="a-bulk-selection">
          {items.map((i) => (
            <label key={i.id}>
              <input
                type="checkbox"
                checked={selected.includes(i.id)}
                onChange={(e) =>
                  setSelected((s) =>
                    e.target.checked
                      ? [...s, i.id]
                      : s.filter((id) => id !== i.id),
                  )
                }
              />
              {i.title}
            </label>
          ))}
        </div>
      )}
      <Alert error={error} />
    </div>
  );
}
