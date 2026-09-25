import { useState, useEffect, useRef } from "react";
import { api } from "./api.js";
export function useAutosave(key, record, dirty, setRecord) {
  const [recovery, setRecovery] = useState(null),
    [message, setMessage] = useState(""),
    [ready, setReady] = useState(false);
  const state = useRef({
    key,
    version: 0,
    timer: null,
    pending: Promise.resolve(),
    blocked: false,
    alive: true,
  });
  useEffect(() => {
    const current = {
      key,
      version: 0,
      timer: null,
      pending: Promise.resolve(),
      blocked: false,
      alive: true,
    };
    state.current = current;
    setReady(false);
    setRecovery(null);
    setMessage("");
    api(`/autosaves/${key}`)
      .then((v) => {
        if (!current.alive) return;
        current.version = v.version;
        if (v.data) setRecovery(v);
        setReady(true);
      })
      .catch((e) => {
        if (current.alive)
          setMessage("Otomatik taslak okunamadı: " + e.message);
      });
    return () => {
      current.alive = false;
      clearTimeout(current.timer);
    };
  }, [key]);
  useEffect(() => {
    const current = state.current;
    if (!record || !dirty || !ready || recovery || current.blocked) return;
    const snapshot = structuredClone(record);
    clearTimeout(current.timer);
    setMessage("Otomatik taslak bekliyor…");
    current.timer = setTimeout(() => {
      current.timer = null;
      current.pending = current.pending.then(async () => {
        if (!current.alive || current.blocked) return;
        setMessage("Otomatik taslak kaydediliyor…");
        try {
          const result = await api(`/autosaves/${key}`, {
            method: "PUT",
            body: { version: current.version, record: snapshot },
          });
          current.version = result.version;
          if (current.alive)
            setMessage(
              "Taslak otomatik kaydedildi · " +
                new Date(result.updatedAt).toLocaleTimeString("tr-TR"),
            );
        } catch (e) {
          if (e.status === 409) current.blocked = true;
          if (current.alive)
            setMessage("Otomatik taslak kaydedilemedi: " + e.message);
        }
      });
    }, 1000);
    return () => clearTimeout(current.timer);
  }, [key, record, dirty, ready, recovery]);
  const pause = async () => {
    clearTimeout(state.current.timer);
    state.current.blocked = true;
    await state.current.pending;
  };
  const clear = async () => {
    const current = state.current;
    clearTimeout(current.timer);
    await current.pending;
    if (current.version) {
      try {
        await api(`/autosaves/${key}`, {
          method: "DELETE",
          body: { version: current.version },
        });
        current.version = 0;
        setRecovery(null);
      } catch (e) {
        setMessage("Kayıt tamamlandı; eski taslak temizlenemedi: " + e.message);
        return;
      }
    }
    setMessage("");
    current.blocked = false;
  };
  return {
    recovery,
    message,
    pause,
    clear,
    resume: () => {
      state.current.blocked = false;
    },
    restore: () => {
      if (!record || !recovery) return;
      setRecord((r) => ({
        ...r,
        data: recovery.data.data,
        status: recovery.data.status,
      }));
      setRecovery(null);
      setMessage("Otomatik taslak forma yüklendi. Yayınlamak için kaydedin.");
    },
    discard: clear,
  };
}
