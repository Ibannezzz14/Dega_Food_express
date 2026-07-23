"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";
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
  ArrowRightIcon,
  CheckIcon,
  DeliveryIcon,
  MapPinIcon,
  MessageIcon,
  MinusIcon,
  PickupIcon,
  PlusIcon,
} from "@/components/icons";
import AddressAutocomplete from "./address-autocomplete";
import styles from "./order-experience.module.css";

type FulfillmentMethod = "pickup" | "delivery";
type Quantities = Record<string, number>;
type ZoneCheckState =
  | { status: "idle" | "checking" }
  | DeliveryZoneResult;

type OrderExperienceProps = {
  view: "home" | "menu";
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
  return [item.volume, item.packaging].filter(Boolean).join(" · ");
}

export default function OrderExperience({
  view,
  initialRegion = null,
}: OrderExperienceProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("plats");
  const [region, setRegion] = useState<RegionId | null>(initialRegion);
  const [fulfillmentMethod, setFulfillmentMethod] =
    useState<FulfillmentMethod | null>(null);
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [addressExtra, setAddressExtra] = useState("");
  const [zoneCheck, setZoneCheck] = useState<ZoneCheckState>({
    status: "idle",
  });
  const [zoneCheckAttempt, setZoneCheckAttempt] = useState(0);
  const [quantities, setQuantities] = useState<Quantities>({});
  const [actionState, formAction, isPending] = useActionState(
    prepareWhatsAppOrder,
    initialActionState,
  );

  const visibleItems = menuItems.filter((item) => item.category === activeCategory);
  const selectedLines = menuItems
    .map((item) => ({ item, quantity: quantities[item.id] ?? 0 }))
    .filter((line) => line.quantity > 0);
  const selectedCount = selectedLines.reduce((sum, line) => sum + line.quantity, 0);
  const itemsKnownTotal = selectedLines.reduce(
    (sum, line) =>
      line.item.price === null ? sum : sum + line.item.price * line.quantity,
    0,
  );
  const deliveryFee = calculateDeliveryFee(itemsKnownTotal);
  const appliedDeliveryFee =
    fulfillmentMethod === "delivery" ? deliveryFee : 0;
  const knownTotal = itemsKnownTotal + appliedDeliveryFee;
  const isFreeDelivery = deliveryFee === 0;
  const hasUnknownPrice = selectedLines.some((line) => line.item.price === null);
  const hasKnownAmount =
    selectedLines.some((line) => line.item.price !== null) ||
    appliedDeliveryFee > 0;
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
        : "Finaliser l’adresse";
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
      setZoneCheck({ status: "idle" });
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

  function changeStreetAddress(value: string) {
    setStreetAddress(value);
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
    document
      .getElementById(view === "menu" ? "menu-intro" : "accueil")
      ?.scrollIntoView({ behavior });
  }

  if (view === "home") {
    return (
      <section className={styles.hero} id="accueil" aria-labelledby="hero-title">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.brandLine}>Dega Food Express</p>
            <h1 id="hero-title">
              La cuisine ivoirienne,
              <span>à votre table.</span>
            </h1>
            <p className={styles.heroText}>
              Des plats préparés sur commande pour une assiette, un repas de
              famille ou un événement.
            </p>
            <Link className={styles.heroLink} href="/carte">
              Composer ma commande
              <ArrowRightIcon />
            </Link>
          </div>

          <div className={styles.plateFrame}>
            <Image
              className={styles.plateImage}
              src="/images/hero-attieke.webp"
              alt="Attiéké servi avec poisson braisé, alloco et crudités"
              fill
              priority
              sizes="(max-width: 760px) 90vw, (max-width: 1100px) 55vw, 620px"
            />
            <div className={styles.plateCaption}>
              <span>Attiéké · poisson braisé · alloco</span>
            </div>
          </div>

          <div className={styles.routePanel}>
            <ol className={styles.steps} aria-label="Étapes de la commande">
              <li className={styles.currentStep}>
                <span>1</span>
                Votre zone
              </li>
              <li>
                <span>2</span>
                Vos plats
              </li>
              <li>
                <span>3</span>
                WhatsApp
              </li>
            </ol>

            <fieldset className={styles.regionFieldset}>
              <legend>Votre zone</legend>
              <button
                type="button"
                className={region === "lausanne" ? styles.regionActive : ""}
                aria-pressed={region === "lausanne"}
                onClick={() => setRegion("lausanne")}
              >
                <MapPinIcon />
                <span>{DELIVERY_ZONES.lausanne.selectionLabel}</span>
                {region === "lausanne" && <CheckIcon />}
              </button>
              <button
                type="button"
                className={region === "lucens" ? styles.regionActive : ""}
                aria-pressed={region === "lucens"}
                onClick={() => setRegion("lucens")}
              >
                <MapPinIcon />
                <span>{DELIVERY_ZONES.lucens.selectionLabel}</span>
                {region === "lucens" && <CheckIcon />}
              </button>
            </fieldset>

            <Link
              className={styles.routeAction}
              href={region ? `/carte?zone=${region}` : "/carte"}
            >
              Continuer vers les plats
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>
    );
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
          <legend>Votre zone</legend>
          <button
            type="button"
            className={region === "lausanne" ? styles.menuRegionActive : ""}
            aria-pressed={region === "lausanne"}
            onClick={() => setRegion("lausanne")}
          >
            <MapPinIcon />
            <span>{DELIVERY_ZONES.lausanne.selectionLabel}</span>
            {region === "lausanne" && <CheckIcon />}
          </button>
          <button
            type="button"
            className={region === "lucens" ? styles.menuRegionActive : ""}
            aria-pressed={region === "lucens"}
            onClick={() => setRegion("lucens")}
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
                name="fulfillment"
                value="pickup"
                checked={fulfillmentMethod === "pickup"}
                onChange={() => setFulfillmentMethod("pickup")}
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
                onChange={() => setFulfillmentMethod("delivery")}
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
            <div className={styles.addressPanel}>
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
                  <span role="alert">
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
            aria-live="polite"
          >
            {visibleItems.map((item, index) => {
              const quantity = quantities[item.id] ?? 0;
              const detail = itemDetail(item);
              const previousItem = visibleItems[index - 1];
              const showSection =
                item.section &&
                (!previousItem || previousItem.section !== item.section);

              return (
                <div key={item.id}>
                  {showSection && (
                    <h3 className={styles.sectionLabel}>
                      {sectionLabels[item.section!]}
                    </h3>
                  )}
                  <article
                    className={`${styles.menuItem} ${
                      quantity > 0 ? styles.menuItemSelected : ""
                    }`}
                  >
                    <div className={styles.itemName}>
                      <h3>{item.name}</h3>
                      {detail && <p>{detail}</p>}
                    </div>
                    <p className={styles.price}>
                      {item.price === null
                        ? "Prix à confirmer"
                        : `${formatPrice(item.price)} CHF`}
                    </p>

                    {quantity === 0 ? (
                      <button
                        type="button"
                        className={styles.addButton}
                        onClick={() => changeQuantity(item.id, 1)}
                        aria-label={`Ajouter ${item.name}`}
                      >
                        <PlusIcon />
                        <span>Ajouter</span>
                      </button>
                    ) : (
                      <div className={styles.quantityControl}>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, -1)}
                          aria-label={`Retirer un ${item.name}`}
                        >
                          <MinusIcon />
                        </button>
                        <output aria-label={`Quantité de ${item.name}`}>
                          {quantity}
                        </output>
                        <button
                          type="button"
                          onClick={() => changeQuantity(item.id, 1)}
                          aria-label={`Ajouter un ${item.name}`}
                          disabled={quantity >= 20}
                        >
                          <PlusIcon />
                        </button>
                      </div>
                    )}
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {selectedCount > 0 && (
          <div className={`${styles.orderDock} ${styles.orderDockVisible}`} aria-live="polite">
            <div className={styles.orderCount}>
              <span>Votre commande</span>
              <strong>
                {selectedCount} {selectedCount > 1 ? "articles" : "article"}
              </strong>
            </div>
            <div className={styles.orderTotal}>
              <span>
                {!hasKnownAmount && hasUnknownPrice
                  ? "Prix"
                  : hasUnknownPrice
                    ? "Total connu"
                    : fulfillmentMethod === "delivery"
                      ? "Total livré"
                      : "Total"}
              </span>
              <strong>
                {!hasKnownAmount && hasUnknownPrice
                  ? "À confirmer"
                  : `${formatPrice(knownTotal)} CHF`}
              </strong>
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
                {setupActionLabel}
              </button>
            )}
            {actionState.status === "error" && (
              <p className={styles.formError} role="alert">
                {actionState.message}
              </p>
            )}
          </div>
        )}
      </section>
    </form>
  );
}
