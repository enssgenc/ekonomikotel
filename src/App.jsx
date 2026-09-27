import InquiryPanel from "./InquiryPanel.jsx";
import ContactForm from "./ContactForm.jsx";
import { AGENCY, DATA_CONTROLLER, whatsappUrl } from "./lib/agency.js";
import { defaultHomepage } from "./lib/homepage.js";
import React, {
  createContext,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bed,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  Check,
  CheckCircle,
  Compass,
  Heart,
  Heartbeat,
  Images,
  MapPin,
  MagnifyingGlass,
  Minus,
  Phone,
  Plus,
  ShieldCheck,
  SlidersHorizontal,
  SuitcaseRolling,
  Users,
  WhatsappLogo,
  X,
  List,
  WifiHigh,
  Coffee,
  Car,
  SwimmingPool,
  Sparkle,
  Barbell,
  Baby,
  Info,
  SunHorizon,
  Moon,
  Buildings,
} from "@phosphor-icons/react";
import { useCatalog } from "./CatalogContext.jsx";

const normal = (value = "") =>
  String(value)
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("ı", "i");
const clean = (value = "") => String(value).replaceAll("—", "–");
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
const dateText = (value) =>
  value
    ? new Intl.DateTimeFormat("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(`${value}T12:00:00`))
    : "";
const defaultDistricts = [
  "Göreme",
  "Ürgüp",
  "Uçhisar",
  "Avanos",
  "Ortahisar",
  "Çavuşin",
  "Mustafapaşa",
  "Nevşehir",
];
const facilityIcons = {
  wifi: WifiHigh,
  breakfast: Coffee,
  park: Car,
  pool: SwimmingPool,
  spa: Sparkle,
  fitness: Barbell,
  kids: Baby,
};
const Favorites = createContext();

function readFavorites() {
  try {
    const value = JSON.parse(
      localStorage.getItem("ekonomikotel:favorites") || "[]",
    );
    return Array.isArray(value)
      ? value.filter((id) => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}
function FavoriteButton({ hotel, className = "" }) {
  const { favorites, toggle } = useContext(Favorites);
  const active = favorites.includes(hotel.slug);
  return (
    <button
      type="button"
      className={`favorite ${active ? "is-saved" : ""} ${className}`}
      aria-pressed={active}
      aria-label={`${hotel.name} ${active ? "favorilerden çıkar" : "favorilere ekle"}`}
      onClick={() => toggle(hotel.slug)}
    >
      <Heart weight={active ? "fill" : "regular"} size={22} />
    </button>
  );
}
function IconLabel({ icon: Icon, children }) {
  return (
    <span className="icon-label">
      <Icon size={18} />
      {children}
    </span>
  );
}
function Amenities({ list, limit = 4 }) {
  const { amenities } = useCatalog();
  return (
    <div className="amenities">
      {list.slice(0, limit).map((key) => {
        const Icon = facilityIcons[key] || Check;
        return (
          <IconLabel key={key} icon={Icon}>
            {amenities[key] || key}
          </IconLabel>
        );
      })}
    </div>
  );
}
function ButtonLink({ to, children, secondary = false, ...props }) {
  return (
    <Link
      className={`button ${secondary ? "button-secondary" : ""}`}
      to={to}
      {...props}
    >
      {children}
      <ArrowRight size={19} />
    </Link>
  );
}
function Heading({ title, copy, to, label = "Tümünü gör" }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {copy && <p>{copy}</p>}
      </div>
      {to && (
        <Link className="text-link" to={to}>
          {label}
          <ArrowRight size={19} />
        </Link>
      )}
    </div>
  );
}
function Header() {
  const { favorites } = useContext(Favorites);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef(null);
  useEffect(() => setOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape" && open) {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <a className="skip-link" href="#main">
        İçeriğe geç
      </a>
      <div className="utility">
        <div className="shell">
          <span>Tatilin en güzel hali, iyi bir planla başlar.</span>
          <a href={`tel:${AGENCY.tel}`}>
            <Phone size={14} />
            <span>Bilgi ve rezervasyon</span>
            <strong>{AGENCY.phoneDisplay}</strong>
          </a>
        </div>
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link to="/" className="brand" aria-label="Ekonomikotel ana sayfa">
            ekonomik<span>otel</span>
            <span className="brand-dot" aria-hidden="true">
              .
            </span>
          </Link>
          <nav
            id="main-nav"
            className={`nav ${open ? "is-open" : ""}`}
            aria-label="Ana menü"
          >
            <NavLink to="/oteller">Oteller</NavLink>
            <NavLink to="/turlar">Turlar</NavLink>
            <NavLink to="/rehber">Kapadokya’yı keşfet</NavLink>
            <a className="health-nav" href="/saglik-turizmi/">
              <Heartbeat size={18} />
              Sağlık Turizmi
              <ArrowUpRight size={14} />
            </a>
          </nav>
          <div className="header-actions">
            <NavLink
              to="/favoriler"
              className="saved-nav"
              aria-label={`Favorilerim, ${favorites.length} otel`}
            >
              <Heart size={21} />
              <span>Favorilerim</span>
              {favorites.length > 0 && <b>{favorites.length}</b>}
            </NavLink>
            <button
              className="menu-button icon-button"
              ref={toggleRef}
              aria-controls="main-nav"
              aria-expanded={open}
              aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
              onClick={() => setOpen(!open)}
            >
              {open ? <X /> : <List />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
function TursabLink() {
  return (
    <a
      className="tursab-link"
      href={AGENCY.tursabVerifyUrl}
      target="_blank"
      rel="noopener noreferrer"
    >
      <ShieldCheck size={15} />
      <span>
        TÜRSAB Belge No:{" "}
        <span className="tursab-no">{AGENCY.tursabNo}</span> ·{" "}
        {AGENCY.tursabGroup}
      </span>
      <span className="sr-only">
        {" "}
        (TÜRSAB doğrulama sayfası yeni sekmede açılır)
      </span>
    </a>
  );
}
function Footer() {
  return (
    <footer>
      <div className="shell footer-top">
        <div>
          <Link to="/" className="brand">
            ekonomik<span>otel</span>.
          </Link>
          <p>
            Yeni yerler, güzel anılar.
            <br />
            Bir sonraki tatiliniz için buradayız.
          </p>
        </div>
        <div>
          <h3>Tatilini planla</h3>
          <Link to="/oteller">Kapadokya otelleri</Link>
          <Link to="/turlar">Kapadokya turları</Link>
          <Link to="/favoriler">Favori otellerim</Link>
        </div>
        <div>
          <h3>Keşfet</h3>
          <Link to="/rehber">Kapadokya rehberi</Link>
          <a href="/saglik-turizmi/">Sağlık turizmi</a>
          <Link to="/gorsel-kaynaklari">Görsel kaynakları</Link>
          <Link to="/kvkk-aydinlatma">KVKK Aydınlatma Metni</Link>
        </div>
        <div className="footer-contact">
          <h3>Birlikte planlayalım</h3>
          <a className="phone-link" href={`tel:${AGENCY.tel}`}>
            {AGENCY.phoneDisplay}
          </a>
          <Link to="/iletisim#iletisim-formu">
            İletişim formu
            <ArrowUpRight size={17} />
          </Link>
          <span>Fiyat ve müsaitlik için bize ulaşın.</span>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>
          © {new Date().getFullYear()} Ekonomikotel. Tüm hakları saklıdır.
        </span>
        <TursabLink />
        <span>Otel ve tur fiyatları seçilen tarihe göre belirlenir.</span>
      </div>
    </footer>
  );
}
function GuestPicker({ adults, children, onChange }) {
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const trigger = useRef(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const close = (event) => {
      if (!root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);
  return (
    <div
      className="guest-field"
      ref={root}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <span className="field-label">Misafir</span>
      <button
        ref={trigger}
        type="button"
        className="guest-trigger"
        aria-controls={id}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        <Users size={20} />
        <span>
          {adults} yetişkin{children > 0 && `, ${children} çocuk`}
        </span>
        <CaretDown size={15} />
      </button>
      {open && (
        <div className="guest-popover" id={id}>
          <div className="counter">
            <div>
              <strong>Yetişkin</strong>
              <small>18 yaş ve üzeri</small>
            </div>
            <div>
              <button
                type="button"
                disabled={adults <= 1}
                aria-label="Yetişkin sayısını azalt"
                onClick={() => onChange(adults - 1, children)}
              >
                <Minus size={16} />
              </button>
              <output aria-live="polite">{adults}</output>
              <button
                type="button"
                disabled={adults >= 8}
                aria-label="Yetişkin sayısını artır"
                onClick={() => onChange(adults + 1, children)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <div className="counter">
            <div>
              <strong>Çocuk</strong>
              <small>0–17 yaş</small>
            </div>
            <div>
              <button
                type="button"
                disabled={children <= 0}
                aria-label="Çocuk sayısını azalt"
                onClick={() => onChange(adults, children - 1)}
              >
                <Minus size={16} />
              </button>
              <output aria-live="polite">{children}</output>
              <button
                type="button"
                disabled={children >= 4}
                aria-label="Çocuk sayısını artır"
                onClick={() => onChange(adults, children + 1)}
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          <p>Çocuk yaşları fiyat talebinde sorulur.</p>
          <button
            type="button"
            className="button full"
            onClick={() => {
              setOpen(false);
              trigger.current?.focus();
            }}
          >
            Tamam
            <Check size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
// Native date controls can emit input before committing change (including WebKit).
// Handling both keeps the controlled value and dependent minimum date synchronized.
function DateInput({ onChange, ...props }) {
  return (
    <input type="date" {...props} onInput={onChange} onChange={onChange} />
  );
}
function SearchBox({ compact = false, initialKind = "otel" }) {
  const { hotels } = useCatalog();
  const districts = [
    ...new Set([...defaultDistricts, ...hotels.map((h) => h.district)]),
  ].filter(Boolean);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const id = useId();
  const [kind, setKind] = useState(initialKind);
  const [place, setPlace] = useState(params.get("q") || "Kapadokya");
  const [start, setStart] = useState(params.get("giris") || "");
  const [end, setEnd] = useState(params.get("cikis") || "");
  const [adults, setAdults] = useState(
    Math.min(8, Math.max(1, Number(params.get("yetiskin")) || 2)),
  );
  const [children, setChildren] = useState(
    Math.min(4, Math.max(0, Number(params.get("cocuk")) || 0)),
  );
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if ((start && !end) || (!start && end))
      return setError(
        "Giriş ve çıkış tarihini birlikte seçin veya ikisini de boş bırakın.",
      );
    if (start && (start < localDate() || end <= start))
      return setError(
        "Çıkış tarihi girişten sonra olmalı. Lütfen tarihlerinizi kontrol edin.",
      );
    setError("");
    const next = new URLSearchParams();
    if (place.trim()) next.set("q", place.trim());
    if (start) {
      next.set("giris", start);
      next.set("cikis", end);
    }
    next.set("yetiskin", adults);
    next.set("cocuk", children);
    navigate(`/${kind === "otel" ? "oteller" : "turlar"}?${next}`);
  };
  return (
    <div className={`search-box ${compact ? "compact" : ""}`}>
      <div className="search-tabs" aria-label="Arama türü">
        <button
          type="button"
          aria-pressed={kind === "otel"}
          className={kind === "otel" ? "selected" : ""}
          onClick={() => setKind("otel")}
        >
          <Bed size={20} />
          Otel
        </button>
        <button
          type="button"
          aria-pressed={kind === "tur"}
          className={kind === "tur" ? "selected" : ""}
          onClick={() => setKind("tur")}
        >
          <SuitcaseRolling size={20} />
          Tur & tatil paketi
        </button>
        <span>Bir sonraki güzel anıyı bul.</span>
      </div>
      <form onSubmit={submit} className="search-form">
        <label className="destination-field">
          <span className="field-label">Nereye gitmek istersiniz?</span>
          <div>
            <MapPin size={21} />
            <input
              list={`${id}-destinations`}
              value={place}
              onChange={(event) => setPlace(event.target.value)}
              placeholder="Bölge veya otel adı"
              autoComplete="off"
              aria-label="Bölge veya otel adı"
            />
            <datalist id={`${id}-destinations`}>
              <option value="Kapadokya" />
              {districts.map((d) => (
                <option key={d} value={d} />
              ))}
            </datalist>
          </div>
        </label>
        <label className="date-field">
          <span className="field-label">
            {kind === "tur" ? "Başlangıç tarihi" : "Giriş tarihi"}
          </span>
          <div>
            <CalendarBlank size={20} />
            <DateInput
              aria-label="Giriş tarihi"
              min={localDate()}
              value={start}
              onChange={(event) => {
                setStart(event.target.value);
                if (end && end <= event.target.value) setEnd("");
              }}
            />
          </div>
        </label>
        <label className="date-field">
          <span className="field-label">Çıkış tarihi</span>
          <div>
            <CalendarBlank size={20} />
            <DateInput
              aria-label="Çıkış tarihi"
              min={start ? dayAfter(start) : dayAfter(localDate())}
              value={end}
              onChange={(event) => setEnd(event.target.value)}
            />
          </div>
        </label>
        <GuestPicker
          adults={adults}
          children={children}
          onChange={(a, c) => {
            setAdults(a);
            setChildren(c);
          }}
        />
        <button className="button search-submit" type="submit">
          <MagnifyingGlass size={21} />
          {kind === "otel" ? "Otel ara" : "Tur ara"}
        </button>
      </form>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      {!compact && (
        <div className="popular-searches">
          <span>Popüler:</span>
          {["Göreme", "Ürgüp", "Uçhisar", "Avanos"].map((d) => (
            <Link key={d} to={`/oteller?q=${encodeURIComponent(d)}`}>
              {d}
              <ArrowUpRight size={12} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
function PriceSummary({ item }) {
  if (item.priceMode === "from" && item.fromPrice > 0)
    return (
      <span className="managed-price">
        <strong>
          {new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: item.currency || "TRY",
            maximumFractionDigits: 0,
          }).format(item.fromPrice)}
          <small>’den başlayan</small>
        </strong>
        <small>{item.priceUnit}</small>
      </span>
    );
  return <span className="managed-price">Tarihinize özel teklif</span>;
}
function HotelCard({ hotel, horizontal = false }) {
  const { hotels, amenities } = useCatalog();
  const location = useLocation();
  return (
    <article className={`hotel-card ${horizontal ? "horizontal" : ""}`}>
      <div className="hotel-image">
        <Link
          to={`/oteller/${hotel.slug}${location.search}`}
          tabIndex={-1}
          aria-hidden="true"
        >
          <img src={hotel.img} alt="" width="680" height="460" loading="lazy" />
        </Link>
        <FavoriteButton hotel={hotel} />
        <span className="hotel-type">{hotel.concept}</span>
        <span
          className="photo-count"
          aria-label={`${hotel.gallery.length} fotoğraf`}
        >
          <Images size={14} />
          {hotel.gallery.length}
        </span>
      </div>
      <div className="hotel-content">
        <p className="location">
          <MapPin size={14} />
          {hotel.district}, {hotel.city}
        </p>
        <h3>
          <Link to={`/oteller/${hotel.slug}${location.search}`}>
            {hotel.name}
          </Link>
        </h3>
        {horizontal && (
          <p className="hotel-description">{clean(hotel.blurb)}</p>
        )}
        <Amenities list={hotel.amenities} limit={horizontal ? 5 : 2} />
        <div className="hotel-bottom">
          <PriceSummary item={hotel} />
          <Link
            to={`/oteller/${hotel.slug}${location.search}`}
            aria-label={`${hotel.name} otelini incele`}
          >
            Oteli incele
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
function TourCard({ tour }) {
  const location = useLocation();
  return (
    <article className="tour-card">
      <Link
        to={`/turlar/${tour.slug}${location.search}`}
        className="tour-image"
        tabIndex={-1}
        aria-hidden="true"
      >
        <img src={tour.img} alt="" width="720" height="460" loading="lazy" />
      </Link>
      <div className="tour-content">
        <div className="tour-meta">
          <IconLabel icon={Moon}>{tour.duration}</IconLabel>
          <span>Konaklama + deneyim</span>
        </div>
        <h3>
          <Link to={`/turlar/${tour.slug}${location.search}`}>
            {tour.title}
          </Link>
        </h3>
        <p>
          Konaklama, rehberli Kırmızı Tur, ATV safari ve Türk Gecesi aynı
          planda.
        </p>
        <div className="tour-bottom">
          <PriceSummary item={tour} />
          <ButtonLink to={`/turlar/${tour.slug}${location.search}`} secondary>
            Paketi incele
          </ButtonLink>
        </div>
      </div>
    </article>
  );
}
function Home() {
  const { hotels, tours, hero, homepage = defaultHomepage } = useCatalog();
  const [featuredRegion, setFeaturedRegion] = useState("Tümü");
  const picks = [
    "kayakapi-premium-caves-cappadocia",
    "sacred-mansion-cappadocia",
    "cappadocia-symbol-hotel",
    "sacred-house-hotel",
  ]
    .map((id) => hotels.find((h) => h.slug === id))
    .filter(Boolean);
  const configuredHotels = (homepage.hotelSlugs || [])
    .map((slug) => hotels.find((h) => h.slug === slug))
    .filter(Boolean);
  const selectedPicks = configuredHotels.length
    ? configuredHotels
    : hotels.filter((h) => h.featured);
  const configuredTours = (homepage.tourSlugs || [])
    .map((slug) => tours.find((t) => t.slug === slug))
    .filter(Boolean);
  const homeTours = configuredTours.length
    ? configuredTours
    : tours.filter((t) => t.featured !== false).slice(0, 4);
  const featured =
    featuredRegion === "Tümü"
      ? selectedPicks.length
        ? selectedPicks.slice(0, configuredHotels.length ? 12 : 4)
        : picks.length
          ? picks
          : hotels.slice(0, 4)
      : hotels
          .filter((h) => normal(h.district).includes(normal(featuredRegion)))
          .slice(0, 4);
  return (
    <div className="home-page">
      <section className="hero">
        <img
          className="hero-photo"
          src={homepage.image}
          alt={homepage.imageAlt}
          width="1440"
          height="810"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="shell hero-content">
          <span className="hero-eyebrow">
            <MapPin size={15} /> {homepage.eyebrow}
          </span>
          <h1>
            {homepage.title}
            <br />
            <span>{homepage.accent}</span>
          </h1>
          <p>{homepage.description}</p>
          <a className="hero-link" href={homepage.link}>
            {homepage.linkLabel}
            <ArrowUpRight size={19} />
          </a>
        </div>
        <div className="hero-caption" aria-hidden="true">
          <SunHorizon size={25} />
          <span>
            Yeni bir gün.
            <br />
            <strong>Bambaşka bir manzara.</strong>
          </span>
        </div>
      </section>
      <div className="shell home-search">
        <SearchBox />
      </div>
      <div className="shell">
        {!!homepage.campaigns?.length && (
          <section className="home-campaigns" aria-label="Kampanyalar">
            {homepage.campaigns.map((c) => (
              <article key={c.id}>
                <img src={c.image} alt={c.title} loading="lazy" />
                <div>
                  <h2>{c.title}</h2>
                  <p>{c.description}</p>
                  <a href={c.link}>
                    {c.label}
                    <ArrowUpRight size={18} />
                  </a>
                </div>
              </article>
            ))}
          </section>
        )}
        <div className="discovery-strip">
          <Link to="/oteller">
            <Bed />
            <span>
              <strong>Size uygun konaklama</strong>
              <small>Butik, mağara ve şehir otelleri</small>
            </span>
            <ArrowUpRight />
          </Link>
          <Link to="/turlar">
            <Compass />
            <span>
              <strong>Bir pakette Kapadokya</strong>
              <small>Konaklama ve bölge deneyimleri</small>
            </span>
            <ArrowUpRight />
          </Link>
          <Link to="/iletisim">
            <Phone />
            <span>
              <strong>Birlikte planlayalım</strong>
              <small>Tatilinize özel bilgi ve teklif</small>
            </span>
            <ArrowUpRight />
          </Link>
        </div>
        <section className="section featured-section">
          <p className="section-eyebrow">KALMAYA DEĞER YERLER</p>
          <Heading
            title="Kapadokya’da bir yeriniz olsun."
            copy="Taşın hikâyesi, terasın manzarası, güne güzel bir başlangıç."
            to="/oteller"
            label={`${hotels.length} oteli keşfet`}
          />
          <div className="featured-toolbar">
            <div
              className="region-tabs"
              role="group"
              aria-label="Öne çıkan otelleri bölgeye göre göster"
            >
              {["Tümü", "Göreme", "Ürgüp", "Uçhisar", "Avanos"].map(
                (region) => (
                  <button
                    key={region}
                    type="button"
                    aria-pressed={featuredRegion === region}
                    onClick={() => setFeaturedRegion(region)}
                  >
                    {region}
                  </button>
                ),
              )}
            </div>
            <span className="swipe-hint">
              Kaydırarak keşfet <ArrowRight size={15} />
            </span>
          </div>
          <div
            className="hotel-grid featured-grid"
            key={featuredRegion}
            aria-label={`${featuredRegion} otel seçkisi`}
          >
            {featured.map((h) => (
              <HotelCard hotel={h} key={h.slug} />
            ))}
          </div>
        </section>
        <section className="section tours-section">
          <p className="section-eyebrow">BİR VALİZ, BİR SÜRÜ HİKÂYE</p>
          <Heading
            title="Az plan, çok Kapadokya."
            copy="Konaklamadan bölge turuna, aynı yolculukta buluşan deneyimler."
            to="/turlar"
            label="Turları keşfet"
          />
          <div className="tour-grid">
            {homeTours.map((t) => (
              <TourCard tour={t} key={t.slug} />
            ))}
          </div>
        </section>
        <DestinationSection />
        <section className="health-feature">
          <div className="health-feature-image">
            <img
              src="/saglik-turizmi/images/bright-clinical-consultation.webp"
              alt="Sağlık görüşmesini temsil eden editoryal görsel"
              width="900"
              height="700"
              loading="lazy"
            />
          </div>
          <div className="health-feature-content">
            <Heartbeat size={32} />
            <h2>
              Sağlığınıza ayrılan
              <br />
              bir yolculuk.
            </h2>
            <p>
              Tedavi alanlarını tanıyın, sağlık ve seyahat planlamasının
              adımlarını keşfedin.
            </p>
            <a className="button" href="/saglik-turizmi/">
              Sağlık turizmini keşfet
              <ArrowUpRight size={19} />
            </a>
            <small>
              Tıbbi değerlendirme ve tedavi kararı yetkili sağlık kuruluşuna
              aittir.
            </small>
          </div>
        </section>
        <HelpStrip />
      </div>
    </div>
  );
}
function DestinationSection() {
  const { hotels, hero } = useCatalog();
  const selected = ["Göreme", "Ürgüp", "Uçhisar", "Avanos"];
  return (
    <section className="section destinations-section">
      <p className="section-eyebrow">SİZİN KAPADOKYANIZ HANGİSİ?</p>
      <Heading
        title="Her köşesi başka bir hikâye."
        copy="Kalmak istediğiniz yeri seçin, Kapadokya’yı kendi ritminizde yaşayın."
      />
      <div className="destination-grid">
        {selected.map((d) => {
          const list = hotels.filter((h) =>
            normal(h.district).includes(normal(d)),
          );
          const hotel = list.find((h) => h.gallery.length > 3) || list[0];
          return (
            <Link
              className="destination-card"
              key={d}
              to={`/oteller?q=${encodeURIComponent(d)}`}
            >
              <img
                src={hotel?.img || hero}
                alt={`${d} bölgesinden ${hotel?.name || "Kapadokya"} görünümü`}
                width="500"
                height="400"
                loading="lazy"
              />
              <div>
                <h3>{d}</h3>
                <span>
                  {list.length} otel
                  <ArrowRight size={19} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
function HelpStrip() {
  return (
    <section className="help-strip">
      <div>
        <h2>Tatil planında bir el daha.</h2>
        <p>
          Otel veya tur seçiminizi birlikte netleştirelim.{" "}
          <Link className="help-form-link" to="/iletisim#iletisim-formu">
            Formu doldurun
            <ArrowRight size={15} />
          </Link>
        </p>
      </div>
      <a href={`tel:${AGENCY.tel}`}>
        <Phone size={25} />
        <span>
          <small>Bilgi ve rezervasyon</small>
          <strong>{AGENCY.phoneDisplay}</strong>
        </span>
        <ArrowUpRight size={21} />
      </a>
    </section>
  );
}
function CatalogPage({ saved = false }) {
  const { hotels, amenities } = useCatalog();
  const districts = [
    ...new Set([...defaultDistricts, ...hotels.map((h) => h.district)]),
  ].filter(Boolean);
  const [params, setParams] = useSearchParams();
  const { favorites } = useContext(Favorites);
  const [visible, setVisible] = useState(12);
  const [mobileFilters, setMobileFilters] = useState(false);
  const query = params.get("q") || "";
  const region = params.get("bolge") || "";
  const facilities = params.getAll("olanak");
  const sort = params.get("sirala") || "default";
  const result = useMemo(() => {
    let list = hotels.filter(
      (h) =>
        (!saved || favorites.includes(h.slug)) &&
        (!query ||
          normal(query) === "kapadokya" ||
          normal(`${h.name} ${h.district} ${h.city} ${h.concept}`).includes(
            normal(query),
          )) &&
        (!region || normal(h.district).includes(normal(region))) &&
        facilities.every((f) => h.amenities.includes(f)),
    );
    if (sort === "az") list.sort((a, b) => a.name.localeCompare(b.name, "tr"));
    if (sort === "za") list.sort((a, b) => b.name.localeCompare(a.name, "tr"));
    if (sort === "photos")
      list.sort((a, b) => b.gallery.length - a.gallery.length);
    return list;
  }, [query, region, facilities.join(","), sort, saved, favorites]);
  useEffect(() => setVisible(12), [query, region, facilities.join(","), sort]);
  const update = (key, value) => {
    const next = new URLSearchParams(params);
    next.delete(key);
    if (Array.isArray(value)) value.forEach((v) => next.append(key, v));
    else if (value) next.set(key, value);
    setParams(next, { preventScrollReset: true });
  };
  const clear = () => {
    const next = new URLSearchParams(params);
    ["q", "bolge", "olanak", "sirala"].forEach((k) => next.delete(k));
    setParams(next, { preventScrollReset: true });
  };
  return (
    <>
      <div className="catalog-search">
        <div className="shell">
          <SearchBox
            compact
            key={`${params.get("giris")}-${params.get("cikis")}-${params.get("q")}`}
          />
        </div>
      </div>
      <div className="shell catalog-page">
        <nav className="breadcrumb" aria-label="Sayfa yolu">
          <Link to="/">Ana sayfa</Link>
          <CaretRight size={12} />
          <span>{saved ? "Favorilerim" : "Kapadokya otelleri"}</span>
        </nav>
        <div className="page-heading">
          <div>
            <h1>
              {saved
                ? "Birlikte hayalini kurduklarınız."
                : "Kapadokya otelleri"}
            </h1>
            <p>
              {saved
                ? "Beğendiğiniz oteller burada, bir sonraki tatiliniz bir adım ötede."
                : "Mağara odalarından manzaralı teraslara, size uygun konaklamayı bulun."}
            </p>
          </div>
        </div>
        <div className="catalog-layout">
          <aside
            className={`filters ${mobileFilters ? "mobile-open" : ""}`}
            aria-label="Otel filtreleri"
          >
            <div className="filter-title">
              <h2>Aramanızı daraltın</h2>
              <button className="text-button" onClick={clear}>
                Temizle
              </button>
            </div>
            <label className="filter-search">
              <span>Otel veya bölge ara</span>
              <div>
                <MagnifyingGlass size={17} />
                <input
                  value={query}
                  onChange={(e) => update("q", e.target.value)}
                  placeholder="Otel adı veya bölge"
                />
              </div>
            </label>
            <fieldset>
              <legend>Bölge</legend>
              <label className="filter-choice">
                <input
                  type="radio"
                  name="region"
                  checked={!region}
                  onChange={() => update("bolge", "")}
                />
                Tüm Kapadokya<span>{hotels.length}</span>
              </label>
              {districts.map((d) => (
                <label key={d} className="filter-choice">
                  <input
                    type="radio"
                    name="region"
                    checked={region === d}
                    onChange={() => update("bolge", d)}
                  />
                  {d}
                  <span>
                    {
                      hotels.filter((h) =>
                        normal(h.district).includes(normal(d)),
                      ).length
                    }
                  </span>
                </label>
              ))}
            </fieldset>
            <fieldset>
              <legend>Otel olanakları</legend>
              {[
                "breakfast",
                "wifi",
                "pool",
                "spa",
                "park",
                "fitness",
                "kids",
              ].map((f) => (
                <label key={f} className="filter-choice">
                  <input
                    type="checkbox"
                    checked={facilities.includes(f)}
                    onChange={() =>
                      update(
                        "olanak",
                        facilities.includes(f)
                          ? facilities.filter((a) => a !== f)
                          : [...facilities, f],
                      )
                    }
                  />
                  {amenities[f]}
                </label>
              ))}
            </fieldset>
            <div className="filter-note">
              <Info size={18} />
              <p>
                Tarih seçimi fiyat talebinize eklenir. Kesin fiyat ve müsaitlik
                teklif aşamasında netleşir.
              </p>
            </div>
          </aside>
          <section className="results" aria-label="Otel sonuçları">
            <div className="results-toolbar">
              <p role="status" aria-live="polite">
                <strong>{result.length}</strong> otel bulundu
              </p>
              <div>
                <button
                  className="filter-toggle button button-secondary"
                  aria-expanded={mobileFilters}
                  onClick={() => setMobileFilters(!mobileFilters)}
                >
                  <SlidersHorizontal size={18} />
                  {mobileFilters ? "Filtreleri kapat" : "Filtrele"}
                </button>
                <label className="sort-label">
                  <span className="sr-only">Otelleri sırala</span>
                  <select
                    value={sort}
                    onChange={(e) => update("sirala", e.target.value)}
                  >
                    <option value="default">Katalog sırası</option>
                    <option value="az">Otel adı: A–Z</option>
                    <option value="za">Otel adı: Z–A</option>
                    <option value="photos">Fotoğraf sayısı</option>
                  </select>
                </label>
              </div>
            </div>
            {(region || facilities.length > 0) && (
              <div className="active-filters">
                {region && (
                  <button onClick={() => update("bolge", "")}>
                    {region}
                    <X size={13} />
                  </button>
                )}
                {facilities.map((f) => (
                  <button
                    key={f}
                    onClick={() =>
                      update(
                        "olanak",
                        facilities.filter((a) => a !== f),
                      )
                    }
                  >
                    {amenities[f]}
                    <X size={13} />
                  </button>
                ))}
              </div>
            )}
            {result.length ? (
              <>
                <div className="hotel-results">
                  {result.slice(0, visible).map((h) => (
                    <HotelCard key={h.slug} hotel={h} horizontal />
                  ))}
                </div>
                {visible < result.length && (
                  <div className="load-more">
                    <p>
                      {result.length} otelden {Math.min(visible, result.length)}{" "}
                      tanesini görüntülüyorsunuz.
                    </p>
                    <button
                      className="button button-secondary"
                      onClick={() => setVisible((v) => v + 12)}
                    >
                      Daha fazla otel göster
                      <Plus size={19} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                {saved ? <Heart size={44} /> : <MagnifyingGlass size={44} />}
                <h2>
                  {saved && !favorites.length
                    ? "Güzel bir tatil, bir favoriyle başlar."
                    : "Bu aramada otel bulamadık."}
                </h2>
                <p>
                  {saved && !favorites.length
                    ? "Otellerin üzerindeki kalbe dokunun, beğendikleriniz burada biriksin."
                    : "Otel adını kontrol edin veya filtreleri azaltarak yeniden deneyin."}
                </p>
                {saved && !favorites.length ? (
                  <ButtonLink to="/oteller">Otelleri keşfet</ButtonLink>
                ) : (
                  <button className="button" onClick={clear}>
                    Filtreleri temizle
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
        <HelpStrip />
      </div>
    </>
  );
}
function Gallery({ item }) {
  const [index, setIndex] = useState(0);
  const dialog = useRef(null);
  const close = useRef(null);
  const images = [...new Set([item.img, ...item.gallery].filter(Boolean))];
  const open = (i) => {
    setIndex(i);
    dialog.current.showModal();
  };
  useEffect(() => {
    const el = dialog.current;
    const release = () => document.body.classList.remove("dialog-open");
    el.addEventListener("close", release);
    return () => {
      el.removeEventListener("close", release);
      release();
    };
  }, []);
  const show = (i) => {
    open(i);
    document.body.classList.add("dialog-open");
  };
  return (
    <>
      <div className={`gallery-grid ${images.length < 3 ? "few-images" : ""}`}>
        {images.slice(0, 5).map((src, i) => (
          <button
            type="button"
            key={src}
            className={`gallery-image photo-${i}`}
            onClick={() => show(i)}
            aria-label={`${item.name || item.title}, ${i + 1}. fotoğrafı aç`}
          >
            <img
              src={src}
              alt={`${item.name || item.title}, fotoğraf ${i + 1}`}
              width="1000"
              height="700"
              loading={i === 0 ? "eager" : "lazy"}
            />
            {i === Math.min(4, images.length - 1) && (
              <span>
                <Images size={18} />
                {images.length} fotoğrafı gör
              </span>
            )}
          </button>
        ))}
      </div>
      <dialog
        className="lightbox"
        ref={dialog}
        aria-label={`${item.name || item.title} fotoğraf galerisi`}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length);
          if (e.key === "ArrowLeft")
            setIndex((i) => (i - 1 + images.length) % images.length);
        }}
      >
        <div className="lightbox-top">
          <span>{item.name || item.title}</span>
          <button
            ref={close}
            className="icon-button"
            aria-label="Galeriyi kapat"
            onClick={() => dialog.current.close()}
          >
            <X />
          </button>
        </div>
        <div className="lightbox-image">
          <button
            className="icon-button"
            aria-label="Önceki fotoğraf"
            onClick={() =>
              setIndex((i) => (i - 1 + images.length) % images.length)
            }
          >
            <CaretLeft />
          </button>
          <img
            src={images[index]}
            alt={`${item.name || item.title}, fotoğraf ${index + 1}`}
          />
          <button
            className="icon-button"
            aria-label="Sonraki fotoğraf"
            onClick={() => setIndex((i) => (i + 1) % images.length)}
          >
            <CaretRight />
          </button>
        </div>
        <p aria-live="polite">
          {index + 1} / {images.length}
        </p>
        <div className="lightbox-thumbnails">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setIndex(i)}
              aria-label={`${i + 1}. fotoğraf`}
              aria-pressed={i === index}
            >
              <img src={src} alt="" width="90" height="65" loading="lazy" />
            </button>
          ))}
        </div>
      </dialog>
    </>
  );
}
function OfferForm({ item, type = "otel" }) {
  const [params] = useSearchParams();
  const [start, setStart] = useState(params.get("giris") || "");
  const [end, setEnd] = useState(params.get("cikis") || "");
  const [adults, setAdults] = useState(
    Math.min(8, Math.max(1, Number(params.get("yetiskin")) || 2)),
  );
  const [children, setChildren] = useState(
    Math.min(4, Math.max(0, Number(params.get("cocuk")) || 0)),
  );
  const [ages, setAges] = useState([]);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (start < localDate() || end <= start)
      return setError(
        "Lütfen bugünden başlayan geçerli bir tarih aralığı seçin.",
      );
    if (
      children &&
      ages.slice(0, children).filter((x) => x !== "").length < children
    )
      return setError("Lütfen her çocuğun yaşını seçin.");
    setError("");
    const message = `Merhaba, Ekonomikotel üzerinden ${item.name || item.title} için fiyat ve müsaitlik bilgisi rica ediyorum.\nTarih: ${dateText(start)} – ${dateText(end)}\nMisafir: ${adults} yetişkin${children ? `, ${children} çocuk (yaşlar: ${ages.slice(0, children).join(", ")})` : ""}\n${type === "otel" ? "Otel" : "Tur"}: https://ekonomikotel.com/${type === "otel" ? "oteller" : "turlar"}/${item.slug}`;
    window.open(
      whatsappUrl(message),
      "_blank",
      "noopener,noreferrer",
    );
    setOpened(true);
  };
  return (
    <aside className="offer-panel" id="fiyat-talebi">
      {item.priceMode === "from" && (
        <div className="offer-price">
          <PriceSummary item={item} />
          <small>Başlangıç fiyatı · kesin fiyat teklifinizde netleşir.</small>
        </div>
      )}
      <h2>Tatili birlikte planlayalım.</h2>
      <p>Tarihlerinizi seçin, size özel fiyat ve müsaitlik bilgisi isteyin.</p>
      <form onSubmit={submit}>
        <div className="offer-dates">
          <label>
            Giriş tarihi
            <DateInput
              required

              min={localDate()}
              value={start}
              onChange={(e) => {
                setStart(e.target.value);
                if (end <= e.target.value) setEnd("");
              }}
            />
          </label>
          <label>
            Çıkış tarihi
            <DateInput
              required

              min={start ? dayAfter(start) : dayAfter(localDate())}
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        <div className="offer-dates">
          <label>
            Yetişkin
            <select
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} yetişkin
                </option>
              ))}
            </select>
          </label>
          <label>
            Çocuk
            <select
              value={children}
              onChange={(e) => {
                setChildren(Number(e.target.value));
                setAges((a) =>
                  Array.from(
                    { length: Number(e.target.value) },
                    (_, i) => a[i] ?? "",
                  ),
                );
              }}
            >
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {n ? n + " çocuk" : "Çocuk yok"}
                </option>
              ))}
            </select>
          </label>
        </div>
        {children > 0 && (
          <div className="child-ages">
            {Array.from({ length: children }, (_, i) => (
              <label key={i}>
                {i + 1}. çocuk yaşı
                <select
                  required
                  value={ages[i] ?? ""}
                  onChange={(e) =>
                    setAges((a) => {
                      const next = [...a];
                      next[i] = e.target.value;
                      return next;
                    })
                  }
                >
                  <option value="">Yaş seçin</option>
                  {Array.from({ length: 18 }, (_, n) => (
                    <option key={n} value={n}>
                      {n} yaş
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        )}
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <button className="button full" type="submit">
          <WhatsappLogo size={22} />
          WhatsApp’tan fiyat sor
          <ArrowUpRight size={17} />
        </button>
        {opened && (
          <p role="status" className="form-note">
            Talep metniniz WhatsApp’ta açıldı. Mesajı göndererek iletişime
            geçebilirsiniz.
          </p>
        )}
      </form>
      <InquiryPanel
        item={item}
        type={type}
        start={start}
        end={end}
        adults={adults}
        children={children}
        ages={ages}
      />
      <p className="offer-disclaimer">
        <Info size={17} />
        Bu işlem rezervasyon oluşturmaz. Kesin fiyat ve müsaitlik görüşme
        sırasında onaylanır.
      </p>
      <a className="offer-phone" href={`tel:${AGENCY.tel}`}>
        <Phone size={17} />
        {AGENCY.phoneDisplay}
      </a>
    </aside>
  );
}
function DetailPage({ type = "otel" }) {
  const { hotels, tours, amenities } = useCatalog();
  const { slug } = useParams();
  const location = useLocation();
  const item = (type === "otel" ? hotels : tours).find((h) => h.slug === slug);
  if (!item) return <NotFound />;
  const isHotel = type === "otel";
  return (
    <div className="shell detail-page">
      <nav className="breadcrumb" aria-label="Sayfa yolu">
        <Link to="/">Ana sayfa</Link>
        <CaretRight size={12} />
        <Link to={isHotel ? "/oteller" : "/turlar"}>
          {isHotel ? "Oteller" : "Turlar"}
        </Link>
        <CaretRight size={12} />
        <span>{item.name || item.title}</span>
      </nav>
      <div className="detail-title">
        <div>
          <h1>{item.name || item.title}</h1>
          <p>
            <MapPin size={17} />
            {isHotel ? `${item.district}, ${item.city}` : item.city}
            <span>·</span>
            {isHotel ? item.concept : item.duration}
          </p>
        </div>
        {isHotel && <FavoriteButton hotel={item} className="detail-favorite" />}
      </div>
      <Gallery item={item} />
      <nav className="detail-tabs" aria-label="Detay bölümleri">
        <a href="#genel">Genel bakış</a>
        <a href={isHotel ? "#olanaklar" : "#program"}>
          {isHotel ? "Otel olanakları" : "Tur programı"}
        </a>
        <a href={isHotel ? "#konum" : "#dahil"}>
          {isHotel ? "Konum" : "Dahil olanlar"}
        </a>
        <a href="#fiyat-talebi">Fiyat sor</a>
      </nav>
      <div className="detail-layout">
        <div className="detail-copy">
          <section id="genel">
            <h2>
              {isHotel
                ? "Otel hakkında"
                : "Kapadokya’yı tek bir planda yaşayın."}
            </h2>
            <p className="intro-copy">
              {clean(isHotel ? item.blurb : item.shortDesc)}
            </p>
            {isHotel &&
              item.longBlurb &&
              item.longBlurb !== item.blurb &&
              !item.blurb.startsWith(item.longBlurb) && (
                <p>{clean(item.longBlurb)}</p>
              )}
            {!isHotel && <p>{clean(item.hotelBlurb)}</p>}
          </section>
          {isHotel ? (
            <>
              {!!item.rooms?.length && (
                <section id="odalar">
                  <h2>Oda tipleri</h2>
                  <div className="room-types">
                    {item.rooms.map((room, i) => (
                      <article key={room.id || i}>
                        <h3>{room.name}</h3>
                        <p>
                          <Users size={17} /> En fazla {room.capacity} kişi
                          {room.concept ? ` · ${room.concept}` : ""}
                        </p>
                        <p>
                          {[
                            room.area ? `${room.area} m²` : null,
                            room.bedType,
                            room.view,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </p>
                        {room.description && <p>{room.description}</p>}
                        {!!room.features?.length && (
                          <ul>
                            {room.features.map((f, n) => (
                              <li key={n}>{f}</li>
                            ))}
                          </ul>
                        )}
                        {!!room.gallery?.length && (
                          <div className="room-photo-strip">
                            {room.gallery.map((p, n) => (
                              <a
                                href={p}
                                key={p}
                                target="_blank"
                                rel="noreferrer"
                                aria-label={`${room.name}, ${n + 1}. fotoğrafı büyüt`}
                              >
                                <img
                                  src={p}
                                  alt={`${room.name}, ${n + 1}. fotoğraf`}
                                  loading="lazy"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}
              <section id="olanaklar">
                <h2>Otel olanakları</h2>
                <Amenities list={item.amenities} limit={100} />
              </section>
              <section id="konum">
                <h2>Konum</h2>
                <div className="location-box">
                  <div>
                    <MapPin size={30} />
                    <h3>
                      {item.district}, {item.city}
                    </h3>
                    <p>{item.address || `${item.district}, ${item.city}`}</p>
                  </div>
                  {item.maps && (
                    <a
                      className="button button-secondary"
                      href={item.maps}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Haritada aç
                      <ArrowUpRight size={18} />
                    </a>
                  )}
                </div>
              </section>
              <section>
                <h2>Rezervasyon öncesi</h2>
                <p>
                  Oda tipi, yemek konsepti, çocuk koşulları, giriş ve çıkış
                  saatleri ile iptal koşullarını teklif alırken teyit
                  edebilirsiniz. Seçtiğiniz tarihteki fiyat ve müsaitlik ayrıca
                  bildirilir.
                </p>
              </section>
            </>
          ) : (
            <>
              <section id="program">
                <h2>Gün gün yolculuğunuz</h2>
                <div className="itinerary">
                  {item.itinerary.map((day) => (
                    <div key={day.day}>
                      <span>{day.day}. gün</span>
                      <div>
                        <h3>{clean(day.title)}</h3>
                        <p>{clean(day.text)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section id="dahil">
                <h2>Pakete dahil olanlar</h2>
                <ul className="includes">
                  {item.includes.map((x, i) => (
                    <li key={i}>
                      <CheckCircle size={21} />
                      <span>{clean(x)}</span>
                    </li>
                  ))}
                </ul>
              </section>
              {!!item.excludes?.length && (
                <section>
                  <h2>Dahil olmayanlar</h2>
                  <ul className="includes">
                    {item.excludes.filter(Boolean).map((x, i) => (
                      <li key={i}>
                        <Info size={21} />
                        <span>{clean(x)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {!!item.departureDates?.length && (
                <section>
                  <h2>Planlanan hareket tarihleri</h2>
                  <p>
                    {item.departureDates
                      .filter((d) => d >= localDate())
                      .map(dateText)
                      .join(" · ") || "Güncel tarihler için bilgi isteyin."}
                  </p>
                  {item.departureCity && (
                    <p>Hareket noktası: {item.departureCity}</p>
                  )}
                  <p>
                    Kesin hareket ve müsaitlik teklif aşamasında doğrulanır.
                  </p>
                </section>
              )}
              <section>
                <h2>Tur rotaları</h2>
                {item.tourRoutes?.map((route) => (
                  <details key={route.key} className="faq-item">
                    <summary>
                      {route.name}
                      <Plus size={18} />
                    </summary>
                    <p>{route.badge}</p>
                    <p>{route.stops.join(" · ")}</p>
                  </details>
                ))}
              </section>
              <section>
                <h2>Bilmeniz gerekenler</h2>
                {item.terms
                  .filter((t) => t.title !== "Başlangıç Fiyatı")
                  .map((term, i) => (
                    <details className="faq-item" key={i}>
                      <summary>
                        {term.title}
                        <Plus size={18} />
                      </summary>
                      {term.items.map((x, j) => (
                        <p key={j}>{clean(x)}</p>
                      ))}
                    </details>
                  ))}
              </section>
            </>
          )}
        </div>
        <OfferForm
          key={`${item.slug}-${location.search}`}
          item={item}
          type={type}
        />
      </div>
      {isHotel && (
        <section className="section">
          <Heading
            title="Keşfetmeye devam edin."
            to="/oteller"
            label="Tüm oteller"
          />
          <div className="hotel-grid related">
            {hotels
              .filter((h) => h.slug !== slug && h.district === item.district)
              .slice(0, 3)
              .map((h) => (
                <HotelCard hotel={h} key={h.slug} />
              ))}
          </div>
        </section>
      )}
    </div>
  );
}
function ToursPage() {
  const { tours } = useCatalog();
  const [params] = useSearchParams();
  const query = params.get("q") || "";
  const found = tours.filter(
    (t) =>
      !query ||
      normal(`${t.title} ${t.shortDesc} ${t.city} ${t.category}`).includes(
        normal(query),
      ),
  );
  return (
    <div className="shell tours-page">
      <nav className="breadcrumb" aria-label="Sayfa yolu">
        <Link to="/">Ana sayfa</Link>
        <CaretRight size={12} />
        <span>Kapadokya turları</span>
      </nav>
      <div className="tour-page-head">
        <div>
          <h1>
            Bir yolculuğa
            <br />
            çok şey sığdırın.
          </h1>
          <p>
            Kapadokya’da konaklama, bölge turu ve deneyimler.
            <br />
            Size kalan, anın tadını çıkarmak.
          </p>
        </div>
        <Compass size={96} weight="thin" />
      </div>
      <SearchBox compact initialKind="tur" key={params.toString()} />
      <div className="section-heading tour-results-title">
        <h2>Kapadokya tatil paketleri</h2>
        <span role="status">{found.length} paket</span>
      </div>
      {found.length ? (
        <div className="tour-grid">
          {found.map((t) => (
            <TourCard key={t.slug} tour={t} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Compass size={40} />
          <h2>Bu aramada tur bulamadık.</h2>
          <p>Kapadokya tatil paketlerinin tamamını keşfedebilirsiniz.</p>
          <ButtonLink to="/turlar">Tüm turları gör</ButtonLink>
        </div>
      )}
      <section className="faq-section">
        <h2>Planlamadan önce.</h2>
        <details className="faq-item">
          <summary>
            Tur paketi ile otel rezervasyonu arasındaki fark nedir?
            <Plus />
          </summary>
          <p>
            Tur paketlerinde konaklama ve programda belirtilen deneyimler
            birlikte sunulur. Otel sayfalarından ise yalnızca konaklama için
            teklif isteyebilirsiniz.
          </p>
        </details>
        <details className="faq-item">
          <summary>
            Kesin otel ve fiyat ne zaman belli olur?
            <Plus />
          </summary>
          <p>
            Konaklama oteli müsaitliğe göre belirlenir. Otel adı, kişi sayısına
            ve tarihe göre kesin fiyat ile tüm koşullar rezervasyon onayından
            önce paylaşılır.
          </p>
        </details>
        <details className="faq-item">
          <summary>
            Balon uçuşu pakete dahil mi?
            <Plus />
          </summary>
          <p>
            Balon kalkışını izleme ile balon uçuşu farklı deneyimlerdir. Paketin
            dahil olanlar bölümünü inceleyin; balon uçuşu için ayrıca bilgi
            isteyin.
          </p>
        </details>
      </section>
      <HelpStrip />
    </div>
  );
}
function Guide() {
  const { tours, hero } = useCatalog();
  return (
    <div className="shell guide-page">
      <nav className="breadcrumb" aria-label="Sayfa yolu">
        <Link to="/">Ana sayfa</Link>
        <CaretRight size={12} />
        <span>Kapadokya rehberi</span>
      </nav>
      <div className="guide-hero">
        <img
          src={hero}
          alt="Kapadokya vadileri üzerinde balonlar"
          width="1920"
          height="1312"
        />
        <div>
          <h1>
            Kapadokya.
            <br />
            Her gelişte yeniden.
          </h1>
          <p>
            Vadilerin, taş sokakların ve gün doğumlarının arasında kendi
            rotanızı bulun.
          </p>
        </div>
      </div>
      <DestinationSection />
      <section className="guide-plans">
        <div>
          <SunHorizon size={32} />
          <h2>
            Kısa bir mola mı,
            <br />
            biraz daha Kapadokya mı?
          </h2>
          <p>
            İki gece veya üç gece konaklamalı paketlerin gün gün programına göz
            atın. Bölge turu ve deneyimleri bir arada değerlendirin.
          </p>
          <ButtonLink to="/turlar">Turları keşfet</ButtonLink>
        </div>
        <img
          src={tours[1]?.img || hero}
          alt="Kapadokya tatil paketi görseli"
          width="720"
          height="500"
          loading="lazy"
        />
      </section>
      <HelpStrip />
    </div>
  );
}
function Contact() {
  const { hero } = useCatalog();
  const location = useLocation();
  useEffect(() => {
    if (location.hash === "#iletisim-formu")
      document.getElementById("iletisim-formu")?.scrollIntoView();
  }, [location.key, location.hash]);
  return (
    <div className="shell contact-page">
      <nav className="breadcrumb" aria-label="Sayfa yolu">
        <Link to="/">Ana sayfa</Link>
        <CaretRight size={12} />
        <span>İletişim</span>
      </nav>
      <div className="contact-layout">
        <header className="contact-intro">
          <h1>
            Bir güzel tatil
            <br />
            planlayalım.
          </h1>
          <p>
            Otel, tur veya balayı planınızı yazın; tarihinize ve misafir
            sayınıza göre fiyat ve müsaitlik bilgisiyle size dönelim.
          </p>
        </header>
        <aside className="contact-aside" aria-label="İletişim bilgileri">
          <img
            src={hero}
            alt="Kapadokya’da sıcak hava balonları"
            width="900"
            height="560"
            loading="lazy"
          />
          <div className="contact-card">
            <span className="contact-card-label">Bilgi ve rezervasyon</span>
            <a className="contact-phone" href={`tel:${AGENCY.tel}`}>
              <Phone size={26} />
              {AGENCY.phoneDisplay}
            </a>
            <a
              className="button contact-whatsapp"
              href={whatsappUrl(
                "Merhaba, Ekonomikotel üzerinden bilgi almak istiyorum.",
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              <WhatsappLogo size={22} />
              WhatsApp’tan yaz
              <ArrowUpRight size={17} />
            </a>
            <a
              className="contact-tursab"
              href={AGENCY.tursabVerifyUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ShieldCheck size={26} />
              <span>
                <strong>
                  TÜRSAB Belge No:{" "}
                  <span className="tursab-no">{AGENCY.tursabNo}</span>
                </strong>
                <small>
                  {AGENCY.tursabGroup} · Belgeyi TÜRSAB’da doğrulayın
                </small>
              </span>
              <ArrowUpRight size={16} />
              <span className="sr-only">(yeni sekmede açılır)</span>
            </a>
            <p className="contact-note">
              Kesin fiyat, müsaitlik ve rezervasyon koşulları görüşme sırasında
              netleştirilir.
            </p>
          </div>
        </aside>
        <ContactForm />
      </div>
    </div>
  );
}
function Credits() {
  return (
    <div className="shell prose-page">
      <h1>Görsel kaynakları</h1>
      <p>
        Otel ve tur görselleri, kullanıcının yetkilendirdiği Ekonomiktatilim
        kaynak projesinden aktarılmıştır. Otel adları, açıklamaları ve
        görsellerin tesis eşleştirmeleri korunmuştur.
      </p>
      <h2>Kapadokya destinasyon fotoğrafı</h2>
      <p>
        “Hot air balloons over valleys near Göreme, Cappadocia at dawn.JPG”,
        MusikAnimal.{" "}
        <a
          href="https://commons.wikimedia.org/wiki/File:Hot_air_balloons_over_valleys_near_G%C3%B6reme,_Cappadocia_at_dawn.JPG"
          target="_blank"
          rel="noopener noreferrer"
        >
          Orijinal görsel
        </a>{" "}
        ·{" "}
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
        >
          CC BY-SA 4.0
        </a>
        . WebP dönüşümü ve ekrana göre kırpma uygulanmıştır; uyarlama aynı
        lisansla sunulur.
      </p>
      <h2>Sağlık turizmi görselleri</h2>
      <p>
        Sağlık bölümündeki görseller, mevcut Cappadocia Health projesinde
        üretilmiş temsili editoryal görsellerdir. Gerçek sağlık kuruluşu, hekim
        veya hasta sonucu göstermezler.
      </p>
      <h2>Yazı tipleri</h2>
      <p>
        DM Sans ve Hanken Grotesk, SIL Open Font License ile yerel olarak
        sunulur.
      </p>
    </div>
  );
}
// KVKK md. 10 aydınlatma metni: /iletisim formu, otel ve tur sayfalarındaki
// teklif formu ile telefon/WhatsApp talepleri. Sağlık turizmi formu sağlık
// verisi içerdiğinden kendi aydınlatma metniyle sağlık bölümünde yer alır.
const KVKK_DATA = [
  ["Kimlik", "Adınız ve soyadınız."],
  [
    "İletişim",
    "Telefon numaranız; e-posta adresiniz (isteğe bağlıdır, e-posta ile dönüş seçerseniz gerekir); size hangi yoldan (telefon, WhatsApp, e-posta) ve hangi saat aralığında dönmemizi istediğiniz.",
  ],
  [
    "Talep ve teklif bilgileri",
    "Talebinizin konusu; ilgilendiğiniz otel, tur veya oda tipi; giriş-çıkış ya da tur tarihleri ve tarihlerin esnek olup olmadığı; yetişkin ve oda sayısı; bölge ve bütçe tercihi; mevcut rezervasyon veya takip numaranız; mesajınız; size verilen takip numarası ve seçtiğiniz tarihler için hesaplanan fiyat.",
  ],
  [
    "Çocuk misafirler",
    "Yalnızca çocukların sayısı ve yaşları. Konaklama ve tur fiyatı yaşa göre belirlendiği için sorulur; çocukların adı istenmez.",
  ],
  [
    "Müşteri işlem kayıtları",
    "Talebinizin durumu, ekibimizin görüşme notları, size sunulan teklif ve talebin sonucu.",
  ],
  [
    "İşlem güvenliği",
    "Onay kutusunu işaretleyip formu gönderdiğiniz tarih ve saat. Formların kötüye kullanımını önlemek için IP adresinizden türetilen tek yönlü bir özet kısa süreli istek sınırlamasında kullanılır; IP adresiniz talep kaydınıza eklenmez.",
  ],
];
const KVKK_RIGHTS = [
  "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
  "İşlenmişse buna ilişkin bilgi talep etme",
  "İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
  "Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri bilme",
  "Eksik veya yanlış işlenmişse düzeltilmesini isteme",
  "KVKK’nın 7. maddesindeki şartlar çerçevesinde silinmesini veya yok edilmesini isteme",
  "Düzeltme, silme veya yok etme işlemlerinin verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme",
  "Münhasıran otomatik sistemlerle analiz edilmesi sonucunda aleyhinize bir sonuç çıkmasına itiraz etme",
  "Kanuna aykırı işlenmesi nedeniyle zarara uğramanız hâlinde zararın giderilmesini talep etme",
];
function KvkkNotice() {
  return (
    <div className="shell prose-page kvkk-page">
      <nav className="breadcrumb" aria-label="Sayfa yolu">
        <Link to="/">Ana sayfa</Link>
        <CaretRight size={12} />
        <span>KVKK Aydınlatma Metni</span>
      </nav>
      <h1>KVKK Aydınlatma Metni</h1>
      <p className="kvkk-lead">
        İletişim ve teklif formlarımız ile telefon ve WhatsApp üzerinden
        ilettiğiniz kişisel verileri nasıl işlediğimizi, 6698 sayılı Kişisel
        Verilerin Korunması Kanunu’nun (KVKK) 10. maddesi uyarınca açıklarız.
      </p>
      <p className="kvkk-updated">
        Son güncelleme: <time dateTime="2026-09-27">27 Eylül 2026</time>
      </p>
      <p>
        Bu metin; İletişim sayfasındaki talep formunu, otel ve tur
        sayfalarındaki “Beni arayın, teklif almak istiyorum” formunu ve bilgi
        hattımızdan ya da WhatsApp’tan bize ulaştığınızda paylaştığınız
        bilgileri kapsar. Sağlık turizmi (Cappadocia Health) bölümündeki ön
        değerlendirme formu sağlık verisi içerdiği için ayrı bir aydınlatma
        metnine tabidir; o metin sağlık bölümünde yer alır.
      </p>

      <h2>1. Veri sorumlusu</h2>
      <dl className="kvkk-facts">
        <div>
          <dt>Ticaret unvanı</dt>
          <dd>{DATA_CONTROLLER.legalName}</dd>
        </div>
        <div>
          <dt>Ticari ad ve markalar</dt>
          <dd>
            UPTREND TRAVEL · Ekonomik Tatilim ve Ekonomikotel markaları.
            Cappadocia Health, ekonomikotel.com’un sağlık turizmi bölümüdür.
          </dd>
        </div>
        <div>
          <dt>TÜRSAB belge no</dt>
          <dd>
            <span className="tursab-no">{AGENCY.tursabNo}</span> ·{" "}
            {AGENCY.tursabGroup}
          </dd>
        </div>
        <div>
          <dt>Adres</dt>
          <dd>{DATA_CONTROLLER.address}</dd>
        </div>
        <div>
          <dt>E-posta</dt>
          <dd>
            <a href={`mailto:${DATA_CONTROLLER.email}`}>
              {DATA_CONTROLLER.email}
            </a>
          </dd>
        </div>
        <div>
          <dt>Bilgi hattı</dt>
          <dd>
            <a href={`tel:${AGENCY.tel}`}>{AGENCY.phoneDisplay}</a>
          </dd>
        </div>
      </dl>

      <h2>2. İşlenen kişisel veriler</h2>
      <p>
        Formlarda yalnızca talebinizi yanıtlamak için gereken bilgileri
        soruyoruz. Hangi alanların görüneceği talep konusuna göre değişir:
      </p>
      <dl className="kvkk-facts">
        {KVKK_DATA.map(([category, detail]) => (
          <div key={category}>
            <dt>{category}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
      <p className="kvkk-note">
        Mesaj alanına sağlık bilgisi gibi özel nitelikli kişisel veri
        yazmamanızı rica ederiz; talebinizi yanıtlamak için bu bilgilere
        ihtiyacımız yoktur.
      </p>

      <h2>3. İşleme amaçları</h2>
      <p>Kişisel verilerinizi şu amaçlarla işleriz:</p>
      <ul>
        <li>Talebinizi almak, kaydetmek ve size bir takip numarası vermek</li>
        <li>
          Seçtiğiniz kanaldan (telefon, WhatsApp veya e-posta) ve tercih
          ettiğiniz saat aralığında size dönüş yapmak
        </li>
        <li>
          Tarihinize, misafir sayınıza ve çocuk yaşlarına göre otel ve tur
          seçeneklerini, fiyat ve müsaitlik bilgisini hazırlayıp teklif sunmak
        </li>
        <li>
          Mevcut rezervasyonunuzla ilgili sorunuzu veya değişiklik isteğinizi
          yanıtlamak
        </li>
        <li>Teklifi kabul etmeniz hâlinde rezervasyon sürecini başlatmak</li>
        <li>
          Talep ve tekliflerin takibini yapmak, hizmet kalitemizi ölçmek ve
          geliştirmek
        </li>
        <li>
          Sahte, tekrarlanan veya otomatik form gönderimlerini önlemek ve
          sistem güvenliğini sağlamak
        </li>
      </ul>
      <p>
        İletişim bilgileriniz, ayrıca onayınız alınmadan kampanya veya tanıtım
        iletisi göndermek için kullanılmaz.
      </p>

      <h2>4. Hukuki sebepler</h2>
      <ul>
        <li>
          <strong>
            KVKK md. 5/2-c · Sözleşmenin kurulması veya ifası:
          </strong>{" "}
          talebinizin yanıtlanması, teklif hazırlanması, rezervasyon sürecinin
          başlatılması ve mevcut rezervasyonunuzla ilgili taleplerin
          karşılanması.
        </li>
        <li>
          <strong>KVKK md. 5/2-f · Meşru menfaat:</strong> taleplerin kayıt
          altına alınıp takip edilmesi, hizmet kalitesinin ölçülmesi ve
          formların kötüye kullanımının önlenmesi. Bu işleme, temel hak ve
          özgürlüklerinize zarar vermeyecek ölçüde yapılır.
        </li>
        <li>
          <strong>KVKK md. 5/2-ç · Hukuki yükümlülük:</strong> yetkili
          kurumların kanuna dayanarak bilgi istemesi hâlinde.
        </li>
      </ul>
      <p>
        Formlardaki onay kutusu, bu metni okuduğunuzu ve talebinizin
        yanıtlanması için iletişim bilgilerinizin kullanılmasını kabul
        ettiğinizi gösterir. İletişim ve teklif talepleriniz açık rızaya değil,
        yukarıdaki hukuki sebeplere dayanılarak işlenir.
      </p>

      <h2>5. Kişisel verilerin aktarılması</h2>
      <ul>
        <li>
          <strong>Oteller ve tur hizmet sağlayıcıları:</strong> Yalnızca
          teklifimizi kabul edip rezervasyona geçmeye karar verdiğinizde;
          rezervasyonun yapılabilmesi için gereken bilgiler (ad soyad,
          tarihler, misafir sayısı ve çocuk yaşları, oda veya tur tercihi,
          gerektiğinde telefon numaranız) ilgili tesis veya tur operatörüyle
          paylaşılır.
        </li>
        <li>
          <strong>Barındırma ve altyapı hizmet sağlayıcısı:</strong>{" "}
          Talepler, barındırma hizmeti aldığımız Hostinger’ın Almanya’daki
          (Frankfurt) veri merkezinde bulunan sunucuda (VPS) saklanır. Sunucu
          altyapısını sağlayan firma, verilere yalnızca teknik hizmetin
          gerektirdiği ölçüde erişebilir.
        </li>
        <li>
          <strong>Yetkili kamu kurum ve kuruluşları:</strong> Yalnızca kanuni
          bir talep veya yükümlülük bulunduğunda.
        </li>
      </ul>
      <p>
        Aktarımlar KVKK’nın 8. maddesine uygun olarak yapılır. Talepler
        Almanya’daki sunucuda saklandığından, formu gönderdiğinizde
        verileriniz yurt dışına aktarılmış olur; bu aktarım KVKK’nın 9.
        maddesi kapsamındadır. Bunun dışında kişisel verileriniz yurt dışına
        yalnızca açık rızanızla veya KVKK’nın 9. maddesinde öngörülen şartlar
        çerçevesinde, örneğin yurt dışında bulunan bir hizmet sağlayıcıyı
        kendiniz tercih ettiğinizde aktarılır.
      </p>

      <h2>6. Toplama yöntemi</h2>
      <ul>
        <li>
          <strong>Web sitesi formları:</strong> İletişim sayfasındaki talep
          formunu veya otel ve tur sayfalarındaki teklif formunu
          gönderdiğinizde, bilgileriniz elektronik ortamda ve kısmen otomatik
          yollarla toplanır.
        </li>
        <li>
          <strong>Telefon ve WhatsApp:</strong> Bilgi hattımızı aradığınızda
          veya WhatsApp’tan yazdığınızda ilettiğiniz bilgiler, talebinizi
          takip edebilmek için ekibimizce not alınabilir. Otel ve tur
          sayfalarındaki “WhatsApp’tan fiyat sor” düğmesi hazırlanan mesajı
          kendi WhatsApp uygulamanızda açar; mesaj, siz gönderdiğinizde bize
          ulaşır. WhatsApp yazışmaları bu hizmetin altyapısı üzerinden iletilir
          ve WhatsApp’ın kendi gizlilik koşulları da geçerlidir.
        </li>
        <li>
          <strong>E-posta:</strong> E-posta ile dönüş istediğinizde veya bize
          yazdığınızda yazışmalarımız.
        </li>
      </ul>

      <h2>7. Saklama süresi</h2>
      <ul>
        <li>
          <strong>İletişim ve teklif talepleri:</strong> Talebin
          kapatılmasından itibaren en fazla 2 yıl saklanır; süre sonunda
          silinir, yok edilir veya anonim hâle getirilir.
        </li>
        <li>
          <strong>Rezervasyona dönüşen talepler:</strong> Rezervasyon,
          sözleşme ve fatura kayıtları ilgili mevzuatın öngördüğü süreler
          boyunca saklanır.
        </li>
        <li>
          <strong>İstek sınırlaması özeti:</strong> 15 dakikalık sınır süresi
          dolduktan sonra sistemden temizlenir.
        </li>
      </ul>

      <h2>8. KVKK md. 11 kapsamındaki haklarınız</h2>
      <p>
        Veri sorumlusu olarak şirketimize başvurarak aşağıdaki haklarınızı
        kullanabilirsiniz:
      </p>
      <ol className="kvkk-rights">
        {KVKK_RIGHTS.map((right) => (
          <li key={right}>{right}</li>
        ))}
      </ol>

      <h2>9. Başvuru yolları</h2>
      <ul>
        <li>
          <strong>Yazılı olarak:</strong> {DATA_CONTROLLER.address} adresine
          ıslak imzalı dilekçeyle, şahsen veya posta yoluyla.
        </li>
        <li>
          <strong>E-posta ile:</strong>{" "}
          <a href={`mailto:${DATA_CONTROLLER.email}`}>
            {DATA_CONTROLLER.email}
          </a>{" "}
          adresine.
        </li>
      </ul>
      <p>
        Başvurunuzda adınızı soyadınızı, iletişim bilginizi, talebinizi ve
        varsa takip numaranızı belirtmeniz kimliğinizi doğrulamamızı
        kolaylaştırır. Bilgi almak için{" "}
        <a href={`tel:${AGENCY.tel}`}>{AGENCY.phoneDisplay}</a> numaralı
        hattı arayabilirsiniz; başvurularınızı ise yazılı olarak veya e-posta
        ile iletmeniz gerekir.
      </p>
      <p>
        Başvurunuz, talebin niteliğine göre en kısa sürede ve en geç 30 gün
        içinde ücretsiz olarak sonuçlandırılır. İşlemin ayrıca bir maliyet
        gerektirmesi hâlinde Kişisel Verileri Koruma Kurulunca belirlenen
        tarifedeki ücret alınabilir.
      </p>
      <p>
        Başvurunuzun reddedilmesi, verilen cevabı yetersiz bulmanız veya
        süresinde cevap verilmemesi hâlinde; cevabı öğrendiğiniz tarihten
        itibaren 30 gün ve her hâlde başvuru tarihinden itibaren 60 gün içinde
        Kişisel Verileri Koruma Kurulu’na şikâyette bulunabilirsiniz.
      </p>
    </div>
  );
}
function NotFound() {
  return (
    <div className="shell empty-state not-found">
      <Compass size={50} />
      <h1>Bu rota başka bir yere çıkıyor.</h1>
      <p>
        Aradığınız sayfayı bulamadık. Tatilinizi keşfetmeye ana sayfadan devam
        edebilirsiniz.
      </p>
      <ButtonLink to="/">Ana sayfaya dön</ButtonLink>
    </div>
  );
}
function RouteEffects() {
  const { hotels, tours } = useCatalog();
  const location = useLocation();
  const previous = useRef(location.pathname);
  useEffect(() => {
    const path = location.pathname.replace(/\/$/, "") || "/";
    const hotel = hotels.find((h) => path === `/oteller/${h.slug}`);
    const tour = tours.find((t) => path === `/turlar/${t.slug}`);
    const title =
      hotel?.seoTitle ||
      tour?.seoTitle ||
      hotel?.name ||
      tour?.title ||
      {
        "/oteller": "Kapadokya Otelleri",
        "/turlar": "Kapadokya Tatil Paketleri",
        "/favoriler": "Favori Otellerim",
        "/rehber": "Kapadokya Rehberi",
        "/iletisim": "İletişim",
        "/kvkk-aydinlatma": "KVKK Aydınlatma Metni",
      }[path] ||
      "Kapadokya Otelleri ve Tatil Paketleri";
    document.title = `${title} | Ekonomikotel`;
    const description =
      hotel?.seoDescription ||
      tour?.seoDescription ||
      hotel?.blurb ||
      tour?.shortDesc;
    if (description)
      document
        .querySelector('meta[name="description"]')
        ?.setAttribute("content", description.slice(0, 180));
    document
      .querySelector('link[rel="canonical"]')
      ?.setAttribute(
        "href",
        `https://ekonomikotel.com${path === "/" ? "/" : path + "/"}`,
      );
    if (previous.current !== path) {
      window.scrollTo({ top: 0, behavior: "instant" });
      document.getElementById("main")?.focus({ preventScroll: true });
      previous.current = path;
    }
  }, [location.pathname]);
  return null;
}
export default function App() {
  const { previewId } = useCatalog();
  const [favorites, setFavorites] = useState(readFavorites);
  const [announcement, setAnnouncement] = useState("");
  const toggle = (id) =>
    setFavorites((current) => {
      const next = current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id];
      try {
        localStorage.setItem("ekonomikotel:favorites", JSON.stringify(next));
      } catch {}
      setAnnouncement(
        current.includes(id)
          ? "Otel favorilerinizden çıkarıldı."
          : "Otel favorilerinize eklendi.",
      );
      return next;
    });
  return (
    <Favorites.Provider value={{ favorites, toggle }}>
      <RouteEffects />
      <Header />
      {previewId && (
        <div className="preview-banner">
          Yönetici önizlemesi · Bu içerik ziyaretçilere açık olmayabilir.{" "}
          <a href={`/admin/icerik/${previewId}`}>Düzenlemeye dön</a>
        </div>
      )}
      <main id="main" tabIndex={-1}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/oteller" element={<CatalogPage />} />
          <Route path="/oteller/:slug" element={<DetailPage />} />
          <Route path="/turlar" element={<ToursPage />} />
          <Route path="/turlar/:slug" element={<DetailPage type="tur" />} />
          <Route path="/favoriler" element={<CatalogPage saved />} />
          <Route path="/rehber" element={<Guide />} />
          <Route path="/iletisim" element={<Contact />} />
          <Route path="/gorsel-kaynaklari" element={<Credits />} />
          <Route path="/kvkk-aydinlatma" element={<KvkkNotice />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>
      <Footer />
    </Favorites.Provider>
  );
}
