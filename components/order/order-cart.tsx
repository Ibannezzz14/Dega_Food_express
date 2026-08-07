"use client";

import Image from "next/image";
import {
  useEffect,
  useRef,
  type RefObject,
} from "react";
import {
  CartIcon,
  CloseIcon,
  MapPinIcon,
  MessageIcon,
  MinusIcon,
  PlusIcon,
} from "@/components/shared/icons";
import type { MenuItem, OrderableMenuItem } from "@/data/menu";
import {
  getDeliveryPaymentMethodLabel,
  type DeliveryPaymentMethod,
} from "@/lib/order-payment";
import type { OrderActionState } from "@/app/carte/order-actions";
import type { FulfillmentMethod } from "./order-session-provider";
import styles from "./order-experience.module.css";

/**
 * THESIS: Le panier est l’addition lisible avant WhatsApp, jamais un envoi précipité.
 * OWN-WORLD: Une feuille ivoire cadrée par le vert nuit, avec lignes de commande et chiffres nets.
 * STORY: Relire, ajuster, comprendre le total, puis valider en confiance.
 * FIRST VIEWPORT: Le titre, le nombre d’articles et la fermeture précèdent immédiatement les produits choisis.
 * FORM: Extension locale « addition de table » de l’expérience Carte existante, sans nouveau langage visuel.
 */

export type SelectedOrderLine = {
  item: OrderableMenuItem;
  quantity: number;
};

type OrderCartProps = {
  actionState: OrderActionState;
  deliveryFee: number | null;
  formatPrice: (value: number) => string;
  fulfillmentMethod: FulfillmentMethod | null;
  paymentMethod: DeliveryPaymentMethod | null;
  isOpen: boolean;
  isOrderReady: boolean;
  isPending: boolean;
  itemsSubtotal: number;
  lines: SelectedOrderLine[];
  onChangeQuantity: (itemId: string, delta: number) => void;
  onOpenChange: (isOpen: boolean) => void;
  onReturnToMenu: () => void;
  onReturnToSetup: () => void;
  orderTotal: number;
  returnFocusRef: RefObject<HTMLButtonElement | null>;
  selectedCount: number;
  setupActionLabel: string;
};

function itemDetail(item: MenuItem) {
  return [item.packaging, item.volume].filter(Boolean).join(" · ");
}

