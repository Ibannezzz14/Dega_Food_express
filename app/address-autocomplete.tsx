"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { MapPinIcon } from "@/components/icons";
import type { RegionId } from "@/data/delivery-zones";
import type { AddressLookupSuggestion } from "@/lib/address-suggestions";
import styles from "./order-experience.module.css";

type AddressSearchField = "streetAddress" | "postalCode" | "city";

type AddressAutocompleteProps = {
  region: RegionId | null;
  streetAddress: string;
  postalCode: string;
  city: string;
  onStreetAddressChange: (value: string) => void;
  onPostalCodeChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onAddressSelect: (suggestion: AddressLookupSuggestion) => void;
};

type SuggestionStatus = "idle" | "loading" | "ready" | "error";

const minimumQueryLength: Record<AddressSearchField, number> = {
  streetAddress: 3,
  postalCode: 2,
  city: 2,
};

function isAddressLookupSuggestion(
  value: unknown,
): value is AddressLookupSuggestion {
  if (!value || typeof value !== "object") {
    return false;
  }

  const suggestion = value as Partial<AddressLookupSuggestion>;
  if (
    typeof suggestion.key !== "string" ||
    typeof suggestion.label !== "string" ||
    typeof suggestion.postalCode !== "string" ||
    typeof suggestion.city !== "string"
  ) {
    return false;
  }

  return (
    (suggestion.kind === "address" &&
      typeof suggestion.streetAddress === "string") ||
    suggestion.kind === "locality"
  );
}

