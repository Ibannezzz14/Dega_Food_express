import styles from "./evenements.module.css";

const faqItems = [
  {
    id: "devis",
    question: "Comment le devis est-il établi ?",
    answer:
      "Le devis est préparé après étude de la date, du lieu, du nombre de convives, des plats et des services souhaités. Le prix n’est pas standardisé.",
  },
  {
    id: "confirmation",
    question: "Quand la prestation est-elle confirmée ?",
    answer:
      "La prestation est confirmée après l’échange avec l’équipe, la communication du devis et l’accord des deux parties. Le premier message WhatsApp ne constitue pas une confirmation.",
  },
  {
    id: "allergies",
    question: "Comment signaler une allergie ou une contrainte alimentaire ?",
    answer:
      "Indiquez-la dans le champ Informations complémentaires. L’équipe vous précisera les possibilités, sans pouvoir garantir une absence totale de contamination croisée.",
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
