import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [preferences, setPreferences] = useState({
    functional: true,
    statistics: false,
    marketing: false,
  });

  useEffect(() => {
    const consentGiven = localStorage.getItem('cmplz_consent_given');
    if (!consentGiven) {
      setIsVisible(true);
      document.body.style.overflow = 'hidden';
    } else {
      try {
        const savedPrefs = JSON.parse(localStorage.getItem('cmplz_preferences') || '{}');
        setPreferences(prev => ({ ...prev, ...savedPrefs }));
      } catch (e) {}
    }
    return () => { document.body.style.overflow = ''; };
  }, []);

  const saveConsent = (acceptAll: boolean, denyAll: boolean = false) => {
    let newPreferences = { ...preferences };
    if (acceptAll) {
      newPreferences = { functional: true, statistics: true, marketing: true };
    } else if (denyAll) {
      newPreferences = { functional: true, statistics: false, marketing: false };
    }
    localStorage.setItem('cmplz_consent_given', 'true');
    localStorage.setItem('cmplz_preferences', JSON.stringify(newPreferences));
    localStorage.setItem('cmplz_policy_id', '34');
    document.cookie = `cmplz_functional=allow;path=/;max-age=${365*24*60*60};SameSite=Lax`;
    document.cookie = `cmplz_statistics=${newPreferences.statistics ? 'allow' : 'deny'};path=/;max-age=${365*24*60*60};SameSite=Lax`;
    document.cookie = `cmplz_marketing=${newPreferences.marketing ? 'allow' : 'deny'};path=/;max-age=${365*24*60*60};SameSite=Lax`;
    setPreferences(newPreferences);
    setIsVisible(false);
    document.body.style.overflow = '';
    window.dispatchEvent(new CustomEvent('cmplz_consent_updated', { detail: newPreferences }));
  };

  const handleClose = () => {
    // Close without saving - user must choose
    // For GDPR compliance, closing should be like denying
    saveConsent(false, true);
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="cmplz-overlay" />
      <div className="cmplz-cookiebanner" role="dialog" aria-modal="true" aria-labelledby="cmplz-header" aria-describedby="cmplz-message">
        {/* Header */}
        <div className="cmplz-header">
          <div className="cmplz-logo">
            <img
              width="40"
              height="40"
              src="/images/hercules-logo-original1.png"
              alt="Hercules Merchandise DE"
            />
          </div>
          <div className="cmplz-title" id="cmplz-header">Einwilligung verwalten</div>
          <div
            className="cmplz-close"
            tabIndex={0}
            role="button"
            aria-label="Dialog schließen"
            onClick={handleClose}
            onKeyDown={(e) => e.key === 'Enter' && handleClose()}
          >
            <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 352 512">
              <path fill="currentColor" d="M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"></path>
            </svg>
          </div>
        </div>

        <div className="cmplz-divider"></div>

        {/* Body */}
        <div className="cmplz-body">
          <div className="cmplz-message" id="cmplz-message">
            <p><strong>Um die besten Erfahrungen zu bieten, verwenden wir Technologien wie Cookies, um Geräteinformationen zu speichern und/oder darauf zuzugreifen. Wenn Sie diesen Technologien zustimmen, können wir Daten wie Ihr Surfverhalten oder eindeutige IDs auf dieser Website verarbeiten. Wenn Sie Ihre Zustimmung nicht erteilen oder zurückziehen, kann dies bestimmte Funktionen und Features beeinträchtigen.</strong></p>
          </div>

          {/* Categories - shown when "Einstellungen anzeigen" is clicked */}
          {showCategories && (
            <div className="cmplz-categories cmplz-fade-in">
              {/* Functional */}
              <details className="cmplz-category cmplz-functional" open>
                <summary>
                  <span className="cmplz-category-header">
                    <span className="cmplz-category-title">Funktional</span>
                    <span className="cmplz-always-active">
                      <span className="cmplz-banner-checkbox">
                        <input type="checkbox" checked disabled className="cmplz-consent-checkbox cmplz-functional" />
                        <label className="cmplz-label"></label>
                      </span>
                      Immer aktiv
                    </span>
                    <span className="cmplz-icon cmplz-open">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="18">
                        <path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/>
                      </svg>
                    </span>
                  </span>
                </summary>
                <div className="cmplz-description">
                  Die technische Speicherung oder der Zugriff ist unbedingt erforderlich für den legitimen Zweck, die Nutzung eines bestimmten Dienstes zu ermöglichen, der vom Abonnenten oder Nutzer ausdrücklich gewünscht wird, oder für den alleinigen Zweck, die Übertragung einer Nachricht über ein elektronisches Kommunikationsnetz durchzuführen.
                </div>
              </details>

              {/* Statistics */}
              <details className="cmplz-category cmplz-statistics">
                <summary>
                  <span className="cmplz-category-header">
                    <span className="cmplz-category-title">Statistiken</span>
                    <span className="cmplz-banner-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={preferences.statistics}
                        onChange={() => setPreferences(p => ({...p, statistics: !p.statistics}))}
                        className="cmplz-consent-checkbox cmplz-statistics"
                      />
                      <label className="cmplz-label"></label>
                    </span>
                    <span className="cmplz-icon cmplz-open">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="18">
                        <path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/>
                      </svg>
                    </span>
                  </span>
                </summary>
                <div className="cmplz-description">
                  Die technische Speicherung oder der Zugriff, der ausschließlich zu statistischen Zwecken verwendet wird.
                </div>
              </details>

              {/* Marketing */}
              <details className="cmplz-category cmplz-marketing">
                <summary>
                  <span className="cmplz-category-header">
                    <span className="cmplz-category-title">Marketing</span>
                    <span className="cmplz-banner-checkbox" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={preferences.marketing}
                        onChange={() => setPreferences(p => ({...p, marketing: !p.marketing}))}
                        className="cmplz-consent-checkbox cmplz-marketing"
                      />
                      <label className="cmplz-label"></label>
                    </span>
                    <span className="cmplz-icon cmplz-open">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="18">
                        <path d="M224 416c-8.188 0-16.38-3.125-22.62-9.375l-192-192c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L224 338.8l169.4-169.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-192 192C240.4 412.9 232.2 416 224 416z"/>
                      </svg>
                    </span>
                  </span>
                </summary>
                <div className="cmplz-description">
                  Die technische Speicherung oder der Zugriff ist erforderlich, um Nutzerprofile zu erstellen, um Werbung zu versenden, oder um den Nutzer auf einer Website oder über mehrere Websites hinweg zu verfolgen, um ähnliche Marketingzwecke zu erfüllen.
                </div>
              </details>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="cmplz-buttons">
          <button className="cmplz-btn cmplz-accept" onClick={() => saveConsent(true)}>
            Akzeptieren
          </button>
          <button className="cmplz-btn cmplz-deny" onClick={() => saveConsent(false, true)}>
            Ablehnen
          </button>
          {!showCategories ? (
            <button className="cmplz-btn cmplz-view-preferences" onClick={() => setShowCategories(true)}>
              Einstellungen anzeigen
            </button>
          ) : (
            <button className="cmplz-btn cmplz-save-preferences" onClick={() => saveConsent(false)}>
              Auswahl speichern
            </button>
          )}
        </div>
      </div>

      <style>{`
        .cmplz-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 99998;
        }

        .cmplz-cookiebanner {
          position: fixed;
          left: 10px;
          bottom: 10px;
          width: 526px;
          max-width: calc(100vw - 20px);
          max-height: calc(100vh - 20px);
          background: #ffffff;
          border-radius: 12px;
          padding: 15px 20px;
          z-index: 99999;
          box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          box-sizing: border-box;
          overflow: hidden;
        }

        .cmplz-header {
          display: grid;
          grid-template-columns: 100px 1fr 100px;
          align-items: center;
        }

        .cmplz-logo img {
          max-height: 40px;
          width: auto;
        }

        .cmplz-title {
          justify-self: center;
          font-size: 15px;
          font-weight: 500;
          color: #253461;
          text-align: center;
        }

        .cmplz-close {
          justify-self: end;
          font-size: 20px;
          cursor: pointer;
          width: 20px;
          height: 20px;
          color: #253461;
          line-height: 20px;
        }

        .cmplz-close svg {
          width: 20px;
          height: 20px;
        }

        .cmplz-close:hover {
          opacity: 0.7;
        }

        .cmplz-divider {
          margin-left: -20px;
          margin-right: -20px;
          border-bottom: 1px solid #f2f2f2;
        }

        .cmplz-body {
          display: flex;
          flex-direction: column;
          gap: 10px;
          overflow-y: auto;
          max-height: 55vh;
        }

        .cmplz-body::-webkit-scrollbar {
          width: 5px;
        }

        .cmplz-body::-webkit-scrollbar-thumb {
          background-color: #10c99e;
          border-radius: 10px;
        }

        .cmplz-message {
          font-size: 12px;
          line-height: 18px;
          color: #253461;
          margin-bottom: 5px;
        }

        .cmplz-message p {
          margin: 0;
        }

        .cmplz-categories {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .cmplz-categories.cmplz-fade-in {
          animation: cmplz-fadeIn 0.3s ease;
        }

        @keyframes cmplz-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cmplz-category {
          background-color: rgba(239, 239, 239, 0.5);
          border-radius: 4px;
        }

        .cmplz-category summary {
          list-style: none;
          cursor: pointer;
          display: block;
        }

        .cmplz-category summary::-webkit-details-marker {
          display: none;
        }

        .cmplz-category-header {
          display: grid;
          grid-template-columns: 1fr auto 15px;
          align-items: center;
          gap: 10px;
          padding: 10px;
        }

        .cmplz-category-title {
          font-size: 14px;
          font-weight: 500;
          color: #253461;
        }

        .cmplz-always-active {
          font-size: 12px;
          font-weight: 500;
          color: green;
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .cmplz-always-active .cmplz-banner-checkbox {
          display: none;
        }

        .cmplz-icon.cmplz-open {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease;
        }

        .cmplz-icon.cmplz-open svg {
          fill: #253461;
        }

        .cmplz-category[open] .cmplz-icon.cmplz-open {
          transform: rotate(180deg);
        }

        .cmplz-description {
          font-size: 12px;
          color: #253461;
          padding: 0 10px 10px;
          line-height: 1.5;
        }

        /* Toggle Switch */
        .cmplz-banner-checkbox {
          position: relative;
          display: flex;
          align-items: center;
        }

        .cmplz-consent-checkbox {
          opacity: 0;
          position: absolute;
          cursor: pointer;
          width: 40px;
          height: 20px;
          z-index: 1;
          margin: 0;
        }

        .cmplz-label {
          position: relative;
          padding-left: 30px;
          cursor: pointer;
          display: block;
          height: 15px;
        }

        .cmplz-label:before {
          content: "";
          display: block;
          position: absolute;
          left: 0;
          top: 0;
          width: 28px;
          height: 15px;
          background-color: #F56E28;
          border-radius: 10px;
          transition: background-color 0.3s;
        }

        .cmplz-label:after {
          content: "";
          display: block;
          position: absolute;
          left: 4px;
          top: 2px;
          width: 11px;
          height: 11px;
          background: #ffffff;
          border-radius: 50%;
          transition: left 0.3s;
        }

        .cmplz-consent-checkbox:checked + .cmplz-label:before {
          background-color: #1e73be;
        }

        .cmplz-consent-checkbox:checked + .cmplz-label:after {
          left: 14px;
        }

        .cmplz-buttons {
          display: flex;
          gap: 10px;
        }

        .cmplz-btn {
          flex: 1;
          height: 45px;
          padding: 10px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 500;
          text-align: center;
          border: 1px solid;
          font-family: inherit;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .cmplz-btn:hover {
          opacity: 0.9;
        }

        .cmplz-btn.cmplz-accept {
          background-color: #10c99e;
          border-color: #10c99e;
          color: #ffffff;
        }

        .cmplz-btn.cmplz-deny {
          background-color: #f9f9f9;
          border-color: #f2f2f2;
          color: #222222;
        }

        .cmplz-btn.cmplz-view-preferences,
        .cmplz-btn.cmplz-save-preferences {
          background-color: #f9f9f9;
          border-color: #f2f2f2;
          color: #333333;
        }

        @media (max-width: 768px) {
          .cmplz-cookiebanner {
            left: 0;
            right: 0;
            bottom: 0;
            width: 100%;
            max-width: 100%;
            border-radius: 12px 12px 0 0;
          }

          .cmplz-buttons {
            flex-direction: column;
          }
        }

        @media (max-width: 425px) {
          .cmplz-header .cmplz-title {
            display: none;
          }

          .cmplz-header {
            grid-template-columns: 50px 1fr 30px;
          }

          .cmplz-category-header {
            grid-template-columns: 1fr !important;
            gap: 5px;
          }
        }
      `}</style>
    </>
  );
}
