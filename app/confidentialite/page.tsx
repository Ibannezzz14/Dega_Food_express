import type { Metadata } from "next";
import Link from "next/link";
import { createPageMetadata } from "@/lib/page-metadata";
import styles from "../legal.module.css";

export const metadata: Metadata = createPageMetadata({
  title: "Confidentialité | Dega Food Express",
  description:
    "Informations sur les données utilisées par le site Dega Food Express.",
  path: "/confidentialite",
});

export default function PrivacyPage() {
  return (
    <main id="contenu" className={styles.page} tabIndex={-1}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <p>Informations légales</p>
          <h1>Politique de confidentialité</h1>
          <span>Dernière mise à jour : 7 août 2026</span>
        </div>
      </header>

      <article className={styles.content}>
        <section>
          <h2>Données utilisées</h2>
          <p>
            Le site ne possède pas de formulaire public d’avis. Les
            témoignages reçus sur Instagram sont ajoutés par l’administrateur
            avec l’autorisation nécessaire et peuvent contenir un nom, une
            note, une photo et un commentaire.
          </p>
          <p>
            Lors d’une commande, le panier et les informations saisies servent
            à préparer le message WhatsApp. L’application ne conserve pas
            l’adresse complète dans sa base. Elle enregistre uniquement des
            statistiques agrégées de passage vers WhatsApp : date, zone, mode
            de remise, NPA et localité.
          </p>
        </section>

        <section>
          <h2>Services externes</h2>
          <p>
            La recherche d’adresse utilise GeoAdmin de swisstopo. WhatsApp et
            Instagram sont exploités par Meta. Ces services appliquent leurs
            propres règles de confidentialité.
          </p>
          <ul>
            <li>
              <a
                href="https://www.geo.admin.ch/fr/geo-admin-ch-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                Informations sur GeoAdmin
              </a>
            </li>
          </ul>
        </section>

        <section>
          <h2>Conservation et sécurité</h2>
          <p>
            Les statistiques agrégées sont supprimées après 730 jours. Un
            témoignage supprimé disparaît immédiatement du site et peut rester
            temporairement dans la base sécurisée afin de permettre sa
            récupération ou sa suppression définitive lors de la maintenance.
            Les accès administratifs sont protégés et doivent être utilisés
            uniquement en HTTPS.
          </p>
        </section>

        <section>
          <h2>Vos droits</h2>
          <p>
            Pour demander la correction ou le retrait d’un témoignage vous
            concernant, utilisez les coordonnées de la page Contact.
          </p>
          <Link className={styles.action} href="/contact">
            Contacter Dega Food Express
          </Link>
        </section>
      </article>
    </main>
  );
}
