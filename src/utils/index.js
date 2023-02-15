import { trackerService } from './services';
import Bowser from 'bowser';

const createRequest = (endpoint, task) => {
  return `${endpoint}/visitor/v1/${task}`;
};

/* FUNCTION */
const initTracker = async (endpoint, url, referrer, user_agent) => {
  const { document } = window;
  const { pathname, search, origin } = location;
  url = `${origin}${pathname}${search}`;
  referrer = document.referrer;
  user_agent = window.navigator.userAgent;
  const browser = Bowser.parse(window.navigator.userAgent);
  const browser_name = browser?.browser?.name;
  const browser_version = browser?.browser?.version;
  const lang = window.navigator.userLanguage || window.navigator.language;
  const device = browser?.platform?.model ?? browser?.platform?.type;
  const domain = `${origin}`;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  let attributes = [];
  for (var key of urlParams.keys()) {
    if (key.startsWith('utm_')) {
      urlParams.get(key) && attributes.push({ name: key, value: urlParams.get(key) });
    }
  }
  if (!urlParams.get('event_id') && !urlParams.get('uuid')) {
    let ip = '';
    const response = await trackerService(createRequest(endpoint, 'init'), {
      url: url,
      referrer: referrer,
      user_agent: user_agent,
      ip: ip,
      domain: domain,
      browser_name: browser_name,
      browser_version: browser_version,
      lang: lang,
      device: device,
      event_name: 'visit',
      event_type: 'action',
      attributes: attributes,
    });
    return response;
  }
};

const startTracker = async (endpoint, event_uuid, visitor_uuid, referrer) => {
  const { location, document } = window;
  referrer = referrer
    ? location.protocol + '//' + location.host + referrer
    : document.referrer.split('?')[0];
  const url = location.protocol + '//' + location.host + location.pathname;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseStart = await trackerService(createRequest(endpoint, 'start'), {
    ...(urlParams.get('event_uuid') && {
      event_uuid: urlParams.get('event_uuid'),
    }),
    ...(urlParams.get('visitor_uuid') && {
      visitor_uuid: urlParams.get('visitor_uuid'),
    }),
    ...(event_uuid && {
      event_uuid: event_uuid,
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
    referrer: referrer === '/' ? '' : referrer,
    url: url,
  });

  return responseStart;
};

const endTracker = async (endpoint, event_uuid, visitor_uuid) => {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseEnd = await trackerService(createRequest(endpoint, 'end'), {
    ...(urlParams.get('event_uuid_start') && {
      event_uuid: urlParams.get('event_uuid_start'),
    }),
    ...(urlParams.get('visitor_uuid_start') && {
      visitor_uuid: urlParams.get('visitor_uuid_start'),
    }),
    ...(event_uuid && {
      event_uuid: event_uuid,
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
  });
  return responseEnd;
};

const trackEvent = async (endpoint, event_uuid, visitor_uuid, referrer, data) => {
  const { location, document } = window;
  referrer = referrer
    ? location.protocol + '//' + location.host + referrer
    : document.referrer.split('?')[0];
  const url = location.protocol + '//' + location.host + location.pathname;
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const responseStart = await trackerService(createRequest(endpoint, 'start'), {
    ...(urlParams.get('event_uuid') && {
      event_uuid: urlParams.get('event_uuid'),
    }),
    ...(urlParams.get('visitor_uuid') && {
      visitor_uuid: urlParams.get('visitor_uuid'),
    }),
    ...(event_uuid && {
      event_uuid: event_uuid,
    }),
    ...(visitor_uuid && {
      visitor_uuid: visitor_uuid,
    }),
    referrer: referrer === '/' ? '' : referrer,
    url: url,
    ...data,
  });

  return responseStart;
};

export { initTracker, startTracker, endTracker, trackEvent };