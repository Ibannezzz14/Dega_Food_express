"use client";

import Image from "next/image";
import { useActionState, useEffect, useRef, useState } from "react";
import {
  prepareWhatsAppOrder,
  type OrderActionState,
} from "@/app/carte/order-actions";
import {
  DELIVERY_ZONES,
  isDeliveryRegionId,
  type DeliveryZoneResult,
  type RegionId,
} from "@/data/delivery-zones";
import {
  createOrderWhatsAppHref,
  DELIVERY_SETTINGS,
  ORDER_CONTACT,
} from "@/config/site-config";
import {
  categories,
  isMenuItemOrderable,
  menuItems,
  type CategoryId,
  type MenuItem,
  type OrderableMenuItem,
} from "@/data/menu";
import {
  calculateDeliveryPricing,
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
  MessageIcon,
  MinusIcon,
  PickupIcon,
  PlusIcon,
} from "@/components/shared/icons";
import AddressAutocomplete from "./address-autocomplete";
import OrderCart from "./order-cart";
import {
  useOrderSession,
  type FulfillmentMethod,
} from "./order-session-provider";
import styles from "./order-experience.module.css";

type ZoneCheckState =
  | { status: "idle" | "checking" }
  | DeliveryZoneResult;

function isDeliveryZoneResult(value: unknown): value is DeliveryZoneResult {
  if (!value || typeof value !== "object" || !("status" in value)) {
    return false;
  }

  const result = value as {
    status?: unknown;
    region?: unknown;
    distanceKm?: unknown;
    reference?: unknown;
  };

  if (result.status === "not_found") {
    return true;
  }

  if (result.status === "service_error") {
    return (
      result.reference === undefined ||
      (typeof result.reference === "string" && result.reference.length <= 24)
    );
  }

  return (
    (result.status === "eligible" || result.status === "on_request") &&
    typeof result.region === "string" &&
    isDeliveryRegionId(result.region) &&
    typeof result.distanceKm === "number" &&
    Number.isFinite(result.distanceKm) &&
    result.distanceKm >= 0
  );
}

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
  } = useOrderSession();
  const fulfillmentMethod =
    initialFulfillmentMethod ?? storedFulfillmentMethod;
  const region =
    initialRegion ?? storedRegion ?? DELIVERY_SETTINGS.regionId;
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
    .filter(
      (
        line,
      ): line is { item: OrderableMenuItem; quantity: number } =>
        isMenuItemOrderable(line.item) && line.quantity > 0,
    );
  const selectedCount = selectedLines.reduce((sum, line) => sum + line.quantity, 0);
  const itemsSubtotal = selectedLines.reduce(
    (sum, line) => sum + line.item.price * line.quantity,
    0,
  );
  const deliveryPricing =
    fulfillmentMethod === "delivery" &&
    (zoneCheck.status === "eligible" ||
      zoneCheck.status === "on_request")
      ? calculateDeliveryPricing(
          itemsSubtotal,
          zoneCheck.status === "eligible" ? "standard" : "to_confirm",
        )
      : null;
  const deliveryFee = deliveryPricing?.fee ?? null;
  const orderTotal = deliveryPricing?.total ?? itemsSubtotal;
  const isFreeDelivery = deliveryFee === 0;
  const deliveryNeedsReview =
    fulfillmentMethod === "delivery" && zoneCheck.status === "on_request";
  const hasValidDeliveryAddress =
    fulfillmentMethod !== "delivery" ||
    (streetAddress.trim().length >= 5 &&
      /^\d{4}$/.test(postalCode) &&
      city.trim().length >= 2);
  const hasValidDeliveryZone =
    fulfillmentMethod !== "delivery" ||
    zoneCheck.status === "eligible" ||
    zoneCheck.status === "on_request";
  const hasValidPaymentMethod =
    fulfillmentMethod !== "delivery" || paymentMethod !== null;
  const isOrderReady =
    fulfillmentMethod !== null &&
    hasValidDeliveryAddress &&
    hasValidDeliveryZone &&
    hasValidPaymentMethod;
  const setupActionLabel = !fulfillmentMethod
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
      : `${selectedCount} ${selectedCount > 1 ? "articles" : "article"} dans votre commande. ${deliveryNeedsReview ? "Sous-total des plats" : "Total"} ${formatPrice(orderTotal)} francs.`;
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
        const result: unknown = await response.json();

        if (
          !isDeliveryZoneResult(result) ||
          (!response.ok && response.status !== 400 && response.status !== 503)
        ) {
          throw new Error("Delivery zone unavailable");
        }

        if (!controller.signal.aborted) {
          setZoneCheck(result);
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
    setOrderRevision((current) => current + 1);
  }

  function changeFulfillmentMethod(value: FulfillmentMethod) {
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
    const targetId = !fulfillmentMethod
      ? "fulfillment-pickup"
      : fulfillmentMethod === "delivery" &&
          hasValidDeliveryAddress &&
          hasValidDeliveryZone &&
          !hasValidPaymentMethod
        ? "payment-cash"
        : "streetAddress";
    const target = document.getElementById(targetId);

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
      <input type="hidden" name="region" value={region} />
      <input type="hidden" name="order" value={serializedOrder} />

      <section
        className={styles.menuPageIntro}
        id="menu-intro"
        aria-labelledby="menu-page-title"
      >
        <div className={styles.menuPageCopy}>
          <h1 id="menu-page-title">Composez votre commande.</h1>
          <p className={styles.menuPageIntroText}>
            Choisissez vos plats et votre mode de remise. La demande finale
            est ensuite envoyée sur WhatsApp.
          </p>
        </div>

        <div className={styles.menuRegionNotice} role="note">
          <MapPinIcon />
          <span>
            <strong>{DELIVERY_SETTINGS.availabilityMessage}</strong>
            <small>
              Commandes et livraison : {ORDER_CONTACT.displayPhone}
            </small>
          </span>
        </div>

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
                  {zoneCheck.status === "eligible"
                    ? isFreeDelivery
                      ? "Offerte"
                      : `${formatPrice(deliveryFee ?? 0)} CHF`
                    : zoneCheck.status === "on_request"
                      ? "Sur confirmation"
                      : "Selon l’adresse"}
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
                  <strong>Adresse de livraison</strong>
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

              {(zoneCheck.status === "not_found" ||
                zoneCheck.status === "service_error") && (
                <div
                  className={`${styles.deliveryZoneStatus} ${styles.deliveryZoneError}`}
                >
                  <span
                    className={styles.deliveryZoneIndicator}
                    aria-hidden="true"
                  />
                  <span id="delivery-zone-error" role="alert">
                    {zoneCheck.status === "not_found" &&
                      "Vérifiez la rue, le NPA et la localité."}
                    {zoneCheck.status === "service_error" &&
                      `La vérification est momentanément indisponible.${zoneCheck.reference ? ` Référence ${zoneCheck.reference}.` : ""}`}
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

              {zoneCheck.status === "on_request" && (
                <div
                  className={`${styles.deliveryZoneStatus} ${styles.deliveryZoneReview}`}
                  role="status"
                >
                  <span
                    className={styles.deliveryZoneIndicator}
                    aria-hidden="true"
                  />
                  <span>{DELIVERY_SETTINGS.reviewMessage}</span>
                </div>
              )}

              <p className={styles.deliveryFeeRule}>
                {zoneCheck.status === "on_request"
                  ? "Faisabilité et frais confirmés après étude de l’adresse."
                  : zoneCheck.status === "eligible"
                    ? isFreeDelivery
                      ? "Frais de livraison offerts"
                      : `Livraison ${formatPrice(deliveryFee ?? 0)} CHF · offerte au-delà de ${formatPrice(FREE_DELIVERY_THRESHOLD)} CHF`
                    : "Frais calculés après vérification de l’adresse."}
              </p>

              <fieldset className={styles.paymentFieldset}>
                <legend>
                  Mode de paiement{" "}
                  <span className="sr-only">(obligatoire)</span>
                </legend>
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
                      </label>
                    );
                  })}
                </div>
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

        <div className={styles.menuHeading} key={`heading-${activeCategory}`}>
          <div>
            <h2 id="menu-title">
              {categories.find((category) => category.id === activeCategory)?.label}
            </h2>
          </div>
        </div>

        <div className={styles.menuBody}>
          <div
            className={styles.itemList}
            id={`panel-${activeCategory}`}
            key={activeCategory}
          >
            {visibleItems.map((item, index) => {
              const isOrderable = isMenuItemOrderable(item);
              const quantity = isOrderable ? (quantities[item.id] ?? 0) : 0;
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
                          sizes="(max-width: 420px) 80px, (max-width: 832px) 88px, 116px"
                        />
                      </div>
                    ) : null}
                    <div className={styles.itemName}>
                      <h3>{item.name}</h3>
                      {detail && <p>{detail}</p>}
                    </div>
                    <p className={styles.price}>
                      {isOrderable
                        ? `${formatPrice(item.price)} CHF`
                        : "Prix sur demande"}
                    </p>

                    {isOrderable ? (
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
                    ) : (
                      <a
                        className={styles.enquiryAction}
                        href={createOrderWhatsAppHref(
                          `Bonjour Dega Food Express, je souhaite connaître le prix de ${item.name}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Demander le prix de ${item.name} sur WhatsApp au ${ORDER_CONTACT.displayPhone} (s’ouvre dans un nouvel onglet)`}
                      >
                        <MessageIcon />
                        Demander
                      </a>
                    )}
                  </article>
                </div>
              );
            })}
          </div>
        </div>

        {selectedCount > 0 && (
          <div className={`${styles.orderDock} ${styles.orderDockVisible}`}>
            <div className={styles.orderCount}>
              <strong>
                {selectedCount} {selectedCount > 1 ? "articles" : "article"}
              </strong>
            </div>
            <div className={styles.orderTotal}>
              <span>
                {fulfillmentMethod === "delivery"
                  ? deliveryFee === null
                    ? "Sous-total des plats"
                    : "Total livré"
                  : "Total"}
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
