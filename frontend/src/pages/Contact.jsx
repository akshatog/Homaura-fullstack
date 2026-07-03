import "../styles/Contact.css";

const contactLinks = [
  {
    label: "WhatsApp",
    href: "https://wa.me/917322073770",
    type: "whatsapp",
  },
  {
    label: "Phone",
    href: "tel:+917322073770",
    type: "phone",
  },
  {
    label: "Email",
    href: "mailto:akshatsanghi900@gmail.com",
    type: "email",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/akshat_sanghi_/",
    type: "instagram",
  },
];

const icons = {
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.66 15l-1.23 4.49 4.62-1.21A10 10 0 1 0 12 2zm0 18.21a8.19 8.19 0 0 1-4.17-1.15l-.3-.18-2.73.71.73-2.67-.2-.32A8.21 8.21 0 1 1 12 20.21zm4.74-5.08c-.26-.13-1.53-.76-1.77-.85s-.4-.13-.56.13-.64.85-.78 1-.29.19-.54.06a6.7 6.7 0 0 1-2-1.22 7.29 7.29 0 0 1-1.35-1.67c-.14-.26 0-.4.11-.53s.26-.32.38-.48a1.78 1.78 0 0 0 .25-.42.47.47 0 0 0 0-.45c-.07-.13-.56-1.35-.77-1.85s-.41-.42-.56-.43h-.48a.93.93 0 0 0-.66.31 2.75 2.75 0 0 0-.86 2 4.79 4.79 0 0 0 1 2.56 10.94 10.94 0 0 0 4.2 3.63 14.08 14.08 0 0 0 1.43.53 3.44 3.44 0 0 0 1.58.1 2.58 2.58 0 0 0 1.69-1.18 2.1 2.1 0 0 0 .14-1.18c-.06-.1-.23-.16-.49-.29z" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.62 10.79a15.46 15.46 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1-.25 11.36 11.36 0 0 0 3.55.57 1 1 0 0 1 1 1v3.6a1 1 0 0 1-1 1A17.76 17.76 0 0 1 2 6a1 1 0 0 1 1-1h3.61a1 1 0 0 1 1 1 11.36 11.36 0 0 0 .58 3.55 1 1 0 0 1-.25 1z" />
    </svg>
  ),
  email: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6zm-16 12V8l8 7 8-7v10z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M16.5 2h-9A5.5 5.5 0 0 0 2 7.5v9A5.5 5.5 0 0 0 7.5 22h9a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 16.5 2zm3.5 14.5a3.5 3.5 0 0 1-3.5 3.5h-9A3.5 3.5 0 0 1 4 16.5v-9A3.5 3.5 0 0 1 7.5 4h9A3.5 3.5 0 0 1 20 7.5zm-8-7A5.5 5.5 0 1 0 17.5 11 5.5 5.5 0 0 0 12 7.5zm0 9A3.5 3.5 0 1 1 15.5 13 3.5 3.5 0 0 1 12 16.5zm5.75-9.75a1.25 1.25 0 1 0-1.25-1.25 1.25 1.25 0 0 0 1.25 1.25z" />
    </svg>
  ),
};

export default function Contact() {
  return (
    <div className="contact-page">
      <section className="contact-hero">
        <p>Connect with us</p>
        <h1>Contact Homaura</h1>
        <p className="contact-hero__text">
          WhatsApp, call, or mail us for custom orders, rush requests, or styling help.
          We reply within a few pastel-perfect hours.
        </p>
      </section>

      <section className="contact-grid">
        {contactLinks.map((item) => (
          <a
            key={item.label}
            className={`contact-card ${item.type}`}
            href={item.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="contact-card__icon">{icons[item.type]}</span>
            <div className="contact-card__content">
              <p>{item.label}</p>
              <h3>{item.value}</h3>
            </div>
            <span aria-hidden="true" className="contact-card__chevron">
              ↗
            </span>
          </a>
        ))}
      </section>
    </div>
  );
}