export default function AddressAutocomplete({
  region,
  streetAddress,
  postalCode,
  city,
  onStreetAddressChange,
  onPostalCodeChange,
  onCityChange,
  onAddressSelect,
}: AddressAutocompleteProps) {
  const generatedId = useId().replace(/:/g, "");
  const listboxBaseId = `address-suggestions-${generatedId}`;
  const [activeField, setActiveField] = useState<AddressSearchField | null>(
    null,
  );
  const [suggestions, setSuggestions] = useState<AddressLookupSuggestion[]>([]);
  const [status, setStatus] = useState<SuggestionStatus>("idle");
  const [activeIndex, setActiveIndex] = useState(-1);
  const requestSequence = useRef(0);
  const blurTimer = useRef<number | null>(null);

  const activeQuery =
    activeField === "streetAddress"
      ? streetAddress
      : activeField === "postalCode"
        ? postalCode
        : activeField === "city"
          ? city
          : "";

  useEffect(() => {
    if (!activeField) {
      setSuggestions([]);
      setStatus("idle");
      setActiveIndex(-1);
      return;
    }

    const query = activeQuery.trim();
    if (query.length < minimumQueryLength[activeField]) {
      setSuggestions([]);
      setStatus("idle");
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const currentRequest = ++requestSequence.current;
    const timer = window.setTimeout(async () => {
      setStatus("loading");

      try {
        const response = await fetch("/api/address-suggestions", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            field: activeField,
            query,
            region,
            postalCode,
            city,
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Address suggestions unavailable");
        }

        const payload = (await response.json()) as { suggestions?: unknown };
        if (
          controller.signal.aborted ||
          currentRequest !== requestSequence.current
        ) {
          return;
        }

        const nextSuggestions = Array.isArray(payload.suggestions)
          ? payload.suggestions.filter(isAddressLookupSuggestion)
          : [];
        setSuggestions(nextSuggestions);
        setActiveIndex(-1);
        setStatus("ready");
      } catch (error) {
        if (
          controller.signal.aborted ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        setSuggestions([]);
        setActiveIndex(-1);
        setStatus("error");
      }
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [activeField, activeQuery, city, postalCode, region]);

  useEffect(
    () => () => {
      if (blurTimer.current !== null) {
        window.clearTimeout(blurTimer.current);
      }
    },
    [],
  );

  function clearSuggestionState() {
    requestSequence.current += 1;
    setSuggestions([]);
    setActiveIndex(-1);
    setStatus("idle");
  }

  function closeSuggestions() {
    clearSuggestionState();
    setActiveField(null);
  }

  function focusField(field: AddressSearchField) {
    if (blurTimer.current !== null) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }

    if (activeField !== field) {
      clearSuggestionState();
    }
    setActiveField(field);
  }

  function scheduleClose() {
    blurTimer.current = window.setTimeout(() => {
      closeSuggestions();
      blurTimer.current = null;
    }, 120);
  }

  function changeField(field: AddressSearchField, value: string) {
    clearSuggestionState();
    setActiveField(field);

    if (field === "streetAddress") {
      onStreetAddressChange(value);
    } else if (field === "postalCode") {
      onPostalCodeChange(value.replace(/\D/g, "").slice(0, 4));
    } else {
      onCityChange(value);
    }
  }

  function chooseSuggestion(suggestion: AddressLookupSuggestion) {
    if (blurTimer.current !== null) {
      window.clearTimeout(blurTimer.current);
      blurTimer.current = null;
    }

    closeSuggestions();
    onAddressSelect(suggestion);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    field: AddressSearchField,
  ) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSuggestions();
      return;
    }

    if (activeField !== field || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) =>
        current < 0 || current >= suggestions.length - 1 ? 0 : current + 1,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (activeIndex >= 0) {
        chooseSuggestion(suggestions[activeIndex]);
      }
    }
  }

  function listboxId(field: AddressSearchField) {
    return `${listboxBaseId}-${field}`;
  }

  function isListboxOpen(field: AddressSearchField) {
    return (
      activeField === field &&
      status === "ready" &&
      suggestions.length > 0
    );
  }

  function activeSuggestionId(field: AddressSearchField) {
    return isListboxOpen(field) && activeIndex >= 0
      ? `${listboxId(field)}-option-${activeIndex}`
      : undefined;
  }

  function renderSuggestionPanel(field: AddressSearchField) {
    const query =
      field === "streetAddress"
        ? streetAddress
        : field === "postalCode"
          ? postalCode
          : city;
    const shouldShowPanel =
      activeField === field &&
      query.trim().length >= minimumQueryLength[field] &&
      status !== "idle";

    if (!shouldShowPanel) {
      return null;
    }

    return (
      <div className={styles.addressSuggestionsPanel}>
        {status === "loading" && (
          <div className={styles.addressSuggestionStatus}>
            <span aria-hidden="true" />
            Recherche…
          </div>
        )}

        {status === "error" && (
          <div className={styles.addressSuggestionStatus}>
            Continuez la saisie manuellement.
          </div>
        )}

        {status === "ready" && suggestions.length === 0 && (
          <div className={styles.addressSuggestionStatus}>
            Aucune proposition trouvée.
          </div>
        )}

        {status === "ready" && suggestions.length > 0 && (
          <ul id={listboxId(field)} role="listbox">
            {suggestions.map((suggestion, index) => {
              const primaryText =
                suggestion.kind === "address"
                  ? suggestion.streetAddress
                  : field === "postalCode"
                    ? suggestion.postalCode
                    : suggestion.city;
              const secondaryText =
                suggestion.kind === "address"
                  ? `${suggestion.postalCode} ${suggestion.city}`
                  : field === "postalCode"
                    ? suggestion.city
                    : suggestion.postalCode;

              return (
                <li
                  id={`${listboxId(field)}-option-${index}`}
                  key={suggestion.key}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={
                    index === activeIndex
                      ? styles.addressSuggestionActive
                      : ""
                  }
                  onPointerMove={(event) => {
                    if (event.pointerType === "mouse") {
                      setActiveIndex(index);
                    }
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseSuggestion(suggestion)}
                >
                  <MapPinIcon />
                  <span>
                    <strong>{primaryText}</strong>
                    <small>{secondaryText}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  const liveMessage =
    status === "loading"
      ? "Recherche de propositions."
      : status === "ready" && suggestions.length > 0
        ? `${suggestions.length} proposition${suggestions.length > 1 ? "s" : ""} disponible${suggestions.length > 1 ? "s" : ""}.`
        : status === "ready"
          ? "Aucune proposition trouvée."
          : status === "error"
            ? "Les propositions sont momentanément indisponibles."
            : "";

  return (
    <>
      <div className={`${styles.addressField} ${styles.streetField}`}>
        <label htmlFor="streetAddress">Rue et numéro</label>
        <div className={styles.addressAutocomplete}>
          <input
            id="streetAddress"
            type="text"
            name="streetAddress"
            value={streetAddress}
            onChange={(event) =>
              changeField("streetAddress", event.target.value)
            }
            onFocus={() => focusField("streetAddress")}
            onBlur={scheduleClose}
            onKeyDown={(event) => handleKeyDown(event, "streetAddress")}
            autoComplete="address-line1"
            placeholder="Avenue de Lausanne 12"
            minLength={5}
            maxLength={120}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isListboxOpen("streetAddress")}
            aria-controls={
              isListboxOpen("streetAddress")
                ? listboxId("streetAddress")
                : undefined
            }
            aria-activedescendant={activeSuggestionId("streetAddress")}
            aria-busy={
              activeField === "streetAddress" && status === "loading"
            }
            required
          />
          {renderSuggestionPanel("streetAddress")}
        </div>
      </div>

      <div className={`${styles.addressField} ${styles.postalField}`}>
        <label htmlFor="postalCode">NPA</label>
        <div className={styles.addressAutocomplete}>
          <input
            id="postalCode"
            type="text"
            name="postalCode"
            value={postalCode}
            onChange={(event) => changeField("postalCode", event.target.value)}
            onFocus={() => focusField("postalCode")}
            onBlur={scheduleClose}
            onKeyDown={(event) => handleKeyDown(event, "postalCode")}
            autoComplete="postal-code"
            inputMode="numeric"
            placeholder="1003"
            pattern="[0-9]{4}"
            maxLength={4}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isListboxOpen("postalCode")}
            aria-controls={
              isListboxOpen("postalCode")
                ? listboxId("postalCode")
                : undefined
            }
            aria-activedescendant={activeSuggestionId("postalCode")}
            aria-busy={activeField === "postalCode" && status === "loading"}
            required
          />
          {renderSuggestionPanel("postalCode")}
        </div>
      </div>

      <div className={`${styles.addressField} ${styles.localityField}`}>
        <label htmlFor="city">Localité</label>
        <div className={styles.addressAutocomplete}>
          <input
            id="city"
            type="text"
            name="city"
            value={city}
            onChange={(event) => changeField("city", event.target.value)}
            onFocus={() => focusField("city")}
            onBlur={scheduleClose}
            onKeyDown={(event) => handleKeyDown(event, "city")}
            autoComplete="address-level2"
            placeholder="Lausanne"
            minLength={2}
            maxLength={80}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isListboxOpen("city")}
            aria-controls={
              isListboxOpen("city") ? listboxId("city") : undefined
            }
            aria-activedescendant={activeSuggestionId("city")}
            aria-busy={activeField === "city" && status === "loading"}
            required
          />
          {renderSuggestionPanel("city")}
        </div>
      </div>

      <span className="sr-only" role="status" aria-live="polite">
        {liveMessage}
      </span>
    </>
  );
}
