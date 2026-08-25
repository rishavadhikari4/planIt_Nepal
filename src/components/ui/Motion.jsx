import { useEffect, useRef, useState } from "react"
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from "framer-motion"

/*
 * The motion vocabulary for the whole site.
 *
 * One easing curve, one set of durations, one stagger interval. Motion that
 * varies per component is what makes a page feel assembled rather than
 * designed — these primitives exist so every reveal on the site moves the
 * same way.
 *
 * Every one of them checks prefers-reduced-motion and renders the finished
 * state immediately when it is set.
 */

/* A long, decelerating curve. Things arrive quickly and settle slowly, which
   reads as weight rather than speed. */
export const EASE = [0.16, 1, 0.3, 1]
export const EASE_SOFT = [0.33, 1, 0.68, 1]

export const DURATION = { fast: 0.45, base: 0.7, slow: 1.1 }
const STAGGER = 0.075

/* ------------------------------------------------------------------ *
 * Reveal — the workhorse
 * ------------------------------------------------------------------ */

/**
 * Fades and lifts its children into place once, when scrolled into view.
 * Wrap several in a <Stagger> to have them arrive in sequence.
 */
export const Reveal = ({
  children,
  as: Tag = "div",
  delay = 0,
  y = 22,
  className = "",
  amount = 0.3,
  once = true,
  ...rest
}) => {
  const reduced = useReducedMotion()
  const MotionTag = motion[Tag] || motion.div

  return (
    <MotionTag
      className={className}
      initial={reduced ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: DURATION.base, ease: EASE, delay }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/** Parent that hands its children a shared stagger. Children use <Item>. */
export const Stagger = ({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  amount = 0.25,
  gap = STAGGER,
  ...rest
}) => {
  const MotionTag = motion[Tag] || motion.div
  return (
    <MotionTag
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

export const Item = ({ children, as: Tag = "div", className = "", y = 18, ...rest }) => {
  const reduced = useReducedMotion()
  const MotionTag = motion[Tag] || motion.div
  return (
    <MotionTag
      className={className}
      variants={{
        hidden: reduced ? {} : { opacity: 0, y },
        visible: { opacity: 1, y: 0, transition: { duration: DURATION.base, ease: EASE } },
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}

/* ------------------------------------------------------------------ *
 * Type
 * ------------------------------------------------------------------ */

/**
 * Reveals a heading a line at a time, each line rising out of a mask.
 *
 * Pass an array of strings — one per visual line — because a mask has to know
 * where the lines break, and letting the browser wrap would clip mid-word.
 */
export const RevealLines = ({
  lines,
  className = "",
  lineClassName = "",
  delay = 0,
  as: Tag = "h2",
  stagger = 0.09,
  inView = true,
}) => {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.4 })
  const play = inView ? seen : true

  return (
    <Tag ref={ref} className={className}>
      {lines.map((line, i) => (
        <span key={i} className="block overflow-hidden pb-[0.09em]">
          <motion.span
            className={`block ${lineClassName}`}
            initial={reduced ? false : { y: "115%" }}
            animate={play || reduced ? { y: "0%" } : { y: "115%" }}
            transition={{ duration: 1, ease: EASE, delay: delay + i * stagger }}
          >
            {line}
          </motion.span>
        </span>
      ))}
    </Tag>
  )
}

/* ------------------------------------------------------------------ *
 * Images
 * ------------------------------------------------------------------ */

/**
 * A photograph that uncovers itself: the frame wipes open from the bottom
 * while the image inside settles back from a slight zoom. The two move at
 * different rates, which is what stops it looking like a plain fade.
 */
export const ImageReveal = ({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  delay = 0,
  children,
  eager = false,
}) => {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.2 })
  const play = eager || seen

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <motion.div
        className="h-full w-full"
        initial={reduced ? false : { clipPath: "inset(0 0 100% 0)" }}
        animate={play ? { clipPath: "inset(0 0 0% 0)" } : {}}
        transition={{ duration: 1.2, ease: EASE, delay }}
      >
        <motion.img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          className={`h-full w-full object-cover ${imgClassName}`}
          initial={reduced ? false : { scale: 1.14 }}
          animate={play ? { scale: 1 } : {}}
          transition={{ duration: 1.6, ease: EASE, delay }}
        />
      </motion.div>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ *
 * Scroll
 * ------------------------------------------------------------------ */

/** Moves its children against the scroll, at a fraction of the page's speed. */
export const Parallax = ({ children, distance = 70, className = "" }) => {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  })
  const y = useTransform(scrollYProgress, [0, 1], [distance, -distance])
  const smooth = useSpring(y, { stiffness: 80, damping: 24, mass: 0.4 })

  return (
    <div ref={ref} className={className}>
      <motion.div style={reduced ? undefined : { y: smooth }}>{children}</motion.div>
    </div>
  )
}

/** A hairline that fills across the top of the page as you read down it. */
export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-brass"
    />
  )
}

