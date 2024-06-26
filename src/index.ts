import type { Request, Response, NextFunction } from 'express';
import logger from 'debug';

const debug = logger('@entva/express-sanitizeurl');

const getSafeUrl = (originalUrl: string) => {
  const [href, ...qs] = originalUrl.split('?');

  const safeHref = href.replace(/\/+/g, '/');
  const safeQs = qs.join('&');

  let url = safeHref;
  if (safeQs.length) url += `?${safeQs}`;

  return url;
};

export type Options = {
  redirectTo: string,
};

const defaults = {
  redirectTo: '/',
};

const getMiddleware = (params?: Options) => {
  const options = { ...defaults, ...params };

  const middleware = (req: Request, res: Response, next: NextFunction) => {
    const { originalUrl } = req;

    try {
      decodeURIComponent(originalUrl);
    } catch (err) {
      const url = options.redirectTo;
      debug(`couldn't parse ${originalUrl}, redirecting to ${url}`);
      return res.redirect(301, url);
    }

    const safeUrl = getSafeUrl(originalUrl);

    if (originalUrl !== safeUrl) {
      debug(`${originalUrl} isn't valid, redirecting to ${safeUrl}`);
      return res.redirect(301, safeUrl);
    }

    next();
  };

  return middleware;
};

export default getMiddleware;
