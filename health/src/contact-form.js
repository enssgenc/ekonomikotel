import {
  CONTACT_METHODS,
  HEALTH_AREAS,
  HEALTH_LANGUAGES,
  HEALTH_REPORTS,
  HEALTH_SERVICES,
  HEALTH_TRAVEL_WINDOWS,
  INTL_PHONE_PATTERN,
  values,
} from '../../src/lib/contact-forms.js';
import { escapeHtml as esc } from './blog-ui.js';
import { getTreatmentCategories } from './i18n.js';
import { licenseLink, localizedHref, message } from './site.js';

// Sağlık turizmi iletişim formu. POST /api/contact (form: "health") sözleşmesine
// göre gönderir. Durum tek bir nesnede tutulur; dil değişince form bu durumdan
// yeniden çizilir, böylece yazılanlar kaybolmaz.

const MESSAGE_MAX = 2000;
const PROCEDURE_MAX = 160;
// Ülke kodu zorunlu: "+" veya "00" ve ardından en fazla 25 karakter.
const PHONE_MAX = 27;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const METHODS = ['whatsapp', ...values(CONTACT_METHODS).filter((value) => value !== 'whatsapp')];
const REPORTS = [...values(HEALTH_REPORTS).filter(Boolean), ''];
const COMPANIONS = [0, 1, 2, 3, 4, 5];
const COUNTRIES = ['TR', 'DE', 'GB', 'NL', 'BE', 'FR', 'AT', 'CH', 'SE', 'DK', 'NO', 'IT', 'ES', 'IE', 'US', 'CA', 'AU', 'RU', 'KZ', 'AZ', 'UZ', 'UA', 'GE', 'SA', 'AE', 'KW', 'QA', 'BH', 'OM', 'IQ', 'JO', 'LB', 'EG', 'LY', 'DZ', 'MA', 'TN'];
// Hatalı alanlara odaklanma sırası; sunucudan dönen alan adları da bu adlardır.
const FIELD_ORDER = ['treatmentArea', 'procedure', 'message', 'hasReports', 'travelWindow', 'companions', 'services', 'name', 'country', 'phone', 'email', 'contactMethod', 'preferredLanguage', 'consent', 'healthConsent'];
const SERVER_ERROR_KEYS = { treatmentArea: 'area', procedure: 'procedure', message: 'message', name: 'name', country: 'country', phone: 'phone', email: 'email', consent: 'consent', healthConsent: 'healthConsent' };

const optionKey = (value) => value || 'none';

function newRequestId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const blankNeed = () => ({
  treatmentArea: '',
  procedureChoice: '',
  procedureText: '',
  message: '',
  hasReports: null,
  travelWindow: '',
  companions: 0,
  services: [],
  consent: false,
  healthConsent: false,
  website: '',
});

const blankState = () => ({
  ...blankNeed(),
  name: '',
  country: '',
  phone: '',
  email: '',
  contactMethod: 'whatsapp',
  preferredLanguage: '',
});