/* ------------------------------------------------------------------ *
 * Interaction
 * ------------------------------------------------------------------ */

/**
 * Pulls gently toward the pointer while it is over the element, then springs
 * back. Used only on the single most important action on a screen — it stops
 * being a signal if everything does it.
 */
export const Magnetic = ({ children, strength = 0.22, className = "" }) => {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 220, damping: 18, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 220, damping: 18, mass: 0.35 })

  const onMove = (e) => {
    if (reduced || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * strength)
    y.set((e.clientY - (r.top + r.height / 2)) * strength)
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={reduced ? undefined : { x: sx, y: sy }}
      className={`inline-flex ${className}`}
    >
      {children}
    </motion.div>
  )
}

/* ------------------------------------------------------------------ *
 * Numbers
 * ------------------------------------------------------------------ */

/** Counts up to a number once it is on screen. */
export const CountUp = ({ to, duration = 1.6, prefix = "", suffix = "", className = "" }) => {
  const reduced = useReducedMotion()
  const ref = useRef(null)
  const seen = useInView(ref, { once: true, amount: 0.6 })
  const [value, setValue] = useState(reduced ? to : 0)

  useEffect(() => {
    if (!seen || reduced) return
    let raf
    const start = performance.now()
    const tick = (now) => {
      const p = Math.min(1, (now - start) / (duration * 1000))
      // easeOutExpo — fast, then a long settle onto the final figure.
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setValue(Math.round(to * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [seen, to, duration, reduced])

  return (
    <span ref={ref} className={className}>
      {prefix}
      {value.toLocaleString("en-IN")}
      {suffix}
    </span>
  )
}

/* ------------------------------------------------------------------ *
 * Marquee
 * ------------------------------------------------------------------ */

/**
 * A strip that drifts on its own and speeds up with the page as you scroll —
 * so the band answers to what you are doing rather than looping obliviously.
 * Direction flips when you scroll back up.
 */
export const useScrollVelocityFactor = () => {
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { stiffness: 400, damping: 50 })
  const [factor, setFactor] = useState(1)

  useMotionValueEvent(smooth, "change", (v) => {
    // Base drift of 1, plus up to ~4x from scroll speed, sign following it.
    const boost = Math.min(4, Math.abs(v) / 700)
    setFactor((v < -20 ? -1 : 1) * (1 + boost))
  })

  return factor
}

/**
 * The inventory strip. It drifts on its own, speeds up with the page as you
 * scroll, and reverses when you scroll back up — so the band answers to what
 * you are doing instead of looping obliviously past you.
 *
 * `children` is rendered twice; the track wraps at half its own width, which
 * is what makes the loop seamless.
 */
export const Marquee = ({ children, speed = 42, className = "", gap = "1rem" }) => {
  const reduced = useReducedMotion()
  const factor = useScrollVelocityFactor()
  const trackRef = useRef(null)
  const x = useMotionValue(0)
  const halfWidth = useRef(0)

  useEffect(() => {
    const measure = () => {
      if (trackRef.current) halfWidth.current = trackRef.current.scrollWidth / 2
    }
    measure()
    window.addEventListener("resize", measure)
    return () => window.removeEventListener("resize", measure)
  }, [children])

  useAnimationFrame((_, delta) => {
    if (reduced || !halfWidth.current) return
    const move = (speed * factor * delta) / 1000
    x.set(wrap(-halfWidth.current, 0, x.get() - move))
  })

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        ref={trackRef}
        className="flex w-max"
        // The gap lives on the track so both copies are spaced identically —
        // any difference between them shows up as a stutter at the wrap point.
        style={reduced ? { gap } : { x, gap }}
      >
        <div className="flex shrink-0" style={{ gap }}>
          {children}
        </div>
        {/* Second copy exists only so the loop closes seamlessly. */}
        <div className="flex shrink-0" style={{ gap }} aria-hidden>
          {children}
        </div>
      </motion.div>
    </div>
  )
}
