export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  } else if (window.location.origin.includes('localhost')) {
    return 'https://api.dev.entur.io/mobility/v2/';
  } else if (window.location.origin.includes('api.dev.entur.io')) {
    return 'https://api.dev.entur.io/mobility/v2/';
  } else if (window.location.origin.includes('api.staging.entur.io')) {
    return 'https://api.staging.entur.io/mobility/v2/';
  } else if (window.location.origin.includes('api.entur.io')) {
    return 'https://api.entur.io/mobility/v2/';
  }
};
