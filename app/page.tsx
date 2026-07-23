import EventsSection from "./events-section";
import GallerySection from "./gallery-section";
import OrderExperience from "./order-experience";
import PresentationSection from "./presentation-section";

export default function Home() {
  return (
    <main id="contenu">
      <OrderExperience view="home" />
      <PresentationSection />
      <EventsSection />
      <GallerySection />
    </main>
  );
}
