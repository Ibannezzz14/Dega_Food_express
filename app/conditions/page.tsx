import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";
import styles from "../legal.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Conditions d’utilisation | Dega Food Express",
  description: "Conditions d’utilisation du site Dega Food Express.",
  path: "/conditions",
});

export default function TermsPage() {
  return (
    <main id="contenu" className={styles.page} tabIndex={-1}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p>Informations légales</p>
          <h1>Conditions d’utilisation</h1>
          <span>Dernière mise à jour : 7 août 2026</span>
        </div>
      </header>

      <article className={styles.content}>
        <section>
          <h2>Objet du site</h2>
          <p>
            Ce site présente Dega Food Express, sa carte, son service traiteur
            et ses moyens de contact. Une commande n’est confirmée qu’après
            échange avec Dega Food Express sur WhatsApp. La livraison dessert
            Lausanne, Lucens et les régions environnantes. Une adresse hors de
            la zone habituelle peut être soumise, puis confirmée avec ses frais
            éventuels. Les prestations traiteur sont étudiées dans toute la
            Suisse selon le lieu et le devis.
          </p>
        </section>

        <section>
          <h2>Témoignages Instagram</h2>
          <p>
            Les témoignages proviennent de messages reçus sur Instagram. Ils
            sont sélectionnés et administrés par Dega Food Express avec
            l’autorisation nécessaire. Aucun visiteur ne peut publier
            directement un témoignage sur le site.
          </p>
        </section>

        <section>
          <h2>Contenus et disponibilité</h2>
          <p>
            Les plats, prix, disponibilités et délais peuvent évoluer. Les
            photos illustrent les préparations mais leur présentation peut
            varier. Dega Food Express peut corriger ou mettre à jour le site à
            tout moment.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Pour toute question sur le site, une commande ou un contenu
            affiché, utilisez la page Contact.
          </p>
          <Link className={styles.action} href="/contact">
            Voir les contacts
          </Link>
        </section>
      </article>
    </main>
  );
}
