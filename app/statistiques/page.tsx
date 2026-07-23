import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getOrderStatistics } from "@/lib/order-statistics";
import {
  parseStatisticsPeriod,
  STATISTICS_PERIODS,
} from "@/lib/order-statistics-model";
import { isStatsAuthorizationValid } from "@/lib/stats-auth";
import styles from "./statistiques.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Statistiques privées | Dega Food Express",
  description: "Tableau de bord privé des demandes Dega Food Express.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

type StatisticsPageProps = {
  searchParams: Promise<{
    periode?: string | string[];
  }>;
};

const numberFormatter = new Intl.NumberFormat("fr-CH");
const dateFormatter = new Intl.DateTimeFormat("fr-CH", {
  weekday: "short",
  day: "2-digit",
  month: "2-digit",
});

const breakdownOrder = [
  { region: "lausanne", fulfillment: "delivery" },
  { region: "lausanne", fulfillment: "pickup" },
  { region: "lucens", fulfillment: "delivery" },
  { region: "lucens", fulfillment: "pickup" },
] as const;

const regionLabels = {
  lausanne: "Lausanne",
  lucens: "Lucens",
} as const;

const fulfillmentLabels = {
  delivery: "Livraison",
  pickup: "Retrait",
} as const;

function formatCount(value: number) {
  return numberFormatter.format(value);
}

function formatPassageLabel(value: number) {
  return `${formatCount(value)} ${value === 1 ? "passage" : "passages"}`;
}

function formatDay(day: string) {
  return dateFormatter.format(new Date(`${day}T12:00:00`)).replace(".", "");
}

