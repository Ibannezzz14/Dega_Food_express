import styles from "./evenements.module.css";

const faqItems = [
  {
    id: "demande",
    question: "Comment demander un devis traiteur ?",
    answer:
      "Choisissez l’un des deux contacts WhatsApp et complétez le message préparé avec la date, le nombre de convives, la localité et vos envies de plats. L’équipe étudie ensuite votre demande.",
  },
  {
    id: "plats",
    question: "Peut-on demander plusieurs plats ?",
    answer:
      "Vous pouvez mentionner plusieurs spécialités dans votre message. La sélection, les quantités et les possibilités de préparation sont précisées pendant l’échange avec l’équipe.",
  },
  {
    id: "confirmation",
    question: "Le premier message confirme-t-il la prestation ?",
    answer:
      "Non. La prestation est confirmée uniquement après l’échange sur votre événement, la communication du devis et l’accord des deux parties.",
  },
  {
    id: "autre-evenement",
    question: "Mon type d’événement n’est pas dans la liste, que faire ?",
    answer:
      "Décrivez simplement votre occasion dans le message. Marie-José et Geneviève vous indiqueront ce qu’il est possible d’envisager après avoir étudié les informations transmises.",
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
