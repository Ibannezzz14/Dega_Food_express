"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRightIcon,
  CheckIcon,
  DeliveryIcon,
  MapPinIcon,
} from "@/components/icons";
import type { TwintPrototypeOrder } from "@/lib/twint-prototype-model";
import styles from "./twint-prototype.module.css";

type PaymentStatus = "ready" | "pending" | "paid" | "cancelled";

type TwintPaymentPrototypeProps = {
  order: TwintPrototypeOrder;
};

const checkoutSteps = [
  "Commande",
  "Livraison",
  "Paiement",
  "Confirmation",
] as const;

function formatPrice(value: number) {
  return new Intl.NumberFormat("fr-CH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function PaymentWordmark() {
  return (
    <span className={styles.paymentWordmark} aria-label="TWINT">
      TWINT
    </span>
  );
}

export default function TwintPaymentPrototype({
  order,
}: TwintPaymentPrototypeProps) {
  const [status, setStatus] = useState<PaymentStatus>("ready");
  const [isLaunching, setIsLaunching] = useState(false);
  const launchTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (launchTimer.current !== null) {
        window.clearTimeout(launchTimer.current);
      }
    },
    [],
  );

  function beginPayment() {
    setIsLaunching(true);
    launchTimer.current = window.setTimeout(() => {
      setIsLaunching(false);
      setStatus("pending");
      launchTimer.current = null;
    }, 650);
  }

  function resetPrototype() {
    setIsLaunching(false);
    setStatus("ready");
  }

  const isConfirmed = status === "paid";
  const currentStep = isConfirmed ? 3 : 2;
  const statusLabel =
    status === "paid"
      ? "Payée"
      : status === "pending"
        ? "En attente"
        : status === "cancelled"
          ? "Non confirmée"
          : "À payer";

  return (
    <div className={styles.page}>
      <div className={styles.prototypeNotice} role="note">
        <span>Prototype interactif</span>
        Aucun paiement réel, aucune donnée transmise à TWINT.
      </div>

      <header className={styles.intro}>
        <div>
          <p className={styles.eyebrow}>Livraison · futur parcours</p>
          <h1>La commande part après confirmation du paiement.</h1>
        </div>
        <p className={styles.introText}>
          Ce prototype montre comment une livraison pourrait être payée avec
          TWINT avant sa transmission à l’équipe Dega Food.
        </p>
      </header>

      <nav className={styles.progress} aria-label="Étapes de la commande">
        <ol>
          {checkoutSteps.map((step, index) => {
            const isDone = index < currentStep;
            const isCurrent = index === currentStep;

            return (
              <li
                key={step}
                className={`${isDone ? styles.stepDone : ""} ${
                  isCurrent ? styles.stepCurrent : ""
                }`}
                aria-current={isCurrent ? "step" : undefined}
              >
                <span aria-hidden="true">
                  {isDone ? <CheckIcon /> : index + 1}
                </span>
                {step}
              </li>
            );
          })}
        </ol>
      </nav>

      <div className={styles.checkoutLayout}>
        <aside className={styles.receipt} aria-labelledby="receipt-title">
          <header className={styles.receiptHeader}>
            <div>
              <p>Dega Food Express</p>
              <h2 id="receipt-title">Ticket de livraison</h2>
            </div>
            <span className={styles.receiptStatus}>{statusLabel}</span>
          </header>

          <dl className={styles.reference}>
            <div>
              <dt>Référence</dt>
              <dd>{order.reference}</dd>
            </div>
            <div>
              <dt>Zone</dt>
              <dd>Lausanne</dd>
            </div>
          </dl>

          <ul className={styles.orderLines}>
            {order.lines.map((line) => (
              <li key={line.id}>
                <span className={styles.quantity}>{line.quantity}×</span>
                <span>
                  <strong>{line.name}</strong>
                  {line.detail ? <small>{line.detail}</small> : null}
                </span>
                <span>{formatPrice(line.lineTotal)}</span>
              </li>
            ))}
          </ul>

          <dl className={styles.totals}>
            <div>
              <dt>Sous-total</dt>
              <dd>{formatPrice(order.itemsSubtotal)} CHF</dd>
            </div>
            <div>
              <dt>Livraison</dt>
              <dd>{formatPrice(order.deliveryFee)} CHF</dd>
            </div>
            <div className={styles.grandTotal}>
              <dt>Total à payer</dt>
              <dd>{formatPrice(order.total)} CHF</dd>
            </div>
          </dl>

          <div className={styles.address}>
            <MapPinIcon />
            <div>
              <span>Adresse de démonstration</span>
              <strong>{order.deliveryAddress.streetAddress}</strong>
              <p>
                {order.deliveryAddress.postalCode}{" "}
                {order.deliveryAddress.city}
              </p>
            </div>
          </div>
        </aside>

        <section
          className={styles.paymentPanel}
          aria-labelledby="payment-title"
          aria-live="polite"
        >
          {status === "ready" ? (
            <div className={styles.stateContent}>
              <header className={styles.stateHeading}>
                <p className={styles.stateNumber}>Étape 03</p>
                <h2 id="payment-title">Choisissez le paiement.</h2>
                <p>
                  Pour une livraison, le paiement est confirmé avant que la
                  commande soit envoyée en cuisine.
                </p>
              </header>

              <div className={styles.paymentChoice}>
                <span className={styles.selectedControl}>
                  <CheckIcon />
                </span>
                <div>
                  <PaymentWordmark />
                  <p>Application mobile ou QR sur ordinateur</p>
                </div>
                <strong>{formatPrice(order.total)} CHF</strong>
              </div>

              <div className={styles.paymentRule}>
                <DeliveryIcon />
                <p>
                  <strong>Livraison prépayée</strong>
                  La commande reste en attente tant que le prestataire n’a pas
                  confirmé le paiement.
                </p>
              </div>

              <button
                className={styles.primaryAction}
                type="button"
                onClick={beginPayment}
                disabled={isLaunching}
                aria-busy={isLaunching}
              >
                {isLaunching
                  ? "Préparation du paiement…"
                  : `Simuler le paiement de ${formatPrice(order.total)} CHF`}
                {!isLaunching ? <ArrowRightIcon /> : null}
              </button>

              <p className={styles.safetyCopy}>
                Dans la version connectée, le montant sera calculé sur le
                serveur et la confirmation viendra du prestataire de paiement.
              </p>
            </div>
          ) : null}

          {status === "pending" ? (
            <div className={styles.stateContent}>
              <header className={styles.stateHeading}>
                <div className={styles.pendingLabel}>
                  <span aria-hidden="true" />
                  En attente de confirmation
                </div>
                <h2 id="payment-title">Confirmez dans TWINT.</h2>
                <p>
                  Sur mobile, l’application s’ouvrirait automatiquement. Sur
                  ordinateur, un QR unique apparaîtrait ici.
                </p>
              </header>

              <div className={styles.handoffPreview}>
                <div className={styles.demoQr} aria-hidden="true">
                  <span>DEMO</span>
                  <i />
                  <i />
                  <i />
                </div>
                <div>
                  <PaymentWordmark />
                  <p>Code de démonstration</p>
                  <strong>58 214</strong>
                  <small>Non scannable · aucun débit possible</small>
                </div>
              </div>

              <div className={styles.prototypeControls}>
                <button
                  className={styles.primaryAction}
                  type="button"
                  onClick={() => setStatus("paid")}
                >
                  Simuler le paiement confirmé
                  <CheckIcon />
                </button>
                <button
                  className={styles.textAction}
                  type="button"
                  onClick={() => setStatus("cancelled")}
                >
                  Simuler une annulation
                </button>
              </div>
            </div>
          ) : null}

          {status === "paid" ? (
            <div className={`${styles.stateContent} ${styles.confirmedState}`}>
              <span className={styles.confirmedIcon} aria-hidden="true">
                <CheckIcon />
              </span>
              <header className={styles.stateHeading}>
                <p className={styles.stateNumber}>Paiement reçu</p>
                <h2 id="payment-title">La livraison peut être préparée.</h2>
                <p>
                  La confirmation du prestataire a verrouillé le montant et
                  associé le paiement à la référence {order.reference}.
                </p>
              </header>

              <ol className={styles.confirmationList}>
                <li>
                  <CheckIcon />
                  Paiement de {formatPrice(order.total)} CHF confirmé
                </li>
                <li>
                  <CheckIcon />
                  Commande enregistrée avec sa référence
                </li>
                <li>
                  <CheckIcon />
                  Notification prête pour l’équipe Dega Food
                </li>
              </ol>

              <div className={styles.finalActions}>
                <button
                  className={styles.secondaryAction}
                  type="button"
                  onClick={resetPrototype}
                >
                  Rejouer le prototype
                </button>
                <Link className={styles.primaryAction} href="/carte">
                  Retour à la carte
                  <ArrowRightIcon />
                </Link>
              </div>
            </div>
          ) : null}

          {status === "cancelled" ? (
            <div className={`${styles.stateContent} ${styles.cancelledState}`}>
              <span className={styles.cancelledMark} aria-hidden="true">
                !
              </span>
              <header className={styles.stateHeading}>
                <p className={styles.stateNumber}>Paiement interrompu</p>
                <h2 id="payment-title">La commande n’a pas été transmise.</h2>
                <p>
                  Aucun paiement n’est confirmé. Le panier et l’adresse restent
                  disponibles pour recommencer sans ressaisir la commande.
                </p>
              </header>

              <button
                className={styles.primaryAction}
                type="button"
                onClick={resetPrototype}
              >
                Réessayer le paiement
                <ArrowRightIcon />
              </button>
            </div>
          ) : null}
        </section>
      </div>

      <footer className={styles.prototypeFooter}>
        <p>
          <strong>Ce que le prototype ne fait pas encore&nbsp;:</strong>{" "}
          créer une transaction, contacter un PSP, recevoir un webhook ou
          enregistrer une commande.
        </p>
        <Link href="/carte">Quitter le prototype</Link>
      </footer>
    </div>
  );
}
