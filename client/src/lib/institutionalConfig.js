/**
 * CampusShelf Institutional Domain Configuration
 * 
 * Target Scope: MVJ College of Engineering (MVJCE)
 * 
 * NOTE: The actual institutional domain has not been permanently finalized by college IT.
 * This configuration allows modifying or extending allowed domains without code rewrites.
 * 
 * HOW TO CONFIGURE:
 * 1. Set VITE_INSTITUTIONAL_DOMAINS in client/.env, e.g.:
 *    VITE_INSTITUTIONAL_DOMAINS="@mvjce.edu.in,@mvjce.onmicrosoft.com,@outlook.com"
 * 2. In Supabase PostgreSQL, add or deactivate entries in public.institutional_domain_config:
 *    INSERT INTO public.institutional_domain_config (domain, institution_name) VALUES ('@newdomain.edu.in', 'MVJCE New');
 */

// Default fallback institutional domains
export const DEFAULT_INSTITUTIONAL_DOMAINS = [
  '@mvjce.edu.in',
  '@mvjce.onmicrosoft.com',
  '@mvjce.ac.in',
];

/**
 * Retrieve the active approved institutional domains.
 * Reads from VITE_INSTITUTIONAL_DOMAINS env variable if defined, otherwise falls back to defaults.
 */
export function getApprovedDomains() {
  const envDomains = import.meta.env.VITE_INSTITUTIONAL_DOMAINS;
  if (envDomains && typeof envDomains === 'string') {
    return envDomains
      .split(',')
      .map(d => d.trim().toLowerCase())
      .filter(Boolean)
      .map(d => (d.startsWith('@') ? d : `@${d}`));
  }
  return DEFAULT_INSTITUTIONAL_DOMAINS;
}

/**
 * Validate whether an email belongs to an approved institutional domain.
 * @param {string} email
 * @returns {boolean}
 */
export function isApprovedInstitutionalDomain(email) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return false;
  }
  const domain = `@${email.split('@')[1].trim().toLowerCase()}`;
  const approved = getApprovedDomains();
  return approved.some(d => d.toLowerCase() === domain);
}

/**
 * Human-readable description of accepted domains for UI helper hints.
 * @returns {string}
 */
export function getDomainHelperText() {
  const domains = getApprovedDomains();
  if (domains.length === 1) {
    return `Must end in ${domains[0]}`;
  }
  return `Accepted domains: ${domains.join(', ')}`;
}