export default function OrderCart({
  actionState,
  deliveryFee,
  formatPrice,
  fulfillmentMethod,
  paymentMethod,
  isOpen,
  isOrderReady,
  isPending,
  itemsSubtotal,
  lines,
  onChangeQuantity,
  onOpenChange,
  onReturnToMenu,
  onReturnToSetup,
  orderTotal,
  returnFocusRef,
  selectedCount,
  setupActionLabel,
}: OrderCartProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const emptyReturnButtonRef = useRef<HTMLButtonElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const lineButtonRefs = useRef(new Map<string, HTMLButtonElement>());
  const restoreFocusRef = useRef(true);

  useEffect(() => {
    const dialog = dialogRef.current;

    if (isOpen && dialog && !dialog.open) {
      restoreFocusRef.current = true;
      dialog.showModal();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && actionState.status === "error") {
      window.requestAnimationFrame(() => errorRef.current?.focus());
    }
  }, [actionState.message, actionState.status, isOpen]);

  function closeCart(restoreFocus = true) {
    restoreFocusRef.current = restoreFocus;

    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onOpenChange(false);
    }
  }

  function returnToSetup() {
    closeCart(false);
    window.requestAnimationFrame(onReturnToSetup);
  }

  function returnToMenu() {
    closeCart(false);
    window.requestAnimationFrame(onReturnToMenu);
  }

  function decreaseQuantity(
    itemId: string,
    quantity: number,
    lineIndex: number,
  ) {
    const nextFocusId =
      lines[lineIndex + 1]?.item.id ?? lines[lineIndex - 1]?.item.id;

    onChangeQuantity(itemId, -1);

    if (quantity === 1) {
      window.requestAnimationFrame(() => {
        if (nextFocusId) {
          lineButtonRefs.current.get(nextFocusId)?.focus();
        } else {
          emptyReturnButtonRef.current?.focus();
        }
      });
    }
  }

  return (
    <dialog
      id="order-cart-dialog"
      ref={dialogRef}
      className={styles.cartDialog}
      aria-labelledby="cart-title"
      onCancel={() => {
        restoreFocusRef.current = true;
      }}
      onClose={() => {
        onOpenChange(false);

        if (restoreFocusRef.current) {
          window.requestAnimationFrame(() => {
            if (returnFocusRef.current) {
              returnFocusRef.current.focus();
            } else {
              onReturnToMenu();
            }
          });
        }
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closeCart();
        }
      }}
    >
      <div className={styles.cartShell}>
        <header className={styles.cartHeader}>
          <div>
            <h2 id="cart-title">
              {selectedCount > 0
                ? "Votre panier"
                : "Votre panier est vide."}
            </h2>
            {selectedCount > 0 && (
              <p>
                {selectedCount} {selectedCount > 1 ? "articles" : "article"}
              </p>
            )}
          </div>
          <button
            type="button"
            className={styles.cartCloseButton}
            onClick={() => closeCart()}
            aria-label="Fermer le panier"
          >
            <CloseIcon />
          </button>
        </header>

        {lines.length > 0 ? (
          <>
            <div className={styles.cartBody}>
              <ol className={styles.cartLines}>
                {lines.map(({ item, quantity }, lineIndex) => {
                  const detail = itemDetail(item);
                  const accessibleItemName = detail
                    ? `${item.name}, ${detail}`
                    : item.name;

                  return (
                    <li className={styles.cartLine} key={item.id}>
                      {item.imageStatus !== "pending" ? (
                        <div
                          className={`${styles.cartLineImage} ${
                            item.imageFit === "contain"
                              ? styles.cartLineImageContain
                              : ""
                          }`}
                        >
                          <Image
                            src={item.image}
                            alt=""
                            fill
                            sizes="72px"
                          />
                        </div>
                      ) : (
                        <span
                          className={styles.cartLineImageFallback}
                          aria-hidden="true"
                        >
                          {item.name.charAt(0)}
                        </span>
                      )}

                      <div className={styles.cartLineMain}>
                        <div className={styles.cartLineHeading}>
                          <div>
                            <h3>{item.name}</h3>
                            {detail && <p>{detail}</p>}
                          </div>
                          <strong>
                            {formatPrice(item.price * quantity)} CHF
                          </strong>
                        </div>

                        <div className={styles.cartLineControls}>
                          <div
                            className={styles.cartQuantityControl}
                            role="group"
                            aria-label={`Quantité de ${accessibleItemName}`}
                          >
                            <button
                              ref={(node) => {
                                if (node) {
                                  lineButtonRefs.current.set(item.id, node);
                                } else {
                                  lineButtonRefs.current.delete(item.id);
                                }
                              }}
                              type="button"
                              onClick={() =>
                                decreaseQuantity(
                                  item.id,
                                  quantity,
                                  lineIndex,
                                )
                              }
                              aria-label={`Retirer un ${accessibleItemName}`}
                            >
                              <MinusIcon />
                            </button>
                            <output aria-live="polite">{quantity}</output>
                            <button
                              type="button"
                              onClick={() => onChangeQuantity(item.id, 1)}
                              aria-label={`Ajouter un ${accessibleItemName}`}
                              disabled={quantity >= 20}
                            >
                              <PlusIcon />
                            </button>
                          </div>
                          <span>{formatPrice(item.price)} CHF l’unité</span>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>

              <section
                className={styles.cartSummary}
                aria-labelledby="cart-summary-title"
              >
                <h3 className="sr-only" id="cart-summary-title">
                  Total de la commande
                </h3>
                <dl>
                  <div>
                    <dt>Sous-total</dt>
                    <dd>{formatPrice(itemsSubtotal)} CHF</dd>
                  </div>
                  {fulfillmentMethod === "delivery" && (
                    <>
                      <div>
                        <dt>Livraison</dt>
                        <dd>
                          {deliveryFee === null
                            ? "À confirmer"
                            : deliveryFee === 0
                            ? "Offerte"
                            : `${formatPrice(deliveryFee)} CHF`}
                        </dd>
                      </div>
                      <div>
                        <dt>Paiement</dt>
                        <dd>
                          {paymentMethod
                            ? getDeliveryPaymentMethodLabel(paymentMethod)
                            : "À choisir"}
                        </dd>
                      </div>
                    </>
                  )}
                  {fulfillmentMethod !== "delivery" ||
                  deliveryFee !== null ? (
                    <div className={styles.cartSummaryTotal}>
                      <dt>Total</dt>
                      <dd>{formatPrice(orderTotal)} CHF</dd>
                    </div>
                  ) : null}
                </dl>
              </section>
            </div>

            <footer className={styles.cartFooter}>
              <div className={styles.cartFooterActions}>
                <button
                  type="button"
                  className={styles.cartContinueButton}
                  onClick={() => closeCart()}
                >
                  Continuer mes choix
                </button>

                {isOrderReady ? (
                  <button
                    type="submit"
                    className={styles.cartConfirmButton}
                    disabled={isPending}
                  >
                    <MessageIcon />
                    {isPending
                      ? "Préparation…"
                      : "Valider sur WhatsApp"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className={styles.cartConfirmButton}
                    onClick={returnToSetup}
                  >
                    <MapPinIcon />
                    {setupActionLabel}
                  </button>
                )}
              </div>

              {actionState.status === "error" && (
                <p
                  ref={errorRef}
                  className={styles.cartError}
                  role="alert"
                  tabIndex={-1}
                >
                  {actionState.message}
                </p>
              )}
            </footer>
          </>
        ) : (
          <div className={styles.cartEmpty}>
            <CartIcon />
            <button
              ref={emptyReturnButtonRef}
              type="button"
              onClick={returnToMenu}
            >
              Retourner à la carte
            </button>
          </div>
        )}
      </div>
    </dialog>
  );
}