const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initContactForm(root) {
  if (!root) return { setLocale() {} };

  let locale = 'tr';
  let state = blankState();
  let errors = {};
  let status = null;
  let busy = false;
  let submitted = null;
  let requestId = newRequestId();

  root.innerHTML = '<div data-hc-body></div><p class="hc-status" id="hc-status" role="status" aria-live="polite" tabindex="-1"></p>';
  const body = root.querySelector('[data-hc-body]');
  const statusEl = root.querySelector('#hc-status');
  const licenseEl = document.querySelector('#contact-license');

  const t = (key, replacements) => message(key, replacements, locale);
  const categories = () => getTreatmentCategories(locale);
  const areaItems = (areaId) => categories().find((category) => category.id === areaId)?.items || [];
  const areaLabel = (areaId) => (areaId === 'other' ? t('contact.areas.other') : categories().find((category) => category.id === areaId)?.label || areaId);
  const optional = () => ` <span class="hc-optional">${esc(t('contact.optional'))}</span>`;
  const invalid = (field) => (errors[field] ? ' aria-invalid="true"' : '');
  const describedBy = (...ids) => ` aria-describedby="${ids.filter(Boolean).join(' ')}"`;
  const errorId = (field) => `hc-${field}-error`;
  const errorSlot = (field) => `<p class="hc-error" id="${errorId(field)}"${errors[field] ? '' : ' hidden'}>${errors[field] ? esc(t(`contact.errors.${errors[field]}`)) : ''}</p>`;
  const selected = (condition) => (condition ? ' selected' : '');
  const checked = (condition) => (condition ? ' checked' : '');
  const chip = (type, name, value, label, isChecked, className = 'hc-chip') => `<label class="${className}"><input type="${type}" name="${name}" value="${esc(value)}"${checked(isChecked)} /><span>${esc(label)}</span></label>`;
  const showProcedureText = () => state.treatmentArea === 'other' || state.procedureChoice === 'custom';
  // Onay metnindeki [[...]] bölümü aydınlatma metnine bağlanır. Yeni sekmede
  // açılır ki formda yazılanlar kaybolmasın; dil parametresi korunur.
  const withNoticeLink = (key) => esc(t(key)).replace(/\[\[(.+?)\]\]/, (_, text) => `<a class="hc-notice-link" href="${esc(localizedHref('aydinlatma.html', locale))}" target="_blank" rel="noopener">${text}<span class="sr-only"> ${esc(t('contact.fields.noticeNewTab'))}</span></a>`);

  function procedureValue() {
    if (showProcedureText()) return state.procedureText.trim();
    if (state.procedureChoice === '') return '';
    return areaItems(state.treatmentArea)[Number(state.procedureChoice)]?.name || '';
  }

  function countryOptions() {
    if (typeof Intl.DisplayNames !== 'function') return '';
    try {
      const names = new Intl.DisplayNames([locale], { type: 'region' });
      return COUNTRIES.map((code) => names.of(code))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, locale))
        .map((name) => `<option value="${esc(name)}"></option>`)
        .join('');
    } catch {
      return '';
    }
  }

  function procedureField() {
    const area = state.treatmentArea;
    const other = area === 'other';
    const items = areaItems(area);
    const options = area
      ? `<option value="">${esc(t('contact.fields.procedureUndecided'))}</option>${items.map((item, index) => `<option value="${index}"${selected(state.procedureChoice === String(index))}>${esc(item.name)}</option>`).join('')}<option value="custom"${selected(state.procedureChoice === 'custom')}>${esc(t('contact.fields.procedureCustom'))}</option>`
      : `<option value="">${esc(t('contact.fields.procedureNeedsArea'))}</option>`;
    return `<div class="hc-field" data-slot="procedure">
      <label for="${other ? 'hc-procedure-text' : 'hc-procedure'}">${esc(t('contact.fields.procedure'))}${optional()}</label>
      ${other ? '' : `<select id="hc-procedure" name="procedureChoice"${area ? '' : ' disabled'}>${options}</select>`}
      <div class="hc-subfield" data-procedure-text${showProcedureText() ? '' : ' hidden'}>
        ${other ? '' : `<label class="hc-sublabel" for="hc-procedure-text">${esc(t('contact.fields.procedureText'))}</label>`}
        <input id="hc-procedure-text" name="procedureText" type="text" maxlength="${PROCEDURE_MAX}" autocomplete="off" value="${esc(state.procedureText)}" placeholder="${esc(t('contact.fields.procedureTextPlaceholder'))}"${invalid('procedure')}${describedBy(errorId('procedure'))} />
      </div>
      ${errorSlot('procedure')}
    </div>`;
  }

  function emailField() {
    const required = state.contactMethod === 'email';
    return `<div class="hc-field" data-slot="email">
      <label for="hc-email">${esc(t('contact.fields.email'))}${required ? '' : optional()}</label>
      <input id="hc-email" name="email" type="email" dir="ltr" inputmode="email" autocomplete="email" maxlength="180" value="${esc(state.email)}"${required ? ' required aria-required="true"' : ''}${invalid('email')}${describedBy(errorId('email'))} />
      ${errorSlot('email')}
    </div>`;
  }

  function counterText() {
    return t('contact.fields.counter', { count: state.message.length, max: MESSAGE_MAX });
  }

  function formMarkup() {
    const preferredLanguage = state.preferredLanguage || locale;
    return `<form class="hc-form" novalidate aria-labelledby="contact-title">
      <fieldset class="hc-group">
        <legend><span class="hc-step" aria-hidden="true">01</span>${esc(t('contact.groups.need'))}</legend>
        <div class="hc-row">
          <div class="hc-field">
            <label for="hc-area">${esc(t('contact.fields.area'))}</label>
            <select id="hc-area" name="treatmentArea" required aria-required="true"${invalid('treatmentArea')}${describedBy(errorId('treatmentArea'))}>
              <option value="">${esc(t('contact.fields.areaPlaceholder'))}</option>
              ${values(HEALTH_AREAS).map((id) => `<option value="${id}"${selected(state.treatmentArea === id)}>${esc(areaLabel(id))}</option>`).join('')}
            </select>
            ${errorSlot('treatmentArea')}
          </div>
          ${procedureField()}
        </div>
        <div class="hc-field">
          <label for="hc-message">${esc(t('contact.fields.message'))}${optional()}</label>
          <p class="hc-hint hc-hint-caution" id="hc-message-hint">${esc(t('contact.fields.messageHint'))}</p>
          <textarea id="hc-message" name="message" rows="5" maxlength="${MESSAGE_MAX}" placeholder="${esc(t('contact.fields.messagePlaceholder'))}"${invalid('message')}${describedBy('hc-message-hint', 'hc-message-count', errorId('message'))}>${esc(state.message)}</textarea>
          <p class="hc-count" id="hc-message-count">${esc(counterText())}</p>
          ${errorSlot('message')}
        </div>
        <fieldset class="hc-choice"${describedBy('hc-reports-hint', errorId('hasReports'))}>
          <legend>${esc(t('contact.fields.reports'))}${optional()}</legend>
          <p class="hc-hint" id="hc-reports-hint">${esc(t('contact.fields.reportsHint'))}</p>
          <div class="hc-chips">${REPORTS.map((value) => chip('radio', 'hasReports', value, t(`contact.reports.${optionKey(value)}`), state.hasReports === value)).join('')}</div>
          ${errorSlot('hasReports')}
        </fieldset>
      </fieldset>

      <fieldset class="hc-group">
        <legend><span class="hc-step" aria-hidden="true">02</span>${esc(t('contact.groups.travel'))}</legend>
        <div class="hc-row hc-row-travel">
          <div class="hc-field">
            <label for="hc-window">${esc(t('contact.fields.travelWindow'))}${optional()}</label>
            <select id="hc-window" name="travelWindow"${describedBy('hc-window-hint', errorId('travelWindow'))}>
              ${values(HEALTH_TRAVEL_WINDOWS).map((value) => `<option value="${esc(value)}"${selected(state.travelWindow === value)}>${esc(t(`contact.travelWindows.${optionKey(value)}`))}</option>`).join('')}
            </select>
            <p class="hc-hint" id="hc-window-hint">${esc(t('contact.fields.travelWindowHint'))}</p>
            ${errorSlot('travelWindow')}
          </div>
          <fieldset class="hc-choice"${describedBy('hc-companions-hint', errorId('companions'))}>
            <legend>${esc(t('contact.fields.companions'))}</legend>
            <p class="hc-hint" id="hc-companions-hint">${esc(t('contact.fields.companionsHint'))}</p>
            <div class="hc-chips hc-chips-count">${COMPANIONS.map((count) => chip('radio', 'companions', String(count), String(count), state.companions === count)).join('')}</div>
            ${errorSlot('companions')}
          </fieldset>
        </div>
        <fieldset class="hc-choice"${describedBy('hc-services-hint', errorId('services'))}>
          <legend>${esc(t('contact.fields.services'))}</legend>
          <p class="hc-hint" id="hc-services-hint">${esc(t('contact.fields.servicesHint'))}</p>
          <div class="hc-services">${values(HEALTH_SERVICES).map((value) => chip('checkbox', 'services', value, t(`contact.services.${value}`), state.services.includes(value), 'hc-service')).join('')}</div>
          ${errorSlot('services')}
        </fieldset>
      </fieldset>

      <fieldset class="hc-group">
        <legend><span class="hc-step" aria-hidden="true">03</span>${esc(t('contact.groups.contact'))}</legend>
        <div class="hc-row">
          <div class="hc-field">
            <label for="hc-name">${esc(t('contact.fields.name'))}</label>
            <input id="hc-name" name="name" type="text" autocomplete="name" maxlength="120" required aria-required="true" value="${esc(state.name)}"${invalid('name')}${describedBy(errorId('name'))} />
            ${errorSlot('name')}
          </div>
          <div class="hc-field">
            <label for="hc-country">${esc(t('contact.fields.country'))}</label>
            <input id="hc-country" name="country" type="text" autocomplete="country-name" maxlength="80" list="hc-countries" required aria-required="true" placeholder="${esc(t('contact.fields.countryPlaceholder'))}" value="${esc(state.country)}"${invalid('country')}${describedBy(errorId('country'))} />
            <datalist id="hc-countries">${countryOptions()}</datalist>
            ${errorSlot('country')}
          </div>
        </div>
        <div class="hc-row">
          <div class="hc-field">
            <label for="hc-phone">${esc(t('contact.fields.phone'))}</label>
            <input id="hc-phone" name="phone" type="tel" dir="ltr" inputmode="tel" autocomplete="tel" maxlength="${PHONE_MAX}" required aria-required="true" placeholder="${esc(t('contact.fields.phonePlaceholder'))}" value="${esc(state.phone)}"${invalid('phone')}${describedBy('hc-phone-hint', errorId('phone'))} />
            <p class="hc-hint" id="hc-phone-hint">${esc(t('contact.fields.phoneHint'))}</p>
            ${errorSlot('phone')}
          </div>
          ${emailField()}
        </div>
        <div class="hc-row">
          <fieldset class="hc-choice"${describedBy(errorId('contactMethod'))}>
            <legend>${esc(t('contact.fields.method'))}</legend>
            <div class="hc-chips">${METHODS.map((value) => chip('radio', 'contactMethod', value, t(`contact.methods.${value}`), state.contactMethod === value)).join('')}</div>
            ${errorSlot('contactMethod')}
          </fieldset>
          <div class="hc-field">
            <label for="hc-language">${esc(t('contact.fields.language'))}</label>
            <select id="hc-language" name="preferredLanguage"${describedBy(errorId('preferredLanguage'))}>
              ${values(HEALTH_LANGUAGES).map((code) => `<option value="${code}"${selected(preferredLanguage === code)}>${esc(t(`contact.languages.${code}`))}</option>`).join('')}
            </select>
            ${errorSlot('preferredLanguage')}
          </div>
        </div>
      </fieldset>

      <fieldset class="hc-group hc-consents">
        <legend class="sr-only">${esc(t('contact.groups.consent'))}</legend>
        <div class="hc-consent">
          <input id="hc-consent" name="consent" type="checkbox" required aria-required="true"${checked(state.consent)}${invalid('consent')}${describedBy(errorId('consent'))} />
          <label for="hc-consent">${withNoticeLink('contact.fields.consent')}</label>
          ${errorSlot('consent')}
        </div>
        <div class="hc-consent">
          <input id="hc-health-consent" name="healthConsent" type="checkbox" required aria-required="true"${checked(state.healthConsent)}${invalid('healthConsent')}${describedBy('hc-health-consent-hint', errorId('healthConsent'))} />
          <label for="hc-health-consent">${withNoticeLink('contact.fields.healthConsent')}</label>
          <p class="hc-hint" id="hc-health-consent-hint">${esc(t('contact.fields.healthConsentHint'))}</p>
          ${errorSlot('healthConsent')}
        </div>
      </fieldset>

      <div class="hc-trap" aria-hidden="true"><label for="hc-website">${esc(t('contact.fields.trap'))}</label><input id="hc-website" name="website" type="text" tabindex="-1" autocomplete="off" value="${esc(state.website)}" /></div>

      <div class="hc-submit-row">
        <p class="hc-disclaimer"><span class="care-symbol" aria-hidden="true">+</span><span>${esc(t('contact.disclaimer'))}</span></p>
        <button class="button button-primary hc-submit" type="submit"${busy ? ' disabled aria-disabled="true"' : ''}><span data-submit-label>${esc(t(busy ? 'contact.submitting' : 'contact.submit'))}</span><span class="arrow-icon" aria-hidden="true">↗</span></button>
      </div>
    </form>`;
  }

  function successMarkup() {
    return `<div class="hc-success">
      <span class="hc-success-mark" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="m6.5 12.5 3.6 3.6 7.4-8.2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>
      <h3 id="hc-success-title" tabindex="-1">${esc(t('contact.success.title'))}</h3>
      <p class="hc-reference"><span>${esc(t('contact.success.reference'))}</span><strong dir="ltr">${esc(submitted.reference)}</strong></p>
      <p>${esc(t('contact.success.body', { method: t(`contact.methodVia.${submitted.method}`) }))}</p>
      <p class="hc-success-note"><span class="care-symbol" aria-hidden="true">+</span><span>${esc(t('contact.success.note'))}</span></p>
      <button class="button-link hc-again" type="button" data-contact-again>${esc(t('contact.success.again'))}<span class="arrow-line" aria-hidden="true"></span></button>
    </div>`;
  }

  function renderStatus() {
    const text = status ? (locale === 'tr' && status.text) || t(status.key) : '';
    statusEl.className = `hc-status${status?.tone === 'error' ? ' is-error' : ''}`;
    if (statusEl.textContent !== text) statusEl.textContent = text;
  }

  function render() {
    body.innerHTML = submitted ? successMarkup() : formMarkup();
    renderStatus();
    if (licenseEl) licenseEl.innerHTML = licenseLink(locale);
  }

  function setStatus(next) {
    status = next;
    // Aynı mesaj tekrarlandığında da okunması için bölgeyi önce boşaltırız.
    statusEl.textContent = '';
    requestAnimationFrame(renderStatus);
  }

  function replaceSlot(name, markup) {
    const slot = body.querySelector(`[data-slot="${name}"]`);
    if (slot) slot.outerHTML = markup;
  }

  function clearError(field) {
    if (!errors[field]) return;
    delete errors[field];
    const error = body.querySelector(`#${errorId(field)}`);
    if (error) {
      error.hidden = true;
      error.textContent = '';
    }
    body.querySelectorAll(`[name="${field}"]`).forEach((element) => element.removeAttribute('aria-invalid'));
    if (field === 'procedure') body.querySelector('#hc-procedure-text')?.removeAttribute('aria-invalid');
    if (!Object.keys(errors).length && status?.tone === 'error') setStatus(null);
  }

  function handleField(event) {
    const element = event.target;
    if (!element.name) return;
    switch (element.name) {
      case 'treatmentArea':
        if (state.treatmentArea === element.value) return;
        state.treatmentArea = element.value;
        state.procedureChoice = '';
        clearError('treatmentArea');
        clearError('procedure');
        replaceSlot('procedure', procedureField());
        return;
      case 'procedureChoice':
        state.procedureChoice = element.value;
        body.querySelector('[data-procedure-text]').hidden = !showProcedureText();
        clearError('procedure');
        return;
      case 'procedureText':
        state.procedureText = element.value;
        clearError('procedure');
        return;
      case 'message':
        state.message = element.value;
        body.querySelector('#hc-message-count').textContent = counterText();
        clearError('message');
        return;
      case 'hasReports':
        state.hasReports = element.value;
        clearError('hasReports');
        return;
      case 'travelWindow':
        state.travelWindow = element.value;
        clearError('travelWindow');
        return;
      case 'companions':
        state.companions = Number(element.value);
        clearError('companions');
        return;
      case 'services':
        state.services = values(HEALTH_SERVICES).filter((value) => body.querySelector(`input[name="services"][value="${value}"]`)?.checked);
        clearError('services');
        return;
      case 'contactMethod':
        if (state.contactMethod === element.value) return;
        state.contactMethod = element.value;
        clearError('contactMethod');
        if (errors.email === 'emailRequired') delete errors.email;
        replaceSlot('email', emailField());
        return;
      case 'consent':
      case 'healthConsent':
        state[element.name] = element.checked;
        clearError(element.name);
        return;
      case 'preferredLanguage':
        state.preferredLanguage = element.value;
        clearError('preferredLanguage');
        return;
      case 'name':
      case 'country':
      case 'phone':
      case 'email':
      case 'website':
        state[element.name] = element.value;
        clearError(element.name);
        return;
      default:
    }
  }

  function validate() {
    const found = {};
    if (!values(HEALTH_AREAS).includes(state.treatmentArea)) found.treatmentArea = 'area';
    if (procedureValue().length > PROCEDURE_MAX) found.procedure = 'procedure';
    if (state.message.trim().length > MESSAGE_MAX) found.message = 'message';
    const name = state.name.trim();
    if (name.length < 2 || name.length > 120) found.name = 'name';
    const country = state.country.trim();
    if (country.length < 2 || country.length > 80) found.country = 'country';
    if (!INTL_PHONE_PATTERN.test(state.phone.trim())) found.phone = 'phone';
    const email = state.email.trim();
    if (email && (email.length > 180 || !EMAIL_PATTERN.test(email))) found.email = 'email';
    else if (!email && state.contactMethod === 'email') found.email = 'emailRequired';
    if (!state.consent) found.consent = 'consent';
    if (!state.healthConsent) found.healthConsent = 'healthConsent';
    return found;
  }

  function payload() {
    return {
      form: 'health',
      requestId,
      locale,
      treatmentArea: state.treatmentArea,
      procedure: procedureValue(),
      message: state.message.trim(),
      hasReports: state.hasReports ?? '',
      travelWindow: state.travelWindow,
      companions: state.companions,
      services: values(HEALTH_SERVICES).filter((value) => state.services.includes(value)),
      name: state.name.trim(),
      country: state.country.trim(),
      phone: state.phone.trim(),
      email: state.email.trim(),
      contactMethod: state.contactMethod,
      preferredLanguage: state.preferredLanguage || locale,
      consent: state.consent,
      healthConsent: state.healthConsent,
      website: state.website,
    };
  }

  function fieldTarget(field) {
    const radios = (name) => body.querySelector(`input[name="${name}"]:checked`) || body.querySelector(`input[name="${name}"]`);
    const targets = {
      treatmentArea: () => body.querySelector('#hc-area'),
      procedure: () => body.querySelector(showProcedureText() ? '#hc-procedure-text' : '#hc-procedure'),
      message: () => body.querySelector('#hc-message'),
      hasReports: () => radios('hasReports'),
      travelWindow: () => body.querySelector('#hc-window'),
      companions: () => radios('companions'),
      services: () => body.querySelector('input[name="services"]'),
      name: () => body.querySelector('#hc-name'),
      country: () => body.querySelector('#hc-country'),
      phone: () => body.querySelector('#hc-phone'),
      email: () => body.querySelector('#hc-email'),
      contactMethod: () => radios('contactMethod'),
      preferredLanguage: () => body.querySelector('#hc-language'),
      consent: () => body.querySelector('#hc-consent'),
      healthConsent: () => body.querySelector('#hc-health-consent'),
    };
    return targets[field]?.() || null;
  }

  function focusFirstError() {
    const field = FIELD_ORDER.find((name) => errors[name]);
    const target = field && fieldTarget(field);
    if (target) {
      target.focus({ preventScroll: true });
      target.closest('.hc-field, .hc-choice, .hc-consent')?.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    } else {
      statusEl.focus({ preventScroll: true });
      statusEl.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
    }
  }

  function serverErrors(fields) {
    const mapped = {};
    for (const entry of fields) {
      const field = String(entry?.field || '').split('.')[0];
      if (!FIELD_ORDER.includes(field) || mapped[field]) continue;
      if (field === 'email') mapped.email = !state.email.trim() ? 'emailRequired' : 'email';
      else mapped[field] = SERVER_ERROR_KEYS[field] || 'field';
    }
    return mapped;
  }

  function setBusy(next) {
    busy = next;
    const button = body.querySelector('.hc-submit');
    if (!button) return;
    button.disabled = next;
    button.toggleAttribute('aria-disabled', next);
    button.querySelector('[data-submit-label]').textContent = t(next ? 'contact.submitting' : 'contact.submit');
    body.querySelector('.hc-form')?.setAttribute('aria-busy', String(next));
  }

  async function submit() {
    if (busy) return;
    errors = validate();
    if (Object.keys(errors).length) {
      render();
      setStatus({ key: 'contact.errors.summary', tone: 'error' });
      focusFirstError();
      return;
    }
    setBusy(true);
    setStatus({ key: 'contact.submitting' });
    let response;
    let result = {};
    try {
      response = await fetch('/api/contact', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload()),
      });
      result = await response.json().catch(() => ({}));
    } catch {
      setBusy(false);
      setStatus({ key: 'contact.errors.network', tone: 'error' });
      statusEl.focus({ preventScroll: true });
      return;
    }
    busy = false;
    if (response.ok && result.reference) {
      submitted = { reference: String(result.reference), method: state.contactMethod };
      errors = {};
      status = null;
      render();
      const heading = body.querySelector('#hc-success-title');
      heading?.focus({ preventScroll: true });
      root.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
      return;
    }
    errors = response.status === 422 && Array.isArray(result.fields) ? serverErrors(result.fields) : {};
    const hasFieldErrors = Object.keys(errors).length > 0;
    const serverText = locale === 'tr' && typeof result.error === 'string' ? result.error : '';
    let key = 'contact.errors.server';
    if (response.status === 429) key = 'contact.errors.rateLimit';
    else if (hasFieldErrors) key = 'contact.errors.summary';
    render();
    setStatus({ key, text: serverText, tone: 'error' });
    focusFirstError();
  }

  function startOver() {
    const keep = { name: state.name, country: state.country, phone: state.phone, email: state.email, contactMethod: state.contactMethod, preferredLanguage: state.preferredLanguage };
    state = { ...blankState(), ...keep };
    submitted = null;
    errors = {};
    status = null;
    requestId = newRequestId();
  }

  root.addEventListener('input', handleField);
  root.addEventListener('change', handleField);
  root.addEventListener('submit', (event) => {
    event.preventDefault();
    submit();
  });
  root.addEventListener('click', (event) => {
    if (!event.target.closest('[data-contact-again]')) return;
    startOver();
    render();
    body.querySelector('#hc-area')?.focus();
  });

  // Tedavi listesindeki "bu alan hakkında sorun" düğmeleri alanı ve işlemi önceden seçer.
  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-ask-area]');
    if (!trigger || busy) return;
    const area = trigger.dataset.askArea;
    if (!values(HEALTH_AREAS).includes(area)) return;
    if (submitted) startOver();
    const item = trigger.dataset.askItem ?? '';
    state.treatmentArea = area;
    state.procedureChoice = item !== '' && areaItems(area)[Number(item)] ? String(Number(item)) : '';
    delete errors.treatmentArea;
    delete errors.procedure;
    render();
    root.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'start' });
    body.querySelector(state.procedureChoice ? '#hc-message' : '#hc-procedure')?.focus({ preventScroll: true });
  });

  return {
    setLocale(nextLocale) {
      locale = nextLocale;
      render();
    },
  };
}
