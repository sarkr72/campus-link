import React from 'react';
import styles from '/styles/footer.css';

const Footer = () => {
  return (
    <footer className={styles.footer} >
      <div className="waves">
        <div className="wave" id="wave1"></div>
        <div className="wave" id="wave2"></div>
        <div className="wave" id="wave3"></div>
        <div className="wave" id="wave4"></div>
      </div>

      <ul className="menu">
        <li><a href="/">Home</a></li>
        <li><a href="/pages/about">About Us</a></li>
        <li><a href="/pages/contact">Contact Us</a></li>
      </ul>
      <p className="copyright">© 2024 Campus Link</p>
    </footer>
  );
};

export default Footer;
