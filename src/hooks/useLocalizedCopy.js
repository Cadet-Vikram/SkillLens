import { useEffect, useState } from "react";
import { translateTexts } from "../services/uiTranslationService";

export function useLocalizedCopy(language, sourceCopy) {
  const [copy, setCopy] = useState(sourceCopy);
  const sourceCopySignature = JSON.stringify(sourceCopy);

  // The dependency is intentionally the serialized copy payload so translation only reruns
  // when the actual visible strings change.
  useEffect(() => {
    let active = true;
    const entries = Object.entries(sourceCopy);
    const stringEntries = entries.filter(([, value]) => typeof value === "string");
    const values = stringEntries.map(([, value]) => value);

    const run = async () => {
      try {
        const translated = await translateTexts(values, language);
        if (!active) return;
        const next = {};
        let stringIndex = 0;
        entries.forEach(([key, value]) => {
          if (typeof value === "string") {
            next[key] = translated[stringIndex++] ?? value;
          } else {
            next[key] = value;
          }
        });
        setCopy(next);
      } catch (_) {
        if (active) setCopy(sourceCopy);
      }
    };

    run();
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language, sourceCopySignature]);

  return copy;
}
