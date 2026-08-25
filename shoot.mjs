/*
 * Screenshots the running app so the design can be looked at rather than
 * guessed at.
 *
 *   node shoot.mjs                     every page, desktop + mobile
 *   node shoot.mjs / /venues           just those routes
 *
 * Needs the dev servers up:  npm run dev  (frontend)  and the backend on :5050
 */
import { chromium } from "playwright"
import { mkdirSync } from "fs"

const BASE = process.env.SHOOT_BASE || "http://localhost:8080"
const OUT = process.env.SHOOT_OUT || "/tmp/shots"
const FRAMES = Number(process.env.SHOOT_FRAMES || 6)

const ROUTES = process.argv.slice(2).length
  ? process.argv.slice(2)
  : ["/", "/venues", "/cuisines", "/studios", "/contact", "/login", "/cart"]

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]

mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch()

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 2,
    // Animations are captured mid-flight otherwise; this settles them.
    reducedMotion: "no-preference",
  })
  const page = await ctx.newPage()

  const errors = []
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()))
  page.on("pageerror", (e) => errors.push(String(e)))

  for (const route of ROUTES) {
    const slug = route === "/" ? "home" : route.replace(/^\//, "").replace(/\//g, "-")
    try {
      await page.goto(BASE + route, { waitUntil: "networkidle", timeout: 45000 })
      // Let scroll-triggered reveals run, then settle at the top.
      await page.evaluate(async () => {
        await new Promise((r) => {
          let y = 0
          const step = () => {
            y += window.innerHeight * 0.8
            window.scrollTo(0, y)
            if (y < document.body.scrollHeight) setTimeout(step, 120)
            else setTimeout(() => { window.scrollTo(0, 0); r() }, 500)
          }
          step()
        })
      })
      await page.waitForTimeout(900)

      /* Viewport-sized frames, not fullPage. A fullPage capture resizes the
         viewport to the document height, so any vh-based layout renders at the
         wrong scale — an 86vh hero becomes 86% of the whole page. */
      const h = await page.evaluate(() => document.body.scrollHeight)
      const frames = Math.min(FRAMES, Math.ceil(h / vp.height))

      for (let f = 0; f < frames; f++) {
        const y = Math.round(f * vp.height * 0.92)
        await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y)
        await page.waitForTimeout(650)
        await page.screenshot({ path: `${OUT}/${slug}-${vp.name}-${f + 1}.png` })
      }
      console.log(`  ${vp.name.padEnd(7)} ${route.padEnd(14)} ${h}px  ${frames} frames`)
    } catch (err) {
      console.log(`  ${vp.name.padEnd(7)} ${route.padEnd(12)} FAILED: ${err.message.split("\n")[0]}`)
    }
  }

  if (errors.length) {
    console.log(`\n  console errors (${vp.name}):`)
    ;[...new Set(errors)].slice(0, 8).forEach((e) => console.log(`    ${e.slice(0, 160)}`))
  }

  await ctx.close()
}

await browser.close()
console.log(`\nwritten to ${OUT}`)
