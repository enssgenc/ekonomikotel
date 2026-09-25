const DAY = 86400000;
export const validDate = (value) =>
  typeof value === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
export function calculateStay(
  hotel,
  input,
  today = new Date().toISOString().slice(0, 10),
) {
  const { roomId, start, end, adults, childAges = [] } = input;
  const fail = (message) => ({ available: false, message });
  if (!validDate(start) || !validDate(end) || start < today || end <= start)
    return fail("Geçerli giriş ve çıkış tarihlerini seçin.");
  const nights = (Date.parse(end) - Date.parse(start)) / DAY;
  if (nights > 90)
    return fail("90 geceden uzun konaklama için özel teklif isteyin.");
  const room = hotel.rooms?.find((r) => r.id === roomId);
  if (!room) return fail("Bir oda tipi seçin.");
  if (
    !Number.isInteger(adults) ||
    adults < 1 ||
    !Array.isArray(childAges) ||
    childAges.length > 10 ||
    childAges.some((a) => !Number.isInteger(a) || a < 0 || a > 17)
  )
    return fail("Misafir sayısı ve çocuk yaşlarını kontrol edin.");
  if (adults + childAges.length > room.capacity)
    return fail("Seçilen oda bu misafir sayısı için uygun değil.");
  const lines = [];
  let currency;
  for (let i = 0; i < nights; i++) {
    const date = new Date(Date.parse(start) + i * DAY)
      .toISOString()
      .slice(0, 10);
    const plans = (hotel.ratePlans || []).filter(
      (p) =>
        p.enabled && p.roomId === roomId && p.start <= date && p.end >= date,
    );
    if (plans.length !== 1)
      return fail(
        "Seçilen tarihlerin tamamı için fiyat tanımlı değil. Özel teklif isteyin.",
      );
    const plan = plans[0];
    if (nights < plan.minNights)
      return fail(
        `Bu dönem en az ${plan.minNights} gece konaklama gerektiriyor.`,
      );
    if (currency && currency !== plan.currency)
      return fail(
        "Tarih aralığında farklı para birimleri var. Özel teklif isteyin.",
      );
    currency = plan.currency;
    let cents =
      Math.round(plan.basePrice * 100) +
      Math.max(0, adults - plan.includedAdults) *
        Math.round(plan.extraAdultPrice * 100);
    for (const age of childAges) {
      const band = plan.childBands.find(
        (b) => b.minAge <= age && b.maxAge >= age,
      );
      if (!band)
        return fail(
          `${age} yaş için çocuk fiyatı tanımlı değil. Özel teklif isteyin.`,
        );
      cents += Math.round(band.price * 100);
    }
    lines.push({ date, amount: cents / 100, plan: plan.name });
  }
  return {
    available: true,
    indicative: true,
    room: room.name,
    nights,
    currency,
    total: lines.reduce((n, l) => n + Math.round(l.amount * 100), 0) / 100,
    lines,
    message:
      "Tanımlı dönem fiyatlarına göre hesaplama. Müsaitlik ve kesin fiyat teklif aşamasında onaylanır.",
  };
}
