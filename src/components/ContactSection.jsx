export default function ContactSection() {
  return (
    <section className="contact-section card" id="contact">
      <h2>Contact</h2>
      <p>
        Vous souhaitez rejoindre la prochaine session, collaborer ou obtenir un
        devis ? Contactez-moi :
      </p>
      <a className="btn" href="mailto:formation@example.com">
        formation@example.com
      </a>
      <p className="contact-section__helper">
        Réponse sous 48h ouvrées avec programme détaillé et prérequis.
      </p>
    </section>
  );
}
