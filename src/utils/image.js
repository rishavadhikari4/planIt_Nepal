/*
 * Cloudinary delivery URLs, sized for where they are actually shown.
 *
 * Every image on the site was served at whatever dimensions it was uploaded
 * at — a 4000px hall photograph behind a 384px card. Cloudinary will resize
 * and re-encode on delivery for free; nothing was asking it to.
 *
 * `f_auto` picks WebP or AVIF when the browser takes it, `q_auto` sets
 * quality from the image's own content, and `c_limit` never enlarges a small
 * original.
 */

const CLOUDINARY = /^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//

/**
 * @param {string} url        the stored image URL
 * @param {object} options
 * @param {number} options.w  the widest this image is ever painted, in CSS px
 * @param {number} options.dpr device pixel ratio to serve for (default 2)
 */
export const img = (url, { w = 800, dpr = 2 } = {}) => {
  if (!url || typeof url !== 'string') return url
  // Anything not served by Cloudinary is returned untouched — a transform
  // path appended to someone else's host is just a broken URL.
  if (!CLOUDINARY.test(url)) return url
  // Already transformed by an earlier call or by hand; leave it alone.
  if (/\/upload\/[^/]*[fq]_auto/.test(url)) return url

  const width = Math.round(w * dpr)
  return url.replace('/image/upload/', `/image/upload/f_auto,q_auto,c_limit,w_${width}/`)
}

/**
 * A `srcset` across the widths a responsive image is actually asked for, so
 * a phone is not made to download the desktop rendering.
 */
export const imgSrcSet = (url, widths = [400, 800, 1200, 1600]) => {
  if (!url || !CLOUDINARY.test(url)) return undefined
  return widths.map((w) => `${img(url, { w, dpr: 1 })} ${w}w`).join(', ')
}

/* The sizes the design actually uses, named for where they appear. Passing a
   name rather than a number keeps the numbers in one file when the layout
   changes. */
export const SIZES = {
  thumb: 96,
  card: 480,
  tile: 640,
  panel: 900,
  hero: 1800,
}
