import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <a href="#" className="logo" aria-label="Frank">
            <Logo height={26} />
          </a>
          <p className="footer-copy">
            (c) 2026 Frank. Open source. BYOK. All rights reserved.
          </p>
        </div>
        <div className="footer-col">
          <h3 className="footer-heading">Product</h3>
          <ul>
            <li><a href="#features">Features</a></li>
            <li><a href="#free">Free</a></li>
            <li><a href="#how">How it works</a></li>
            <li><a href="#">Changelog</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3 className="footer-heading">Resources</h3>
          <ul>
            <li><a href="#">Docs</a></li>
            <li><a href="#">GitHub</a></li>
            <li><a href="#">Community</a></li>
            <li><a href="#">Terms of service</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h3 className="footer-heading">Social</h3>
          <div className="footer-social">
            <a href="#" aria-label="Twitter">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="m13.063 9 3.495 4.475L20.601 9h2.454l-5.359 5.931L24 23h-4.938l-3.866-4.893L10.771 23H8.316l5.735-6.342L8 9h5.063Z" />
              </svg>
            </a>
            <a href="#" aria-label="Github">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 8.2c-4.4 0-8 3.6-8 8 0 3.5 2.3 6.5 5.5 7.6.4.1.5-.2.5-.4V22c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.2-.9-1.2-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.3 1.9.9 2.3.7.1-.5.3-.9.5-1.1-1.8-.2-3.6-.9-3.6-4 0-.9.3-1.6.8-2.1-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8.6-.2 1.3-.3 2-.3s1.4.1 2 .3c1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.1 0 3.1-1.9 3.7-3.7 3.6.3.4.6.9.6 1.6v2.2c0 .2.1.5.6.4 3.2-1.1 5.5-4.1 5.5-7.6 0-4.4-3.6-8-8-8z" />
              </svg>
            </a>
            <a href="#" aria-label="Discord">
              <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M24.5 8.5a20 20 0 0 0-5-1.6l-.24.47a18.6 18.6 0 0 0-6.52 0L12.5 6.9a20 20 0 0 0-5 1.6A20.7 20.7 0 0 0 3.6 22.9a20 20 0 0 0 6.1 3.1l.8-1.3c-.7-.26-1.4-.6-2.1-1l.67-.54a14.3 14.3 0 0 0 12.3 0l.67.54c-.7.4-1.4.74-2.1 1l.8 1.3a20 20 0 0 0 6.1-3.1 20.6 20.6 0 0 0-3.7-14.4ZM12.25 20.5c-1.05 0-1.9-1-1.9-2.2s.82-2.2 1.9-2.2 1.93.99 1.9 2.2c0 1.23-.85 2.2-1.9 2.2Zm7.5 0c-1.05 0-1.9-1-1.9-2.2s.82-2.2 1.9-2.2 1.9.99 1.9 2.2c0 1.23-.7 2.2-1.9 2.2Z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}