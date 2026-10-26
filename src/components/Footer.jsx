import { Zap } from 'lucide-react';

const currentYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner container">
        <a className="footer-brand" href="#top">
          <span className="footer-mark" aria-hidden="true">
            <Zap size={13} strokeWidth={2.5} />
          </span>
          DZ Tech Store
        </a>

        <p className="footer-copy">
          © {currentYear} DZ Tech. Curated tech, delivered fast.
        </p>

        <div className="footer-links">
          <a href="#catalog">Shop</a>
          <a href="#top">Back to top</a>
        </div>
      </div>
    </footer>
  );
}
