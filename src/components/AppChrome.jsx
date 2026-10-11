import { Icon } from "./ui.jsx";
import { NAV_ITEMS } from "../utils/navItems.js";

function BrandLink({ className, logoClass, size, onOpenOverview }) {
  return (
    <a
      className={className}
      href="#overview"
      onClick={(event) => {
        event.preventDefault();
        onOpenOverview();
      }}
      aria-label="PaisaPilot overview"
    >
      <img
        className={logoClass}
        src="/paisapilot-logo.png"
        alt=""
        width={size}
        height={size}
      />
      <span className="brand-name">
        paisa<span>pilot</span>
      </span>
    </a>
  );
}

export function AppChrome({
  view,
  currentDay,
  onNavigate,
  onOpenMoneyLab,
  onReset,
  children,
}) {
  const go = (name) => {
    if (name === "Money Lab") onOpenMoneyLab();
    else onNavigate(name);
  };

  return (
    <>
      <aside className="sidebar">
        <BrandLink
          className="brand"
          logoClass="brand-logo"
          size={46}
          onOpenOverview={() => onNavigate("Overview")}
        />
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="nav-list" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => (
            <button
              type="button"
              className={`nav-item ${view === item.name ? "active" : ""}`}
              key={item.name}
              aria-label={item.name}
              aria-current={view === item.name ? "page" : undefined}
              title={item.name}
              onClick={() => go(item.name)}
            >
              <Icon>{item.icon}</Icon>
              <span>{item.name}</span>
              {item.name === "Money Lab" && (
                <span className="nav-spark">✦</span>
              )}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-tip">
            <span className="tip-icon">✧</span>
            <p>
              See the consequence
              <br />
              <strong>before you spend.</strong>
            </p>
          </div>
          <button type="button" className="reset-button" onClick={onReset}>
            <Icon>↺</Icon> Reset demo
          </button>
          <div className="profile">
            <div className="avatar">P</div>
            <div>
              <strong>Personal wallet</strong>
              <span>30-day challenge</span>
            </div>
          </div>
        </div>
      </aside>
      <main id="main-content" className="main-area">
        <BrandLink
          className="mobile-brand"
          logoClass="mobile-brand-logo"
          size={36}
          onOpenOverview={() => onNavigate("Overview")}
        />
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR FINANCIAL SPACE</p>
            <h1>{view === "Overview" ? "Money overview" : view}</h1>
          </div>
          <div className="topbar-right">
            <span className="period-badge">
              <span className="status-dot" /> DAY {currentDay} OF 30
            </span>
            <button
              type="button"
              className="avatar top-avatar"
              aria-label="Reset demo"
              onClick={onReset}
            >
              ↺
            </button>
          </div>
        </header>
        {children}
        <footer className="app-footer">
          <span>
            PAISAPILOT <span className="footer-dot">✦</span> YOUR MONEY, YOUR
            CALL
          </span>
          <span>Demo data · No bank connection</span>
        </footer>
      </main>
      <nav className="mobile-nav" aria-label="Mobile navigation">
        {NAV_ITEMS.map((item) => (
          <button
            type="button"
            key={item.name}
            className={view === item.name ? "active" : ""}
            aria-current={view === item.name ? "page" : undefined}
            onClick={() => go(item.name)}
          >
            <Icon>{item.icon}</Icon>
            <span>{item.short}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
