import styles from "./order-steps-section.module.css";

const orderSteps = [
  {
    title: "Choisissez le mode de remise",
    description: "Retrait à convenir ou livraison selon votre adresse.",
  },
  {
    title: "Composez votre commande",
    description: "Sélectionnez les plats et les quantités depuis la carte.",
  },
  {
    title: "Envoyez la demande sur WhatsApp",
    description:
      "Dega Food Express confirme ensuite les disponibilités et les détails.",
  },
] as const;

export default function OrderStepsSection() {
  return (
    <section
      className={styles.section}
      id="commander"
      aria-labelledby="order-steps-title"
    >
      <div className={styles.inner}>
        <header className={styles.heading}>
          <h2 id="order-steps-title">Comment commander</h2>
          <p>
            Préparez votre demande sur le site. La commande est confirmée
            après l’échange sur WhatsApp.
          </p>
        </header>

        <ol className={styles.steps}>
          {orderSteps.map((step, index) => (
            <li key={step.title}>
              <span className={styles.stepNumber} aria-hidden="true">
                {index + 1}
              </span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
