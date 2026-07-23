"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { prepareWhatsAppOrder, type OrderActionState } from "./actions";
import {
  DELIVERY_ZONES,
  type DeliveryZoneResult,
  type RegionId,
} from "@/data/delivery-zones";
import { categories, menuItems, type CategoryId, type MenuItem } from "@/data/menu";
import {
  calculateDeliveryFee,
  FREE_DELIVERY_THRESHOLD,
} from "@/data/order-rules";
import {
  applyAddressLookupSuggestion,
  type AddressLookupSuggestion,
} from "@/lib/address-suggestions";
import {
  CheckIcon,
  DeliveryIcon,
  MapPinIcon,
  MessageIcon,
  MinusIcon,
  PickupIcon,
  PlusIcon,
} from "@/components/icons";
import AddressAutocomplete from "./address-autocomplete";
import {
  useOrderSession,
  type FulfillmentMethod,
} from "./order-session";
import styles from "./order-experience.module.css";

type ZoneCheckState =
  | { status: "idle" | "checking" }
  | DeliveryZoneResult;

type OrderExperienceProps = {
  initialRegion?: RegionId | null;
};

const initialActionState: OrderActionState = {
  status: "idle",
  message: "",
};

const sectionLabels = {
  "sans-alcool": "Sans alcool",
  bieres: "Bières",
  vins: "Vins",
} as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-CH", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function itemDetail(item: MenuItem) {
  return [item.packaging, item.volume].filter(Boolean).join(" · ");
}

