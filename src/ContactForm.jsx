import React, { useEffect, useId, useRef, useState } from "react";
import {
  ArrowCounterClockwise,
  Bed,
  ChatCircleDots,
  CheckCircle,
  EnvelopeSimple,
  Heart,
  Info,
  Minus,
  PaperPlaneTilt,
  Phone,
  Plus,
  Receipt,
  SuitcaseRolling,
  UsersThree,
  WarningCircle,
  WhatsappLogo,
} from "@phosphor-icons/react";
import { AGENCY } from "./lib/agency.js";
import {
  CONTACT_METHODS,
  CONTACT_TIMES,
  PHONE_PATTERN,
  TRAVEL_AREAS,
  TRAVEL_BUDGETS,
  TRAVEL_TOPICS,
  isPlanningTopic,
  needsMessageTopic,
  values,
} from "./lib/contact-forms.js";

// Otel ve tur talepleri için iletişim formu. /api/contact uç noktasına
// form: "travel" olarak gönderir; tarih, misafir ve çocuk yaşları fiyatı
// belirlediği için ayrı alanlar olarak iletilir.

const localDate = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
const dayAfter = (value) => {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate() + 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
// crypto.randomUUID yalnızca güvenli bağlamda vardır; yedek aynı biçimi üretir.
const newRequestId = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

const MAX_GUESTS = 50;
const MAX_CHILDREN = 10;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CHECK_FIELDS = "Lütfen işaretli alanları kontrol edin.";
const topicIcons = {
  hotel: Bed,
  tour: SuitcaseRolling,
  honeymoon: Heart,
  group: UsersThree,
  existing: Receipt,
  other: ChatCircleDots,
};
const methodIcons = {
  phone: Phone,
  whatsapp: WhatsappLogo,
  email: EnvelopeSimple,
};
const methodReply = {
  phone: "telefonla",
  whatsapp: "WhatsApp üzerinden",
  email: "e-posta ile",
};
const messagePlaceholders = {
  hotel:
    "Oda tipi, manzara, kahvaltı, havalimanı transferi gibi isteklerinizi yazabilirsiniz.",
  tour: "İlgilendiğiniz paket, balon turu veya bölge deneyimleri hakkında yazabilirsiniz.",
  honeymoon:
    "Oda süsleme, balon turu, özel akşam yemeği gibi isteklerinizi yazabilirsiniz.",
  group:
    "Kurum veya grup adı, etkinlik türü, toplantı salonu ve ulaşım ihtiyacınızı yazabilirsiniz.",
  existing: "Değişiklik isteğinizi veya sorunuzu yazın.",
  other: "Size nasıl yardımcı olabileceğimizi kısaca yazın.",
};
// Tarih/misafir ve konaklama bölümleri yalnızca yeni bir plan için sorulur;
// konu değişince bu alanlara ait eski hatalar da kaldırılır.
const PLANNING_FIELDS = [
  "start",
  "end",
  "adults",
  "childAges",
  "rooms",
  "area",
  "budget",
];
const FIELD_ORDER = [
  "topic",
  "bookingRef",
  "start",
  "end",
  "adults",
  "childAges",
  "rooms",
  "area",
  "budget",
  "name",
  "phone",
  "email",
  "contactMethod",
  "contactTime",
  "message",
  "consent",
];
const initialForm = () => ({
  topic: "hotel",
  start: "",
  end: "",
  flexibleDates: false,
  adults: 2,
  childAges: [],
  rooms: 1,
  area: "",
  budget: "",
  bookingRef: "",
  name: "",
  phone: "",
  email: "",
  contactMethod: "phone",
  contactTime: "",
  message: "",
  consent: false,
  website: "",
});
const inRange = (value, min, max) =>
  Number.isInteger(value) && value >= min && value <= max;

function validate(form, today) {
  const errors = {};
  if (!values(TRAVEL_TOPICS).includes(form.topic))
    errors.topic = "Talebinizin konusunu seçin.";
  if (isPlanningTopic(form.topic)) {
    if (form.start || form.end) {
      if (!form.start) errors.start = "Giriş tarihini de seçin.";
      else if (form.start < today)
        errors.start = "Giriş tarihi bugünden önce olamaz.";
      if (!form.end) errors.end = "Çıkış tarihini de seçin.";
      else if (form.start && form.end <= form.start)
        errors.end = "Çıkış tarihi giriş tarihinden sonra olmalı.";
    }
    if (!inRange(form.adults, 1, MAX_GUESTS))
      errors.adults = `Yetişkin sayısı 1 ile ${MAX_GUESTS} arasında olmalı.`;
    if (form.childAges.some((age) => age === ""))
      errors.childAges = "Her çocuğun yaşını seçin; fiyat yaşa göre belirlenir.";
    if (!inRange(form.rooms, 1, MAX_GUESTS))
      errors.rooms = `Oda sayısı 1 ile ${MAX_GUESTS} arasında olmalı.`;
    else if (inRange(form.adults, 1, MAX_GUESTS) && form.rooms > form.adults)
      errors.rooms = "Her odada en az bir yetişkin kalmalı.";
  }
  if (needsMessageTopic(form.topic) && !form.message.trim())
    errors.message = messagePlaceholders[form.topic];
  const name = form.name.trim();
  if (name.length < 2 || name.length > 120)
    errors.name = "Adınızı ve soyadınızı yazın.";
  if (!PHONE_PATTERN.test(form.phone.trim()))
    errors.phone = "Telefon numaranızı kontrol edin. Örnek: 0532 123 45 67";
  const email = form.email.trim();
  if (email && (email.length > 180 || !EMAIL_PATTERN.test(email)))
    errors.email = "Geçerli bir e-posta adresi yazın.";
  else if (!email && form.contactMethod === "email")
    errors.email = "E-posta ile dönüş için e-posta adresinizi yazın.";
  if (!form.consent)
    errors.consent = "Talebinizi iletebilmemiz için onay kutusunu işaretleyin.";
  return errors;
}

const SERVER_FIELD_MESSAGES = {
  topic: "Talebinizin konusunu seçin.",
  bookingRef: "Rezervasyon numarası en fazla 40 karakter olabilir.",
  start: "Geçerli bir giriş tarihi seçin.",
  end: "Geçerli bir çıkış tarihi seçin.",
  adults: `Yetişkin sayısı 1 ile ${MAX_GUESTS} arasında olmalı.`,
  childAges: "Çocuk yaşlarını kontrol edin.",
  rooms: `Oda sayısı 1 ile ${MAX_GUESTS} arasında olmalı.`,
  area: "Listeden bir bölge seçin.",
  budget: "Listeden bir bütçe seçin.",
  name: "Adınızı ve soyadınızı yazın.",
  phone: "Telefon numaranızı kontrol edin. Örnek: 0532 123 45 67",
  email: "Geçerli bir e-posta adresi yazın.",
  contactMethod: "Size hangi yoldan dönmemizi istediğinizi seçin.",
  contactTime: "Listeden bir zaman aralığı seçin.",
  message: "Mesajınız en fazla 4000 karakter olabilir.",
  consent: "Talebinizi iletebilmemiz için onay kutusunu işaretleyin.",
};
// Sunucu alan hatalarını formdaki alanlara eşler; metinler formun kendi
// Türkçe açıklamalarıdır, bilinmeyen alanlar genel hata metnine eklenir.
function serverErrors(fields = [], form) {
  const local = validate({ ...form, consent: true }, "");
  const mapped = {};
  const extra = [];
  for (const item of Array.isArray(fields) ? fields : []) {
    const key = String(item?.field || "").split(".")[0];
    if (FIELD_ORDER.includes(key))
      mapped[key] ||= local[key] || SERVER_FIELD_MESSAGES[key];
    else if (item?.message) extra.push(item.message);
  }
  return { mapped, extra };
}

function payload(form, requestId) {
  const body = {
    form: "travel",
    requestId,
    topic: form.topic,
    name: form.name.trim(),
    phone: form.phone.trim(),
    email: form.email.trim(),
    contactMethod: form.contactMethod,
    contactTime: form.contactMethod === "email" ? "" : form.contactTime,
    message: form.message.trim(),
    consent: form.consent,
    website: form.website,
  };
  if (isPlanningTopic(form.topic))
    Object.assign(body, {
      start: form.start,
      end: form.end,
      flexibleDates: form.flexibleDates,
      adults: form.adults,
      childAges: form.childAges.map(Number),
      rooms: form.rooms,
      area: form.area,
      budget: form.budget,
    });
  if (form.topic === "existing") body.bookingRef = form.bookingRef.trim();
  return body;
}

// Native date controls can emit input before committing change (including WebKit).
function DateInput({ onChange, ...props }) {
  return (
    <input type="date" {...props} onInput={onChange} onChange={onChange} />
  );
}

function FieldError({ id, children }) {
  if (!children) return null;
  return (
    <p className="field-error" id={id}>
      <WarningCircle size={15} />
      {children}
    </p>
  );
}

function Stepper({ id, label, hint, value, min, max, onChange, error }) {
  const number = Number.isInteger(value) ? value : min;
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={`stepper ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>
        <strong>{label}</strong>
        {hint && <small id={`${id}-hint`}>{hint}</small>}
      </label>
      <div className="stepper-controls">
        <button
          type="button"
          disabled={number <= min}
          aria-label={`${label} sayısını azalt`}
          aria-controls={id}
          onClick={() => onChange(Math.max(min, number - 1))}
        >
          <Minus size={16} />
        </button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step={1}
          value={value}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          onChange={(event) => {
            const next = event.target.value;
            onChange(next === "" ? "" : Math.trunc(Number(next)));
          }}
          onBlur={() =>
            onChange(Math.min(max, Math.max(min, Number(value) || min)))
          }
        />
        <button
          type="button"
          disabled={number >= max}
          aria-label={`${label} sayısını artır`}
          aria-controls={id}
          onClick={() => onChange(Math.min(max, number + 1))}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}

function StepTitle({ number, children }) {
  return (
    <legend className="contact-step">
      <span aria-hidden="true">{number}</span>
      {children}
    </legend>
  );
}

export default function ContactForm() {
  const uid = useId();
  const id = (name) => `${uid}-${name}`;
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [summary, setSummary] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(null);
  const requestId = useRef(null);
  const formRef = useRef(null);
  const successRef = useRef(null);
  const summaryRef = useRef(null);
  // Odak, ilgili hata veya sonuç ekrana çizildikten sonra taşınır.
  const focusRequest = useRef(null);
  const today = localDate();
  const planning = isPlanningTopic(form.topic);
  const messageRequired = needsMessageTopic(form.topic);
  const emailRequired = form.contactMethod === "email";

  const set = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));
    if (errors[name])
      setErrors((current) => {
        const next = { ...current };
        delete next[name];
        return next;
      });
  };
  // Yeni konuda sorulmayan ya da zorunlu olmayan alanların hataları kalkar;
  // alan hatası kalmadıysa üstteki uyarı da kapanır. Alan hatası olmayan
  // bağlantı uyarıları konu değişince kaybolmaz.
  const changeTopic = (topic) => {
    setForm((current) => ({ ...current, topic }));
    const stale = ["topic"];
    if (!needsMessageTopic(topic)) stale.push("message");
    if (!isPlanningTopic(topic)) stale.push(...PLANNING_FIELDS);
    if (topic !== "existing") stale.push("bookingRef");
    const next = { ...errors };
    let removed = false;
    for (const name of stale)
      if (name in next) {
        delete next[name];
        removed = true;
      }
    // "Mevcut rezervasyon" ile "Diğer" arasında geçişte zorunlu mesaj uyarısı
    // yeni konunun yönlendirmesini gösterir.
    if (next.message && next.message === messagePlaceholders[form.topic])
      next.message = messagePlaceholders[topic];
    setErrors(next);
    if (!Object.keys(next).length && (removed || summary === CHECK_FIELDS))
      setSummary("");
  };
  const describe = (name, hintId) =>
    [hintId, errors[name] && id(`${name}-error`)]
      .filter(Boolean)
      .join(" ") || undefined;
  const invalid = (name) => (errors[name] ? true : undefined);

  const fieldElement = (name) => {
    const root = formRef.current;
    if (!root) return null;
    if (name === "topic" || name === "contactMethod")
      return root.querySelector(
        `input[name="${CSS.escape(id(name))}"]:checked`,
      );
    if (name === "childAges") {
      const index = form.childAges.findIndex((age) => age === "");
      return document.getElementById(id(`age-${Math.max(0, index)}`));
    }
    return document.getElementById(id(name));
  };
  useEffect(() => {
    const request = focusRequest.current;
    if (!request) return;
    focusRequest.current = null;
    let target;
    if (request === "success") target = successRef.current;
    else if (request === "reset")
      target = formRef.current?.querySelector("input:checked");
    else
      target =
        FIELD_ORDER.filter((name) => request[name])
          .map(fieldElement)
          .find(Boolean) || summaryRef.current;
    target?.focus();
  });

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    const found = validate(form, localDate());
    setErrors(found);
    if (Object.keys(found).length) {
      setSummary(CHECK_FIELDS);
      focusRequest.current = found;
      return;
    }
    setSummary("");
    setBusy(true);
    try {
      requestId.current ||= newRequestId();
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload(form, requestId.current)),
      });
      let result = {};
      try {
        result = await response.json();
      } catch {}
      if (!response.ok || !result.reference) {
        const { mapped, extra } = serverErrors(result.fields, form);
        setErrors(mapped);
        setSummary(
          [
            result.error || "Talebiniz gönderilemedi. Lütfen tekrar deneyin.",
            ...extra,
          ].join(" "),
        );
        focusRequest.current = mapped;
        return;
      }
      setSuccess({ reference: result.reference, method: form.contactMethod });
      focusRequest.current = "success";
    } catch {
      setSummary(
        "Bağlantı kurulamadı. İnternet bağlantınızı kontrol edip tekrar deneyin.",
      );
      focusRequest.current = {};
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    requestId.current = null;
    setForm(initialForm());
    setErrors({});
    setSummary("");
    setSuccess(null);
    focusRequest.current = "reset";
  }

  const setChildren = (count) =>
    setForm((current) => ({
      ...current,
      childAges:
        count === ""
          ? current.childAges
          : Array.from(
              { length: Math.min(MAX_CHILDREN, Math.max(0, count)) },
              (_, i) => current.childAges[i] ?? "",
            ),
    }));

  let step = 0;
  return (
    <section
      className="contact-form-card"
      id="iletisim-formu"
      aria-labelledby={id("title")}
    >
      <div className="contact-form-head">
        <h2 id={id("title")}>Tatil talebinizi yazın</h2>
        <p>
          Tarih, misafir ve çocuk yaşlarını paylaşırsanız size uygun otel ve
          fiyat seçenekleriyle daha hızlı dönebiliriz.
        </p>
      </div>
      <div aria-live="polite">
        {success && (
          <div className="contact-success" tabIndex={-1} ref={successRef}>
            <CheckCircle size={34} weight="duotone" />
            <h3>Talebiniz alındı.</h3>
            <p className="contact-reference">
              Takip numaranız <strong>{success.reference}</strong>
            </p>
            <p>
              Ekibimiz {methodReply[success.method] || "en kısa sürede"} size
              dönüş yapacak. Bu işlem rezervasyon onayı değildir; kesin fiyat ve
              müsaitlik görüşmede netleşir.
            </p>
            <p>
              Beklemek istemezseniz{" "}
              <a href={`tel:${AGENCY.tel}`}>{AGENCY.phoneDisplay}</a>{" "}
              numarasından bize ulaşabilirsiniz.
            </p>
            <button
              type="button"
              className="button button-secondary"
              onClick={reset}
            >
              <ArrowCounterClockwise size={18} />
              Yeni talep oluştur
            </button>
          </div>
        )}
      </div>
      {!success && (
        <form
          ref={formRef}
          className="contact-form"
          onSubmit={submit}
          noValidate
          aria-busy={busy}
        >
          {summary && (
            <div
              className="contact-summary"
              role="alert"
              tabIndex={-1}
              ref={summaryRef}
            >
              <WarningCircle size={20} />
              <p>{summary}</p>
            </div>
          )}

          <fieldset className="contact-fieldset">
            <StepTitle number={++step}>Size nasıl yardımcı olalım?</StepTitle>
            <div className="topic-options">
              {TRAVEL_TOPICS.map(([value, label]) => {
                const Icon = topicIcons[value] || ChatCircleDots;
                return (
                  <label className="topic-option" key={value}>
                    <input
                      type="radio"
                      name={id("topic")}
                      value={value}
                      checked={form.topic === value}
                      onChange={() => changeTopic(value)}
                    />
                    <span>
                      <Icon size={22} />
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
            <FieldError id={id("topic-error")}>{errors.topic}</FieldError>
            {form.topic === "existing" && (
              <div className="contact-field booking-ref">
                <label htmlFor={id("bookingRef")}>
                  Rezervasyon veya takip numarası{" "}
                  <span className="optional">(varsa)</span>
                </label>
                <input
                  id={id("bookingRef")}
                  maxLength={40}
                  autoComplete="off"
                  placeholder="Örnek: EKO-3F9A1C2B7D"
                  value={form.bookingRef}
                  aria-invalid={invalid("bookingRef")}
                  aria-describedby={describe("bookingRef")}
                  onChange={(event) => set("bookingRef", event.target.value)}
                />
                <FieldError id={id("bookingRef-error")}>
                  {errors.bookingRef}
                </FieldError>
              </div>
            )}
          </fieldset>

          {planning && (
            <fieldset className="contact-fieldset">
              <StepTitle number={++step}>Tarih ve misafirler</StepTitle>
              <div className="contact-grid contact-dates">
                <div className="contact-field">
                  <label htmlFor={id("start")}>
                    {form.topic === "tour" ? "Başlangıç tarihi" : "Giriş tarihi"}
                  </label>
                  <DateInput
                    id={id("start")}
                    min={today}
                    value={form.start}
                    aria-invalid={invalid("start")}
                    aria-describedby={describe("start", id("dates-hint"))}
                    onChange={(event) => {
                      const value = event.target.value;
                      setForm((current) => ({
                        ...current,
                        start: value,
                        end:
                          current.end && value && current.end <= value
                            ? ""
                            : current.end,
                      }));
                      setErrors(({ start, end, ...rest }) => rest);
                    }}
                  />
                  <FieldError id={id("start-error")}>{errors.start}</FieldError>
                </div>
                <div className="contact-field">
                  <label htmlFor={id("end")}>Çıkış tarihi</label>
                  <DateInput
                    id={id("end")}
                    min={form.start ? dayAfter(form.start) : dayAfter(today)}
                    value={form.end}
                    aria-invalid={invalid("end")}
                    aria-describedby={describe("end", id("dates-hint"))}
                    onChange={(event) => set("end", event.target.value)}
                  />
                  <FieldError id={id("end-error")}>{errors.end}</FieldError>
                </div>
              </div>
              <p className="contact-hint" id={id("dates-hint")}>
                Tarihiniz belli değilse boş bırakabilirsiniz.
              </p>
              <label className="contact-check">
                <input
                  type="checkbox"
                  checked={form.flexibleDates}
                  onChange={(event) =>
                    set("flexibleDates", event.target.checked)
                  }
                />
                <span>Tarihlerim esnek</span>
              </label>
              <div className="stepper-group">
                <Stepper
                  id={id("adults")}
                  label="Yetişkin"
                  hint="18 yaş ve üzeri"
                  value={form.adults}
                  min={1}
                  max={MAX_GUESTS}
                  error={errors.adults}
                  onChange={(value) => set("adults", value)}
                />
                <Stepper
                  id={id("children")}
                  label="Çocuk"
                  hint="0–17 yaş"
                  value={form.childAges.length}
                  min={0}
                  max={MAX_CHILDREN}
                  onChange={setChildren}
                />
                <Stepper
                  id={id("rooms")}
                  label="Oda"
                  hint="Kaç oda?"
                  value={form.rooms}
                  min={1}
                  max={MAX_GUESTS}
                  error={errors.rooms}
                  onChange={(value) => set("rooms", value)}
                />
              </div>
              <FieldError id={id("adults-error")}>{errors.adults}</FieldError>
              <FieldError id={id("rooms-error")}>{errors.rooms}</FieldError>
              {form.childAges.length > 0 && (
                <div
                  className="contact-ages"
                  role="group"
                  aria-labelledby={id("ages-title")}
                >
                  <p id={id("ages-title")}>
                    <Info size={16} />
                    Çocuk yaşları fiyatı belirler. Her çocuk için giriş
                    tarihindeki yaşı seçin.
                  </p>
                  <div className="contact-ages-grid">
                    {form.childAges.map((age, index) => (
                      <div className="contact-field" key={index}>
                        <label htmlFor={id(`age-${index}`)}>
                          {index + 1}. çocuk
                        </label>
                        <select
                          id={id(`age-${index}`)}
                          required
                          value={age}
                          aria-invalid={
                            errors.childAges && age === "" ? true : undefined
                          }
                          aria-describedby={
                            errors.childAges ? id("childAges-error") : undefined
                          }
                          onChange={(event) => {
                            const value = event.target.value;
                            setForm((current) => {
                              const childAges = [...current.childAges];
                              childAges[index] = value;
                              return { ...current, childAges };
                            });
                            if (errors.childAges)
                              setErrors(({ childAges, ...rest }) => rest);
                          }}
                        >
                          <option value="">Yaş seçin</option>
                          {Array.from({ length: 18 }, (_, n) => (
                            <option key={n} value={n}>
                              {n} yaş
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <FieldError id={id("childAges-error")}>
                    {errors.childAges}
                  </FieldError>
                </div>
              )}
            </fieldset>
          )}

          {planning && (
            <fieldset className="contact-fieldset">
              <StepTitle number={++step}>Konaklama tercihi</StepTitle>
              <div className="contact-grid">
                <div className="contact-field">
                  <label htmlFor={id("area")}>Tercih ettiğiniz bölge</label>
                  <select
                    id={id("area")}
                    value={form.area}
                    onChange={(event) => set("area", event.target.value)}
                  >
                    {TRAVEL_AREAS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="contact-field">
                  <label htmlFor={id("budget")}>Gecelik bütçe</label>
                  <select
                    id={id("budget")}
                    value={form.budget}
                    onChange={(event) => set("budget", event.target.value)}
                  >
                    {TRAVEL_BUDGETS.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>
          )}

          <fieldset className="contact-fieldset">
            <StepTitle number={++step}>Size nasıl ulaşalım?</StepTitle>
            <div className="contact-grid">
              <div className="contact-field">
                <label htmlFor={id("name")}>Adınız soyadınız</label>
                <input
                  id={id("name")}
                  autoComplete="name"
                  required
                  minLength={2}
                  maxLength={120}
                  value={form.name}
                  aria-invalid={invalid("name")}
                  aria-describedby={describe("name")}
                  onChange={(event) => set("name", event.target.value)}
                />
                <FieldError id={id("name-error")}>{errors.name}</FieldError>
              </div>
              <div className="contact-field">
                <label htmlFor={id("phone")}>Telefon</label>
                <input
                  id={id("phone")}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                  maxLength={25}
                  placeholder="05xx xxx xx xx"
                  value={form.phone}
                  aria-invalid={invalid("phone")}
                  aria-describedby={describe("phone")}
                  onChange={(event) => set("phone", event.target.value)}
                />
                <FieldError id={id("phone-error")}>{errors.phone}</FieldError>
              </div>
            </div>
            <div className="contact-field">
              <span className="contact-label" id={id("method-label")}>
                Size hangi yoldan dönelim?
              </span>
              <div
                className="method-options"
                role="radiogroup"
                aria-labelledby={id("method-label")}
              >
                {CONTACT_METHODS.map(([value, label]) => {
                  const Icon = methodIcons[value] || Phone;
                  return (
                    <label className="method-option" key={value}>
                      <input
                        type="radio"
                        name={id("contactMethod")}
                        value={value}
                        checked={form.contactMethod === value}
                        onChange={() => {
                          set("contactMethod", value);
                          if (value !== "email" && !form.email.trim())
                            setErrors(({ email, ...rest }) => rest);
                        }}
                      />
                      <span>
                        <Icon size={19} />
                        {label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
            <div className="contact-grid">
              <div className="contact-field">
                <label htmlFor={id("email")}>
                  E-posta{" "}
                  {!emailRequired && (
                    <span className="optional">(isteğe bağlı)</span>
                  )}
                </label>
                <input
                  id={id("email")}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  required={emailRequired}
                  maxLength={180}
                  value={form.email}
                  aria-invalid={invalid("email")}
                  aria-describedby={describe("email")}
                  onChange={(event) => set("email", event.target.value)}
                />
                <FieldError id={id("email-error")}>{errors.email}</FieldError>
              </div>
              {!emailRequired && (
                <div className="contact-field">
                  <label htmlFor={id("contactTime")}>
                    Size ne zaman ulaşalım?
                  </label>
                  <select
                    id={id("contactTime")}
                    value={form.contactTime}
                    onChange={(event) =>
                      set("contactTime", event.target.value)
                    }
                  >
                    {CONTACT_TIMES.map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </fieldset>

          <fieldset className="contact-fieldset">
            <StepTitle number={++step}>
              {messageRequired ? "Mesajınız" : "Eklemek istedikleriniz"}
            </StepTitle>
            <div className="contact-field">
              <label htmlFor={id("message")} className="sr-only">
                {messageRequired
                  ? "Mesajınız"
                  : "Eklemek istedikleriniz (isteğe bağlı)"}
              </label>
              <textarea
                id={id("message")}
                rows={4}
                maxLength={4000}
                required={messageRequired}
                placeholder={messagePlaceholders[form.topic]}
                value={form.message}
                aria-invalid={invalid("message")}
                aria-describedby={describe("message")}
                onChange={(event) => set("message", event.target.value)}
              />
              <FieldError id={id("message-error")}>{errors.message}</FieldError>
            </div>
            <label className="contact-trap" aria-hidden="true">
              Web sitesi
              <input
                tabIndex={-1}
                autoComplete="off"
                value={form.website}
                onChange={(event) => set("website", event.target.value)}
              />
            </label>
            <label
              className={`contact-check contact-consent ${errors.consent ? "has-error" : ""}`}
            >
              <input
                id={id("consent")}
                type="checkbox"
                required
                checked={form.consent}
                aria-invalid={invalid("consent")}
                aria-describedby={describe("consent")}
                onChange={(event) => set("consent", event.target.checked)}
              />
              <span>
                {/* Metin yeni sekmede açılır; aynı sekmede gezinmek formu ve
                    yazılanları sıfırlardı. */}
                <a
                  href="/kvkk-aydinlatma"
                  target="_blank"
                  rel="noopener"
                  aria-describedby={id("kvkk-new-tab")}
                >
                  KVKK Aydınlatma Metni
                </a>
                ’ni okudum; talebimin yanıtlanması için iletişim bilgilerimin
                kullanılmasını kabul ediyorum.
              </span>
            </label>
            <span hidden id={id("kvkk-new-tab")}>Yeni sekmede açılır.</span>
            <FieldError id={id("consent-error")}>{errors.consent}</FieldError>
          </fieldset>

          <div className="contact-submit">
            <button type="submit" className="button" disabled={busy}>
              <PaperPlaneTilt size={20} />
              {busy ? "Gönderiliyor…" : "Talebimi gönder"}
            </button>
            <p>
              <Info size={16} />
              Bu form rezervasyon oluşturmaz. Fiyat ve müsaitlik size dönüşte
              netleşir.
            </p>
          </div>
        </form>
      )}
    </section>
  );
}