function DashboardIntro({
  periodDays,
}: {
  periodDays: ReturnType<typeof parseStatisticsPeriod>;
}) {
  return (
    <section className={styles.intro} aria-labelledby="statistics-title">
      <div className={styles.introInner}>
        <div className={styles.titleBlock}>
          <p className={styles.eyebrow}>Tableau de bord privé</p>
          <h1 id="statistics-title">D’où viennent les demandes&nbsp;?</h1>
          <p className={styles.introText}>
            Suivez les passages validés vers WhatsApp par zone, mode de remise
            et localité de livraison.
          </p>
        </div>

        <nav className={styles.periodNav} aria-label="Période d’analyse">
          <span>Période</span>
          <div className={styles.periodOptions}>
            {STATISTICS_PERIODS.map((period) => (
              <a
                key={period}
                href={`/statistiques?periode=${period}`}
                aria-current={period === periodDays ? "page" : undefined}
              >
                {period === 365 ? "1 an" : `${period} j`}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </section>
  );
}

function ConfigurationState({
  status,
}: {
  status: "unconfigured" | "error";
}) {
  const isUnconfigured = status === "unconfigured";

  return (
    <section
      className={styles.stateCard}
      aria-labelledby={`${status}-state-title`}
      role={isUnconfigured ? undefined : "alert"}
    >
      <span className={styles.stateMarker} aria-hidden="true" />
      <div>
        <p className={styles.stateLabel}>
          {isUnconfigured ? "Configuration requise" : "Service indisponible"}
        </p>
        <h2 id={`${status}-state-title`}>
          {isUnconfigured
            ? "Connectez la base PostgreSQL"
            : "Les statistiques sont momentanément indisponibles"}
        </h2>
        <p>
          {isUnconfigured
            ? "Ajoutez la variable DATABASE_URL à l’environnement du site. Le tableau commencera ensuite à agréger les nouveaux passages vers WhatsApp."
            : "La commande WhatsApp reste opérationnelle. Réessayez dans quelques instants pour consulter les données."}
        </p>
      </div>
    </section>
  );
}

export default async function StatisticsPage({
  searchParams,
}: StatisticsPageProps) {
  const requestHeaders = await headers();

  if (
    !isStatsAuthorizationValid(requestHeaders.get("authorization"))
  ) {
    notFound();
  }

  const params = await searchParams;
  const periodDays = parseStatisticsPeriod(params.periode);
  const result = await getOrderStatistics(periodDays);

  if (result.status !== "ready") {
    return (
      <main id="contenu" className={styles.page}>
        <DashboardIntro periodDays={periodDays} />
        <div className={styles.content}>
          <ConfigurationState status={result.status} />
        </div>
      </main>
    );
  }

  const { snapshot } = result;
  const { summary } = snapshot;
  const deliveryShare =
    summary.handoffs > 0
      ? Math.round((summary.deliveryHandoffs / summary.handoffs) * 100)
      : 0;
  const pickupShare =
    summary.handoffs > 0
      ? Math.round((summary.pickupHandoffs / summary.handoffs) * 100)
      : 0;
  const trendMaximum = Math.max(
    1,
    ...snapshot.trend.map((entry) => entry.handoffs),
  );
  const breakdown = breakdownOrder.map((entry) => {
    const handoffs =
      snapshot.regions.find(
        (row) =>
          row.region === entry.region &&
          row.fulfillment === entry.fulfillment,
      )?.handoffs ?? 0;

    return {
      ...entry,
      handoffs,
      share:
        summary.handoffs > 0
          ? Math.round((handoffs / summary.handoffs) * 1000) / 10
          : 0,
    };
  });

  return (
    <main id="contenu" className={styles.page}>
      <DashboardIntro periodDays={periodDays} />

      <div className={styles.content}>
        <aside className={styles.privacyNote} aria-label="Nature des données">
          <span className={styles.privacyIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M7.5 10V7.5a4.5 4.5 0 0 1 9 0V10M6 10h12v10H6V10Z"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <p>
            <strong>Lecture à connaître.</strong>{" "}
            Un passage correspond à
            l’ouverture de WhatsApp après validation, pas à une commande
            confirmée. Seuls le NPA, la localité, la zone et le mode de remise
            sont agrégés&nbsp;: aucune adresse complète n’est conservée.
          </p>
        </aside>

        {summary.handoffs === 0 ? (
          <section className={styles.emptyState} aria-labelledby="empty-title">
            <span className={styles.emptyNumber} aria-hidden="true">
              00
            </span>
            <div>
              <p className={styles.stateLabel}>Aucune donnée sur la période</p>
              <h2 id="empty-title">Les prochains passages apparaîtront ici</h2>
              <p>
                Le suivi débute dès qu’un client valide sa demande et ouvre
                WhatsApp depuis le site.
              </p>
            </div>
          </section>
        ) : (
          <>
            <section aria-labelledby="overview-title">
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.sectionLabel}>Vue d’ensemble</p>
                  <h2 id="overview-title">Activité sur {periodDays} jours</h2>
                </div>
                <p>
                  Les comparaisons ci-dessous portent sur les passages
                  enregistrés pendant la période choisie.
                </p>
              </div>

              <dl className={styles.metricsGrid}>
                <div className={`${styles.metric} ${styles.metricPrimary}`}>
                  <dt>Passages vers WhatsApp</dt>
                  <dd>{formatCount(summary.handoffs)}</dd>
                  <span>Demandes validées sur le site</span>
                </div>
                <div className={styles.metric}>
                  <dt>Livraisons</dt>
                  <dd>{formatCount(summary.deliveryHandoffs)}</dd>
                  <span>{deliveryShare}% des passages</span>
                </div>
                <div className={styles.metric}>
                  <dt>Retraits</dt>
                  <dd>{formatCount(summary.pickupHandoffs)}</dd>
                  <span>{pickupShare}% des passages</span>
                </div>
              </dl>
            </section>

            <div className={styles.dashboardGrid}>
              <section
                className={styles.panel}
                aria-labelledby="locations-title"
              >
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.sectionLabel}>Géographie</p>
                    <h2 id="locations-title">Principales localités livrées</h2>
                  </div>
                  {snapshot.locations.length > 0 ? (
                    <span>Top {snapshot.locations.length}</span>
                  ) : null}
                </div>

                {snapshot.locations.length > 0 ? (
                  <div
                    className={styles.tableViewport}
                    role="region"
                    aria-label="Classement des localités livrées"
                    tabIndex={0}
                  >
                    <table className={styles.locationsTable}>
                      <caption className="sr-only">
                        Localités de livraison classées par nombre de passages
                        vers WhatsApp
                      </caption>
                      <thead>
                        <tr>
                          <th scope="col">Localité</th>
                          <th scope="col">NPA</th>
                          <th scope="col">Passages</th>
                        </tr>
                      </thead>
                      <tbody>
                        {snapshot.locations.map((location, index) => (
                          <tr
                            key={`${location.postalCode}-${location.city}`}
                          >
                            <td>
                              <span className={styles.rank}>
                                {String(index + 1).padStart(2, "0")}
                              </span>
                              <strong>{location.city}</strong>
                            </td>
                            <td>{location.postalCode}</td>
                            <td>{formatCount(location.handoffs)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className={styles.panelEmpty}>
                    Pas encore assez de passages agrégés pour afficher une
                    localité sur cette période.
                  </p>
                )}
              </section>

              <section
                className={styles.panel}
                aria-labelledby="breakdown-title"
              >
                <div className={styles.panelHeading}>
                  <div>
                    <p className={styles.sectionLabel}>Répartition</p>
                    <h2 id="breakdown-title">Zone et mode de remise</h2>
                  </div>
                </div>

                <ul className={styles.breakdownList}>
                  {breakdown.map((entry) => (
                    <li
                      key={`${entry.region}-${entry.fulfillment}`}
                      data-fulfillment={entry.fulfillment}
                    >
                      <div className={styles.breakdownMeta}>
                        <span>
                          <strong>{regionLabels[entry.region]}</strong>
                          <small>
                            {fulfillmentLabels[entry.fulfillment]}
                          </small>
                        </span>
                        <span>
                          {formatCount(entry.handoffs)}
                          <small>{entry.share}%</small>
                        </span>
                      </div>
                      <div
                        className={styles.barTrack}
                        aria-hidden="true"
                      >
                        <span
                          className={styles.barFill}
                          style={{ width: `${entry.share}%` }}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section
              className={`${styles.panel} ${styles.trendPanel}`}
              aria-labelledby="trend-title"
            >
              <div className={styles.panelHeading}>
                <div>
                  <p className={styles.sectionLabel}>Rythme récent</p>
                  <h2 id="trend-title">
                    Tendance sur {snapshot.trend.length} jours
                  </h2>
                </div>
                <span>Jour par jour</span>
              </div>

              <div
                className={styles.trendViewport}
                role="region"
                aria-label="Graphique des passages quotidiens"
                tabIndex={0}
              >
                <ol
                  className={styles.trendChart}
                  style={{
                    gridTemplateColumns: `repeat(${snapshot.trend.length}, minmax(45px, 1fr))`,
                  }}
                >
                  {snapshot.trend.map((entry) => {
                    const height =
                      entry.handoffs === 0
                        ? 0
                        : Math.max(
                            3,
                            Math.round(
                              (entry.handoffs / trendMaximum) * 100,
                            ),
                          );

                    return (
                      <li
                        key={entry.day}
                        aria-label={`${formatDay(entry.day)} : ${formatPassageLabel(
                          entry.handoffs,
                        )}`}
                      >
                        <span className={styles.trendValue} aria-hidden="true">
                          {formatCount(entry.handoffs)}
                        </span>
                        <span className={styles.trendPlot} aria-hidden="true">
                          <span
                            className={styles.trendBar}
                            style={{ height: `${height}%` }}
                          />
                        </span>
                        <time dateTime={entry.day} aria-hidden="true">
                          {formatDay(entry.day)}
                        </time>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
