import styles from '../styles/UnsupportedBrowser.module.css';

interface UnsupportedBrowserProps {
  unsupportedFeatures: string[];
}

/**
 * UnsupportedBrowser Component
 *
 * Displays an error message when the browser doesn't support required features
 */
export const UnsupportedBrowser: React.FC<UnsupportedBrowserProps> = ({ unsupportedFeatures }) => {
  const browsers = [
    { name: 'Google Chrome', url: 'https://www.google.com/chrome/' },
    { name: 'Mozilla Firefox', url: 'https://www.mozilla.org/firefox/' },
    { name: 'Microsoft Edge', url: 'https://www.microsoft.com/edge' },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.icon}>⚠️</div>
        <h1 className={styles.title}>Browser Not Supported</h1>

        <p className={styles.message}>
          Your browser doesn't support the following required features:
        </p>

        <ul className={styles.featureList}>
          {unsupportedFeatures.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>

        <p className={styles.recommendation}>
          Please use one of the following modern browsers:
        </p>

        <div className={styles.browserLinks}>
          {browsers.map((browser) => (
            <a
              key={browser.name}
              href={browser.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.browserLink}
            >
              {browser.name}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
