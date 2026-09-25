import React, { useState, useEffect, useRef } from "react";
import { EnvelopeSimple, Calculator, CheckCircle } from "@phosphor-icons/react";
const money = (v, c) =>
  new Intl.NumberFormat("tr-TR", { style: "currency", currency: c }).format(v);
export default function InquiryPanel({
  item,
  type,
  start,
  end,
  adults,
  children: childCount,
  ages,
}) {
  const [roomId, setRoomId] = useState(""),
    [quote, setQuote] = useState(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [calculating, setCalculating] = useState(false),
    [success, setSuccess] = useState("");
  const requestId = useRef(null),
    sequence = useRef(0);
  const [contact, setContact] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
    consent: false,
    website: "",
  });
  const signature = JSON.stringify([
    start,
    end,
    adults,
    childCount,
    ages,
    roomId,
  ]);
  useEffect(() => {
    sequence.current++;
    setQuote(null);
    setCalculating(false);
  }, [signature]);
  async function post(path, body) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "İşlem tamamlanamadı.");
    return result;
  }
  const guests = () => {
    if (
      ages.slice(0, childCount).length !== childCount ||
      ages.slice(0, childCount).some((a) => a === "" || a === undefined)
    )
      throw new Error("Yukarıdan her çocuğun yaşını seçin.");
    return {
      start,
      end,
      adults,
      childAges: ages.slice(0, childCount).map(Number),
      roomId,
    };
  };
  async function calculate() {
    setError("");
    const current = ++sequence.current;
    setCalculating(true);
    try {
      const result = await post("/api/quote", { slug: item.slug, ...guests() });
      if (current === sequence.current) setQuote(result);
    } catch (e) {
      if (current === sequence.current) setError(e.message);
    } finally {
      if (current === sequence.current) setCalculating(false);
    }
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      requestId.current ||= crypto.randomUUID();
      const result = await post("/api/inquiries", {
        ...contact,
        ...guests(),
        kind: type === "otel" ? "hotel" : "tour",
        slug: item.slug,
        requestId: requestId.current,
      });
      setSuccess(result.reference);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="inquiry-panel">
      {type === "otel" && !!item.rooms?.length && (
        <div className="stay-calculator">
          <h3>
            <Calculator size={20} />
            Oda ve dönem fiyatı
          </h3>
          <label>
            Oda tipi
            <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
              <option value="">Oda seçin</option>
              {item.rooms.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · en fazla {r.capacity} kişi
                </option>
              ))}
            </select>
          </label>
          <button
            className="button secondary full"
            type="button"
            disabled={calculating || !roomId || !start || !end}
            onClick={calculate}
          >
            {calculating ? "Hesaplanıyor…" : "Seçili tarihler için hesapla"}
          </button>
          {quote && (
            <div role="status" className="stay-quote">
              {quote.available && (
                <>
                  <strong>{money(quote.total, quote.currency)}</strong>
                  <span>
                    {quote.nights} gece · {quote.room}
                  </span>
                  <details>
                    <summary>Gecelik hesap dökümü</summary>
                    {quote.lines.map((l) => (
                      <div key={l.date}>
                        <span>{l.date}</span>
                        <b>{money(l.amount, quote.currency)}</b>
                      </div>
                    ))}
                  </details>
                </>
              )}
              <p>{quote.message}</p>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {success ? (
        <div className="inquiry-success" role="status">
          <CheckCircle size={28} />
          <h3>Talebiniz alındı.</h3>
          <p>
            Takip numaranız: <strong>{success}</strong>
          </p>
          <p>
            Ekibimiz verdiğiniz iletişim bilgileriyle size dönüş yapacak. Bu
            işlem rezervasyon onayı değildir.
          </p>
        </div>
      ) : (
        <details className="inquiry-contact">
          <summary>
            <EnvelopeSimple size={21} />
            Beni arayın, teklif almak istiyorum
          </summary>
          <form onSubmit={submit}>
            <p>Yukarıdaki tarih ve misafir bilgileri talebinize eklenir.</p>
            <label>
              Adınız soyadınız
              <input
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                value={contact.name}
                onChange={(e) =>
                  setContact((c) => ({ ...c, name: e.target.value }))
                }
              />
            </label>
            <label>
              Telefon
              <input
                type="tel"
                autoComplete="tel"
                required
                minLength={7}
                maxLength={25}
                value={contact.phone}
                onChange={(e) =>
                  setContact((c) => ({ ...c, phone: e.target.value }))
                }
              />
            </label>
            <label>
              E-posta (isteğe bağlı)
              <input
                type="email"
                autoComplete="email"
                maxLength={180}
                value={contact.email}
                onChange={(e) =>
                  setContact((c) => ({ ...c, email: e.target.value }))
                }
              />
            </label>
            <label>
              Eklemek istedikleriniz
              <textarea
                maxLength={4000}
                value={contact.message}
                onChange={(e) =>
                  setContact((c) => ({ ...c, message: e.target.value }))
                }
              />
            </label>
            <label className="inquiry-trap" aria-hidden="true">
              Web sitesi
              <input
                tabIndex={-1}
                autoComplete="off"
                value={contact.website}
                onChange={(e) =>
                  setContact((c) => ({ ...c, website: e.target.value }))
                }
              />
            </label>
            <label className="inquiry-consent">
              <input
                type="checkbox"
                required
                checked={contact.consent}
                onChange={(e) =>
                  setContact((c) => ({ ...c, consent: e.target.checked }))
                }
              />
              <span>
                Talebimin yanıtlanması için iletişim bilgilerimin kullanılmasını
                kabul ediyorum.
              </span>
            </label>
            <button type="submit" className="button full" disabled={busy}>
              {busy ? "Gönderiliyor…" : "Teklif talebini gönder"}
            </button>
          </form>
        </details>
      )}
    </div>
  );
}
