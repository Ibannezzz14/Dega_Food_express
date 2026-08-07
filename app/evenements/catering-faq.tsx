import styles from "./evenements.module.css";

const faqItems = [
  {
    id: "devis",
    question: "Comment le devis est-il établi ?",
    answer:
      "Selon la date, le lieu, le nombre de convives, les plats et les services demandés.",
  },
  {
    id: "confirmation",
    question: "Quand la prestation est-elle confirmée ?",
    answer:
      "Après validation du devis par les deux parties. Le message WhatsApp ne confirme pas la prestation.",
  },
  {
    id: "zone",
    question: "Le service traiteur est-il disponible dans toute la Suisse ?",
    answer:
      "Oui. Le lieu, le transport, le matériel, le personnel et les autres besoins sont étudiés dans le devis personnalisé.",
  },
  {
    id: "allergies",
    question: "Comment signaler une allergie ou une contrainte alimentaire ?",
    answer:
      "Indiquez-la dans « Informations complémentaires ». L’absence totale de contamination croisée ne peut pas être garantie.",
  },
] as const;

export default function CateringFaq() {
  return (
    <div className={styles.faqList}>
      {faqItems.map((item) => (
        <details className={styles.faqItem} key={item.id}>
          <summary>
            <span className={styles.faqQuestion}>{item.question}</span>
            <span className={styles.faqMarker} aria-hidden="true" />
          </summary>
          <div className={styles.faqAnswer}>
            <p>{item.answer}</p>
          </div>
        </details>
      ))}
    </div>
  );
}