export default function OrderExperience({
  initialRegion = null,
}: OrderExperienceProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("plats");
  const {
    fulfillmentMethod,
    quantities,
    region: storedRegion,
    setFulfillmentMethod,
    setQuantities,
    setRegion,
  } = useOrderSession();
  const region = storedRegion ?? initialRegion;
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [addressExtra, setAddressExtra] = useState("");
  const [zoneCheck, setZoneCheck] = useState<ZoneCheckState>({
    status: "idle",
  });
  const [zoneCheckAttempt, setZoneCheckAttempt] = useState(0);
  const formErrorRef = useRef<HTMLParagraphElement>(null);
  const incrementButtonRefs = useRef(
    new Map<string, HTMLButtonElement>(),
  );
  const [actionState, formAction, isPending] = useActionState(
    prepareWhatsAppOrder,
    initialActionState,
  );

  const visibleItems = menuItems.filter((item) => item.category === activeCategory);
  const selectedLines = menuItems
    .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
    .filter((line) => line.quantity > 0);
  const selectedCount = selectedLines.reduce((sum, line) => sum + line.quantity, 0);
  const itemsSubtotal = selectedLines.reduce(
    (sum, line) => sum + line.item.price * line.quantity,
    0,
  );
  const deliveryFee = calculateDeliveryFee(itemsSubtotal);
  const appliedDeliveryFee =
    fulfillmentMethod === "delivery" ? deliveryFee : 0;
  const orderTotal = itemsSubtotal + appliedDeliveryFee;
  const isFreeDelivery = deliveryFee === 0;
  const hasValidDeliveryAddress =
    fulfillmentMethod !== "delivery" ||
    (streetAddress.trim().length >= 5 &&
      /^\d{4}$/.test(postalCode) &&
      city.trim().length >= 2);
  const hasValidDeliveryZone =
    fulfillmentMethod !== "delivery" || zoneCheck.status === "eligible";
  const isOrderReady =
    region !== null &&
    fulfillmentMethod !== null &&
    hasValidDeliveryAddress &&
    hasValidDeliveryZone;
  const setupActionLabel = !region
    ? "Choisir la zone"
    : !fulfillmentMethod
      ? "Retrait ou livraison"
      : !hasValidDeliveryAddress
        ? "Compléter l’adresse"
        : zoneCheck.status === "checking"
          ? "Vérification…"
          : "Finaliser l’adresse";
  const setupActionShortLabel = !region
    ? "Zone"
    : !fulfillmentMethod
      ? "Mode"
      : zoneCheck.status === "checking"
        ? "Vérification…"
        : "Adresse";
  const orderStatusMessage =
    selectedCount === 0
      ? "Votre commande est vide."
      : `${selectedCount} ${selectedCount > 1 ? "articles" : "article"} dans votre commande. Total ${formatPrice(orderTotal)} francs.`;
  const serializedOrder = JSON.stringify(
    selectedLines.map(({ item, quantity }) => ({ id: item.id, quantity })),
  );
  useEffect(() => {
    if (
      fulfillmentMethod !== "delivery" ||
      !region ||
      streetAddress.trim().length < 5 ||
      !/^\d{4}$/.test(postalCode) ||
      city.trim().length < 2
    ) {
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setZoneCheck({ status: "checking" });

      try {
        const response = await fetch("/api/delivery-zone", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            region,
            streetAddress: streetAddress.trim(),
            postalCode,
            city: city.trim(),
          }),
          signal: controller.signal,
        });
        const result = (await response.json()) as DeliveryZoneResult;

        if (!controller.signal.aborted) {
          if (
            result.status === "outside" &&
            result.suggestedRegion
          ) {
            setZoneCheck({
              status: "eligible",
              region: result.suggestedRegion,
              distanceKm: 0,
            });
          } else {
            setZoneCheck(result);
          }
        }
      } catch {
        if (!controller.signal.aborted) {
          setZoneCheck({ status: "service_error" });
        }
      }
    }, 450);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [
    city,
    fulfillmentMethod,
    postalCode,
    region,
    streetAddress,
    zoneCheckAttempt,
  ]);

  useEffect(() => {
    if (actionState.status === "error") {
      formErrorRef.current?.focus();
    }
  }, [actionState.message, actionState.status]);

  function changeStreetAddress(value: string) {
    setStreetAddress(value);
    setZoneCheck({ status: "idle" });
  }

  function changeRegion(value: RegionId) {
    setRegion(value);
    setZoneCheck({ status: "idle" });
  }

  function changeFulfillmentMethod(value: FulfillmentMethod) {
    if (!storedRegion && initialRegion) {
      setRegion(initialRegion);
    }
    setFulfillmentMethod(value);
    setZoneCheck({ status: "idle" });
  }

  function changePostalCode(value: string) {
    setPostalCode(value);
    setZoneCheck({ status: "idle" });
  }

  function changeCity(value: string) {
    setCity(value);
    setZoneCheck({ status: "idle" });
  }

  function selectAddressSuggestion(suggestion: AddressLookupSuggestion) {
    const nextAddress = applyAddressLookupSuggestion(
      { streetAddress, postalCode, city },
      suggestion,
    );

    setStreetAddress(nextAddress.streetAddress);
    setPostalCode(nextAddress.postalCode);
    setCity(nextAddress.city);
    setZoneCheck({ status: "idle" });
  }

  function changeQuantity(itemId: string, delta: number) {
    setQuantities((current) => {
      const nextQuantity = Math.min(20, Math.max(0, (current[itemId] ?? 0) + delta));
      const next = { ...current };

      if (nextQuantity === 0) {
        delete next[itemId];
      } else {
        next[itemId] = nextQuantity;
      }

      return next;
    });
  }

  function chooseCategory(categoryId: CategoryId) {
    setActiveCategory(categoryId);
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    document.getElementById("carte")?.scrollIntoView({ behavior });
  }

  function returnToSetup() {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    const target = !region
      ? document.getElementById("menu-region-lausanne")
      : !fulfillmentMethod
        ? document.getElementById("fulfillment-pickup")
        : document.getElementById("streetAddress");

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior, block: "center" });
  }

  return (
    <form action={formAction} className={styles.orderForm}>
      <input type="hidden" name="region" value={region ?? ""} />
      <input type="hidden" name="order" value={serializedOrder} />

      <section
        className={styles.menuPageIntro}
        id="menu-intro"
        aria-labelledby="menu-page-title"
      >
        <div className={styles.menuPageCopy}>
          <p>Dega Food Express</p>
          <h1 id="menu-page-title">Composez votre commande.</h1>
          <span>
            Choisissez votre zone, ajoutez les plats puis continuez sur
            WhatsApp.
          </span>
        </div>

        <fieldset className={styles.menuRegionFieldset}>
          <legend>
            Votre zone <span className="sr-only">(obligatoire)</span>
          </legend>
          <button
            id="menu-region-lausanne"
            type="button"
            className={region === "lausanne" ? styles.menuRegionActive : ""}
            aria-pressed={region === "lausanne"}
            onClick={() => changeRegion("lausanne")}
          >
            <MapPinIcon />
            <span>{DELIVERY_ZONES.lausanne.selectionLabel}</span>
            {region === "lausanne" && <CheckIcon />}
          </button>
          <button
            type="button"
            className={region === "lucens" ? styles.menuRegionActive : ""}
            aria-pressed={region === "lucens"}
            onClick={() => changeRegion("lucens")}
          >
            <MapPinIcon />
            <span>{DELIVERY_ZONES.lucens.selectionLabel}</span>
            {region === "lucens" && <CheckIcon />}
          </button>
        </fieldset>

        <fieldset className={styles.fulfillmentFieldset}>
          <legend>Retrait ou livraison</legend>
          <div className={styles.fulfillmentOptions}>
            <label
              className={
                fulfillmentMethod === "pickup" ? styles.fulfillmentActive : ""
              }
            >
              <input
                className={styles.fulfillmentInput}
                type="radio"
                id="fulfillment-pickup"
                name="fulfillment"
                value="pickup"
                checked={fulfillmentMethod === "pickup"}
                onChange={() => changeFulfillmentMethod("pickup")}
                required
              />
              <span className={styles.fulfillmentIcon}>
                <PickupIcon />
              </span>
              <span className={styles.fulfillmentCopy}>
                <strong>Retrait</strong>
                <small>À convenir</small>
              </span>
              <span className={styles.fulfillmentState} aria-hidden="true">
                {fulfillmentMethod === "pickup" && <CheckIcon />}
              </span>
            </label>
            <label
              className={
                fulfillmentMethod === "delivery" ? styles.fulfillmentActive : ""
              }
            >
              <input
                className={styles.fulfillmentInput}
                type="radio"
                name="fulfillment"
                value="delivery"
                checked={fulfillmentMethod === "delivery"}
                onChange={() => changeFulfillmentMethod("delivery")}
                required
              />
              <span className={styles.fulfillmentIcon}>
                <DeliveryIcon />
              </span>
              <span className={styles.fulfillmentCopy}>
                <strong>Livraison</strong>
                <small aria-live="polite">
                  {isFreeDelivery ? "Offerte" : "7,90 CHF"}
                </small>
              </span>
              <span className={styles.fulfillmentState} aria-hidden="true">
                {fulfillmentMethod === "delivery" && <CheckIcon />}
              </span>
            </label>
          </div>

          {fulfillmentMethod === "delivery" && (
            <div
              className={styles.addressPanel}
              aria-busy={zoneCheck.status === "checking"}
            >
              <div className={styles.addressPanelHeader}>
                <span className={styles.addressIcon}>
                  <MapPinIcon />
                </span>
                <span className={styles.addressPanelTitle}>
                  <strong>Adresse postale</strong>
                </span>
              </div>

              <div className={styles.addressFields}>
                <AddressAutocomplete
                  region={region}
                  streetAddress={streetAddress}
                  postalCode={postalCode}
                  city={city}
                  onStreetAddressChange={changeStreetAddress}
                  onPostalCodeChange={changePostalCode}
                  onCityChange={changeCity}
                  onAddressSelect={selectAddressSuggestion}
                  errorId="delivery-zone-error"
                  invalid={
                    zoneCheck.status === "outside" ||
                    zoneCheck.status === "not_found"
                  }
                />

                <label className={`${styles.addressField} ${styles.extraField}`}>
                  <span>
                    Complément <small>facultatif</small>
                  </span>
                  <input
                    type="text"
                    name="addressExtra"
                    value={addressExtra}
                    onChange={(event) => setAddressExtra(event.target.value)}
                    autoComplete="address-line2"
                    placeholder="Étage, entrée ou indication"
                    maxLength={100}
                  />
                </label>
              </div>

              {(zoneCheck.status === "outside" ||
                zoneCheck.status === "not_found" ||
                zoneCheck.status === "service_error") && (
                <div
                  className={`${styles.deliveryZoneStatus} ${styles.deliveryZoneError}`}
                >
                  <span
                    className={styles.deliveryZoneIndicator}
                    aria-hidden="true"
                  />
                  <span id="delivery-zone-error" role="alert">
                    {zoneCheck.status === "outside" &&
                      "La livraison n’est pas disponible à cette adresse."}
                    {zoneCheck.status === "not_found" &&
                      "Vérifiez la rue, le NPA et la localité."}
                    {zoneCheck.status === "service_error" &&
                      "La vérification est momentanément indisponible."}
                  </span>

                  {zoneCheck.status === "service_error" && (
                    <button
                      type="button"
                      onClick={() => setZoneCheckAttempt((attempt) => attempt + 1)}
                    >
                      Réessayer
                    </button>
                  )}
                </div>
              )}

              {zoneCheck.status === "checking" && (
                <div
                  className={`${styles.deliveryZoneStatus} ${styles.deliveryZoneChecking}`}
                  role="status"
                >
                  <span
                    className={styles.deliveryZoneIndicator}
                    aria-hidden="true"
                  />
                  <span>Vérification de l’adresse…</span>
                </div>
              )}

              {zoneCheck.status === "eligible" && (
                <div className={styles.deliveryZoneStatus} role="status">
                  <span
                    className={styles.deliveryZoneSuccessIndicator}
                    aria-hidden="true"
                  />
                  <span>Adresse de livraison vérifiée.</span>
                </div>
              )}

              <p className={styles.deliveryFeeRule}>
                {isFreeDelivery
                  ? "Frais de livraison offerts"
                  : `Livraison ${formatPrice(deliveryFee)} CHF · offerte au-delà de ${formatPrice(FREE_DELIVERY_THRESHOLD)} CHF`}
              </p>
            </div>
          )}
        </fieldset>
      </section>

      <section className={styles.menuSection} id="carte" aria-labelledby="menu-title">
        <nav className={styles.categoryRail} aria-label="Catégories de la carte">
          {categories.map((category) => (
            <button
              type="button"
              key={category.id}
              aria-pressed={activeCategory === category.id}
              className={activeCategory === category.id ? styles.categoryActive : ""}
              onClick={() => chooseCategory(category.id)}
            >
              <span>{category.shortLabel}</span>
              <small>
                {menuItems.filter((item) => item.category === category.id).length}
              </small>
            </button>
          ))}
        </nav>

        <div className={styles.menuHeading}>
          <div>
            <h2 id="menu-title">
              {categories.find((category) => category.id === activeCategory)?.label}
            </h2>
            <p>{visibleItems.length} choix</p>
          </div>
        </div>

        <div className={styles.menuBody}>
          <div
            className={styles.itemList}
            id={`panel-${activeCategory}`}
          >
            {visibleItems.map((item, index) => {
              const quantity = quantities[item.id] ?? 0;
              const detail = itemDetail(item);
              const accessibleItemName = detail
                ? `${item.name}, ${detail}`
                : item.name;
              const previousItem = visibleItems[index - 1];
              const showSection =
                item.section &&
                (!previousItem || previousItem.section !== item.section);

              return (
                <div key={item.id}>
                  {showSection && (
                    <p className={styles.sectionLabel}>
                      {sectionLabels[item.section!]}
                    </p>
                  )}
                  <article
                    className={`${styles.menuItem} ${
                      quantity > 0 ? styles.menuItemSelected : ""
                    }`}
                  >
                    {item.imageStatus === "pending" ? (
                      <div
                        className={`${styles.itemImage} ${styles.itemImagePending}`}
                        aria-hidden="true"
                      >
                        <span>Dega Food</span>
                      </div>
                    ) : (
                      <div
                        className={`${styles.itemImage} ${
                          item.imageFit === "contain"
                            ? styles.itemImageContain
                            : ""
                        }`}
                      >
                        <Image
                          src={item.image}
                          alt={item.imageAlt}
                          fill
                          sizes="(max-width: 420px) 80px, (max-width: 760px) 88px, 116px"
                        />
                      </div>
                    )}
                    <div className={styles.itemName}>
                      <h3>{item.name}</h3>
                      {detail && <p>{detail}</p>}
                    </div>
                    <p className={styles.price}>
                      {formatPrice(item.price)} CHF
                    </p>

                    <div
                      className={`${styles.quantityControl} ${
                        quantity === 0 ? styles.quantityControlEmpty : ""
                      }`}
                    >
                      <button
                        type="button"
                        hidden={quantity === 0}
                        onClick={() => {
                          changeQuantity(item.id, -1);
                          if (quantity === 1) {
                            window.requestAnimationFrame(() => {
                              incrementButtonRefs.current.get(item.id)?.focus();
                            });
                          }
                        }}
                        aria-label={`Retirer un ${accessibleItemName}`}
                      >
                        <MinusIcon />
                      </button>
                      <output
                        hidden={quantity === 0}
                        aria-label={`Quantité de ${accessibleItemName}`}
                      >
                        {quantity}
                      </output>
                      <button
                        ref={(node) => {
                          if (node) {
                            incrementButtonRefs.current.set(item.id, node);
                          } else {
                            incrementButtonRefs.current.delete(item.id);
                          }
                        }}
                        type="button"
                        onClick={() => changeQuantity(item.id, 1)}
                        aria-label={
                          quantity === 0
                            ? `Ajouter ${accessibleItemName}`
                            : `Ajouter un ${accessibleItemName}`
                        }
                        disabled={quantity >= 20}
                      >
                        <PlusIcon />
                        <span className={styles.addButtonLabel}>Ajouter</span>
                      </button>
                    </div>
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {selectedCount > 0 && (
          <div className={`${styles.orderDock} ${styles.orderDockVisible}`}>
            <div className={styles.orderCount}>
              <span>Votre commande</span>
              <strong>
                {selectedCount} {selectedCount > 1 ? "articles" : "article"}
              </strong>
            </div>
            <div className={styles.orderTotal}>
              <span>
                {fulfillmentMethod === "delivery" ? "Total livré" : "Total"}
              </span>
              <strong>{formatPrice(orderTotal)} CHF</strong>
            </div>
            {isOrderReady ? (
              <button
                type="submit"
                className={styles.submitButton}
                disabled={isPending}
              >
                <MessageIcon />
                {isPending ? (
                  "Préparation…"
                ) : (
                  <>
                    <span className={styles.submitLong}>Envoyer sur WhatsApp</span>
                    <span className={styles.submitShort}>WhatsApp</span>
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                className={styles.submitButton}
                onClick={returnToSetup}
              >
                <MapPinIcon />
                <span className={styles.submitLong}>{setupActionLabel}</span>
                <span className={styles.submitShort}>
                  {setupActionShortLabel}
                </span>
              </button>
            )}
            {actionState.status === "error" && (
              <p
                ref={formErrorRef}
                className={styles.formError}
                role="alert"
                tabIndex={-1}
              >
                {actionState.message}
              </p>
            )}
          </div>
        )}
        <span
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {orderStatusMessage}
        </span>
      </section>
    </form>
  );
}
