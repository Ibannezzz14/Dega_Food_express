"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import { prepareWhatsAppOrder, type OrderActionState } from "./actions";
import {
  DELIVERY_ZONES,
  PUBLIC_REGIONS,
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
  DELIVERY_PAYMENT_METHODS,
  type DeliveryPaymentMethod,
} from "@/lib/order-payment";
import {
  CartIcon,
  CheckIcon,
  DeliveryIcon,
  MapPinIcon,
  MinusIcon,
  PickupIcon,
  PlusIcon,
} from "@/components/icons";
import AddressAutocomplete from "./address-autocomplete";
import OrderCart from "./order-cart";
import {
  useOrderSession,
  type FulfillmentMethod,
} from "./order-session";
import styles from "./order-experience.module.css";

type ZoneCheckState =
  | { status: "idle" | "checking" }
  | DeliveryZoneResult;

type OrderExperienceProps = {
  initialFulfillmentMethod?: FulfillmentMethod | null;
  initialRegion?: RegionId | null;
};

const initialActionState: OrderActionState = {
  status: "idle",
  message: "",
};

const sectionLabels = {
  "sans-alcool": "Sans alcool",
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
  initialFulfillmentMethod = null,
  initialRegion = null,
}: OrderExperienceProps) {
  const [activeCategory, setActiveCategory] = useState<CategoryId>("plats");
  const {
    fulfillmentMethod: storedFulfillmentMethod,
    paymentMethod,
    quantities,
    region: storedRegion,
    setFulfillmentMethod,
    setPaymentMethod,
    setQuantities,
    setRegion,
  } = useOrderSession();
  const fulfillmentMethod =
    storedFulfillmentMethod ?? initialFulfillmentMethod;
  const region = storedRegion ?? initialRegion;
  const [streetAddress, setStreetAddress] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [city, setCity] = useState("");
  const [addressExtra, setAddressExtra] = useState("");
  const [zoneCheck, setZoneCheck] = useState<ZoneCheckState>({
    status: "idle",
  });
  const [zoneCheckAttempt, setZoneCheckAttempt] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderRevision, setOrderRevision] = useState(0);
  const [submittedRevision, setSubmittedRevision] = useState(-1);
  const cartTriggerRef = useRef<HTMLButtonElement>(null);
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
  const hasValidPaymentMethod =
    fulfillmentMethod !== "delivery" || paymentMethod !== null;
  const isOrderReady =
    region !== null &&
    fulfillmentMethod !== null &&
    hasValidDeliveryAddress &&
    hasValidDeliveryZone &&
    hasValidPaymentMethod;
  const setupActionLabel = !region
    ? "Choisir la zone"
    : !fulfillmentMethod
      ? "Retrait ou livraison"
      : !hasValidDeliveryAddress
        ? "Compléter l’adresse"
        : zoneCheck.status === "checking"
          ? "Vérification…"
          : !hasValidDeliveryZone
            ? "Finaliser l’adresse"
            : !hasValidPaymentMethod
              ? "Choisir le paiement"
              : "Finaliser la commande";
  const orderStatusMessage =
    selectedCount === 0
      ? "Votre commande est vide."
      : `${selectedCount} ${selectedCount > 1 ? "articles" : "article"} dans votre commande. Total ${formatPrice(orderTotal)} francs.`;
  const serializedOrder = JSON.stringify(
    selectedLines.map(({ item, quantity }) => ({ id: item.id, quantity })),
  );
  const visibleActionState =
    !isPending &&
    actionState.status === "error" &&
    submittedRevision === orderRevision
      ? actionState
      : initialActionState;

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
            setRegion(result.suggestedRegion);
            setOrderRevision((current) => current + 1);
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
    setRegion,
    streetAddress,
    zoneCheckAttempt,
  ]);

  function changeStreetAddress(value: string) {
    setStreetAddress(value);
    setZoneCheck({ status: "idle" });
    setOrderRevision((current) => current + 1);
  }

  function changeRegion(value: RegionId) {
    setRegion(value);
    setZoneCheck({ status: "idle" });
    setOrderRevision((current) => current + 1);
  }

  function changeFulfillmentMethod(value: FulfillmentMethod) {
    if (!storedRegion && initialRegion) {
      setRegion(initialRegion);
    }
    setFulfillmentMethod(value);
    setZoneCheck({ status: "idle" });
    setOrderRevision((current) => current + 1);
  }

  function changePaymentMethod(value: DeliveryPaymentMethod) {
    setPaymentMethod(value);
    setOrderRevision((current) => current + 1);
  }

  function changePostalCode(value: string) {
    setPostalCode(value);
    setZoneCheck({ status: "idle" });
    setOrderRevision((current) => current + 1);
  }

  function changeCity(value: string) {
    setCity(value);
    setZoneCheck({ status: "idle" });
    setOrderRevision((current) => current + 1);
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
    setOrderRevision((current) => current + 1);
  }

  function changeQuantity(itemId: string, delta: number) {
    setOrderRevision((current) => current + 1);
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
        : fulfillmentMethod === "delivery" &&
            hasValidDeliveryAddress &&
            hasValidDeliveryZone &&
            !hasValidPaymentMethod
          ? document.getElementById("payment-cash")
          : document.getElementById("streetAddress");

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior, block: "center" });
  }

  function returnToMenu() {
    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "auto"
      : "smooth";
    const target = document.getElementById(`category-${activeCategory}`);

    if (!target) {
      return;
    }

    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior, block: "center" });
  }

  return (
    <form
      action={formAction}
      className={styles.orderForm}
      onSubmit={() => {
        setSubmittedRevision(orderRevision);
      }}
    >
      <input type="hidden" name="region" value={region ?? ""} />
      <input type="hidden" name="order" value={serializedOrder} />

      <section
        className={styles.menuPageIntro}
        id="menu-intro"
        aria-labelledby="menu-page-title"
      >
        <div className={styles.menuPageCopy}>
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
          {PUBLIC_REGIONS.map((regionOption) => {
            if (regionOption.availability === "coming_soon") {
              return (
                <button
                  type="button"
                  className={styles.menuRegionUnavailable}
                  key={regionOption.id}
                  disabled
                >
                  <MapPinIcon />
                  <span>
                    <strong>{regionOption.selectionLabel}</strong>
                    <small>{regionOption.availabilityLabel}</small>
                  </span>
                </button>
              );
            }

            const isActive = region === regionOption.id;

            return (
              <button
                id={
                  regionOption.id === "lausanne"
                    ? "menu-region-lausanne"
                    : undefined
                }
                type="button"
                className={isActive ? styles.menuRegionActive : ""}
                key={regionOption.id}
                aria-pressed={isActive}
                onClick={() => changeRegion(regionOption.id)}
              >
                <MapPinIcon />
                <span>{regionOption.selectionLabel}</span>
                {isActive && <CheckIcon />}
              </button>
            );
          })}
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
                  {isFreeDelivery
                    ? "Offerte · Espèces ou TWINT"
                    : "7,90 CHF · Espèces ou TWINT"}
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
                  <small>
                    Les champs saisis sont envoyés au service fédéral
                    GeoAdmin pour proposer et vérifier l’adresse.
                  </small>
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
                    onChange={(event) => {
                      setAddressExtra(event.target.value);
                      setOrderRevision((current) => current + 1);
                    }}
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
                  <span>
                    Adresse vérifiée pour{" "}
                    {DELIVERY_ZONES[zoneCheck.region].label}.
                  </span>
                </div>
              )}

              <p className={styles.deliveryFeeRule}>
                {isFreeDelivery
                  ? "Frais de livraison offerts"
                  : `Livraison ${formatPrice(deliveryFee)} CHF · offerte au-delà de ${formatPrice(FREE_DELIVERY_THRESHOLD)} CHF`}
              </p>

              <fieldset
                className={styles.paymentFieldset}
                aria-describedby="delivery-payment-help"
              >
                <legend>
                  Mode de paiement{" "}
                  <span className="sr-only">(obligatoire)</span>
                </legend>
                <p id="delivery-payment-help" className={styles.paymentIntro}>
                  Le règlement se fait à l’arrivée du livreur.
                </p>

                <div className={styles.paymentOptions}>
                  {DELIVERY_PAYMENT_METHODS.map((method) => {
                    const isActive = paymentMethod === method.id;

                    return (
                      <label
                        className={isActive ? styles.paymentActive : ""}
                        key={method.id}
                      >
                        <input
                          className={styles.paymentInput}
                          type="radio"
                          id={`payment-${method.id}`}
                          name="paymentMethod"
                          value={method.id}
                          checked={isActive}
                          onChange={() => changePaymentMethod(method.id)}
                          aria-describedby={`payment-${method.id}-description`}
                          required
                        />
                        <span className={styles.paymentChoiceHeader}>
                          <strong>{method.label}</strong>
                          <span
                            className={styles.paymentState}
                            aria-hidden="true"
                          >
                            {isActive && <CheckIcon />}
                          </span>
                        </span>
                        <small id={`payment-${method.id}-description`}>
                          {method.description}
                        </small>
                      </label>
                    );
                  })}
                </div>

                <p className={styles.paymentSecurityNote}>
                  Pour TWINT, le livreur vérifie la réception du paiement en
                  direct avant de remettre la commande. Une capture d’écran ne
                  constitue pas une confirmation.
                </p>
              </fieldset>
            </div>
          )}
        </fieldset>
      </section>

      <section className={styles.menuSection} id="carte" aria-labelledby="menu-title">
        <nav className={styles.categoryRail} aria-label="Catégories de la carte">
          {categories.map((category) => (
            <button
              id={`category-${category.id}`}
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
                    } ${
                      item.imageStatus === "pending"
                        ? styles.menuItemNoImage
                        : ""
                    }`}
                  >
                    {item.imageStatus !== "pending" ? (
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
                    ) : null}
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
            <button
              ref={cartTriggerRef}
              type="button"
              className={styles.submitButton}
              onClick={() => setIsCartOpen(true)}
              aria-haspopup="dialog"
              aria-controls="order-cart-dialog"
              aria-expanded={isCartOpen}
            >
              <CartIcon />
              <span className={styles.submitLong}>Voir le panier</span>
              <span className={styles.submitShort}>Panier</span>
            </button>
          </div>
        )}

        <OrderCart
          actionState={visibleActionState}
          deliveryFee={deliveryFee}
          formatPrice={formatPrice}
          fulfillmentMethod={fulfillmentMethod}
          paymentMethod={paymentMethod}
          isOpen={isCartOpen}
          isOrderReady={isOrderReady}
          isPending={isPending}
          itemsSubtotal={itemsSubtotal}
          lines={selectedLines}
          onChangeQuantity={changeQuantity}
          onOpenChange={setIsCartOpen}
          onReturnToMenu={returnToMenu}
          onReturnToSetup={returnToSetup}
          orderTotal={orderTotal}
          returnFocusRef={cartTriggerRef}
          selectedCount={selectedCount}
          setupActionLabel={setupActionLabel}
        />
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
