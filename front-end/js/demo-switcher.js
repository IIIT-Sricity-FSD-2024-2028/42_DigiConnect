/**
 * DigiConnect — Demo Switcher (Disabled)
 * The visual demo switcher bar has been removed as requested.
 * All personas and underlying role management functions remain intact in role-manager.js.
 */
export function initDemoSwitcher() {
  const existing = document.getElementById('digiconnect-demo-switcher');
  if (existing) {
    existing.remove();
  }
}
