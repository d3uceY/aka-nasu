/* Aka Nasu — award-style landing page.
   Docusaurus single page (docs + blog plugins are disabled). The page carries
   its own floating header and footer; the stock Navbar/Footer are overridden
   to null in src/theme/ so this is the entire site. */

import { useEffect, useRef, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import useBaseUrl from '@docusaurus/useBaseUrl'
import {
  BRAND_APPLE,
  BRAND_DEBIAN,
  BRAND_LINUX,
  BRAND_WINDOWS,
} from '../brands'

import '@fontsource-variable/fraunces/opsz.css'
import '@fontsource-variable/fraunces/opsz-italic.css'
import '@fontsource-variable/instrument-sans'

gsap.registerPlugin(useGSAP, ScrollTrigger)

const ORG = 'd3uceY'
const PROJECT = 'aka-nasu'
const GITHUB_URL = `https://github.com/${ORG}/${PROJECT}`
const RELEASES_URL = `${GITHUB_URL}/releases`
const RELEASE_BASE = `${RELEASES_URL}/latest/download/`

/* Direction contract — survives into the built HTML so the finished page can
   be audited against the decision that produced it. */
const SEED = `<!--
Aka Nasu landing — direction contract
THESIS: the app is one ripe tomato on gallery paper; this page refuses the generic SaaS hero-and-cards landing and lets the tomato carry the whole offer.
OWN-WORLD: warm paper #fcfbf9, warm ink #2b211b, one tomato accent #e8442e; Fraunces variable at opsz 144 for the wordmark and section heads, Instrument Sans for body; hairline rules, soft warm shadows, custom expo/spring easing.
STORY: a visitor learns this is a free, open-source desktop focus timer, sees it running on paper, and downloads the right build for their OS in one click.
FIRST VIEWPORT: centered monumental "Aka Nasu / Nasu" wordmark with a floating tomato above, the トマトの時計 tagline, a one-line pitch, and a magnetic OS-aware download button beside a quiet link to all platforms.
FORM: the established app world extended to a Persuade surface.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
-->`

type OsId = 'windows' | 'macos' | 'linux' | null
type Arch = 'arm64' | 'amd64'

function detectOs(): OsId {
  if (typeof navigator === 'undefined') return null
  const ua = navigator.userAgent
  if (/windows/i.test(ua)) return 'windows'
  if (/macintosh|mac os x/i.test(ua)) return 'macos'
  if (/linux|ubuntu|debian|fedora|arch/i.test(ua)) return 'linux'
  return null
}

function detectArch(): Arch {
  if (typeof navigator === 'undefined') return 'arm64'
  const ua = navigator.userAgent
  const uad = (navigator as Navigator & { userAgentData?: { architecture?: string } }).userAgentData
  if (/arm|aarch64/i.test(ua) || uad?.architecture === 'arm') return 'arm64'
  return 'amd64'
}

/* ------------------------------------------------------------------ marks */

function TomatoMark({ className = '', size = 30 }: { className?: string; size?: number }): ReactElement {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="var(--leaf)">
        <ellipse cx="20" cy="10.4" rx="2.6" ry="5.4" transform="rotate(-42 20 10.4)" />
        <ellipse cx="20" cy="10.2" rx="2.5" ry="5.7" transform="rotate(-12 20 10.2)" />
        <ellipse cx="20" cy="10" rx="2.3" ry="5.9" transform="rotate(12 20 10)" />
        <ellipse cx="20" cy="10.4" rx="2.6" ry="5.4" transform="rotate(42 20 10.4)" />
      </g>
      <rect x="18.6" y="4.4" width="2.8" height="4.6" rx="1.4" fill="var(--leaf-deep)" />
      <path
        d="M20 35.6C9.5 35.6 4.4 28.6 4.4 20.3 4.4 13.7 7.9 10 11.6 10c2.7 0 5.2 1.3 8.4 1.3s5.7-1.3 8.4-1.3C32.1 10 35.6 13.7 35.6 20.3c0 8.3-5.1 15.3-15.6 15.3z"
        fill="var(--tomato)"
      />
      <ellipse
        cx="13.2"
        cy="17.8"
        rx="3.4"
        ry="4.8"
        fill="rgba(255,255,255,0.32)"
        transform="rotate(-24 13.2 17.8)"
      />
    </svg>
  )
}

function BrandIcon({ path, size = 18 }: { path: string; size?: number }): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <path d={path} fill="currentColor" />
    </svg>
  )
}

function ArrowGlyph(): ReactElement {
  return (
    <svg
      className="lp-dl__arrow"
      viewBox="0 0 20 20"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 10h11M11 6l4 4-4 4" />
    </svg>
  )
}

/* -------------------------------------------------------------- glyphs */

function DialGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <circle cx="16" cy="16" r="9" />
      <path d="M16 4.5v2.4M27.5 16h-2.4M16 27.5v-2.4M4.5 16h2.4" />
      <path d="M16 16l4.2-4.2" />
      <circle cx="16" cy="16" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  )
}

function ClockGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="16" cy="16.5" r="8.5" />
      <path d="M16 12v4.5l3 1.8" />
      <path d="M14.5 5.5h3" />
    </svg>
  )
}

function CheckGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 8h11M5 15h8M5 22h11" />
      <path d="m19 20 2.2 2.2L26 16.5" />
    </svg>
  )
}

function MiniGlyph(): ReactElement {
  return (
    <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="6.5" width="22" height="17" rx="2.5" />
      <path d="M5 11h22" />
      <circle cx="16" cy="16.5" r="3.2" fill="currentColor" stroke="none" />
    </svg>
  )
}

/* ------------------------------------------------------------ content */

interface PlatformGroup {
  group: string
  icon: { path: string }
  rows: { label: string; file: string; note: string }[]
}

const PLATFORMS: PlatformGroup[] = [
  {
    group: 'Windows',
    icon: { path: BRAND_WINDOWS },
    rows: [
      { label: 'Installer', file: 'aka-nasu-windows-amd64-installer.exe', note: 'SmartScreen may warn on first run' },
      { label: 'Portable', file: 'aka-nasu-windows-amd64.exe', note: 'No install needed, just run it' },
    ],
  },
  {
    group: 'macOS',
    icon: { path: BRAND_APPLE },
    rows: [
      { label: 'Apple Silicon', file: 'aka-nasu-macos-arm64.dmg', note: 'M-series and newer' },
      { label: 'Intel', file: 'aka-nasu-macos-amd64.dmg', note: 'Older Macs' },
    ],
  },
  {
    group: 'Linux',
    icon: { path: BRAND_LINUX },
    rows: [
      { label: 'x86-64 binary', file: 'aka-nasu-linux-amd64', note: 'chmod +x, then run' },
      { label: '.deb package', file: 'aka-nasu-linux-amd64.deb', note: 'Debian and Ubuntu' },
    ],
  },
]

interface Feature {
  title: ReactNode
  body: string
  glyph: ReactElement
}

const FEATURES: Feature[] = [
  {
    title: <>Spin the tomato to set your focus</>,
    body: 'The timer is the dial. Drag the 3D tomato, watch the hands of the clock follow, then get to work.',
    glyph: <DialGlyph />,
  },
  {
    title: <>A timer that reads like a wall clock</>,
    body: 'One giant serif number counts down in fixed slots that never jitter while it ticks.',
    glyph: <ClockGlyph />,
  },
  {
    title: <>A checklist that harvests</>,
    body: 'Add tasks, pin the one you are on, keep notes under it. Finish a round and tick it off for good.',
    glyph: <CheckGlyph />,
  },
  {
    title: <>Mini mode, floating over your work</>,
    body: 'Shrink the whole timer to a tiny always-on-top window with transparent corners and keep it beside your editor.',
    glyph: <MiniGlyph />,
  },
]

/* ---------------------------------------------------------- interaction */

function Magnetic({ children, className = '' }: { children: ReactNode; className?: string }): ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el) return
    const xTo = gsap.quickTo(el, 'x', { duration: 0.45, ease: 'power3.out' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.45, ease: 'power3.out' })
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      xTo((e.clientX - (r.left + r.width / 2)) * 0.22)
      yTo((e.clientY - (r.top + r.height / 2)) * 0.32)
    }
    const leave = () => {
      xTo(0)
      yTo(0)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (
    <div ref={ref} className={`lp-mag ${className}`}>
      {children}
    </div>
  )
}

/* ----------------------------------------------------------------- page */

export default function Home(): ReactElement {
  const rootRef = useRef<HTMLDivElement>(null)
  const [os, setOs] = useState<OsId>(null)
  const [arch, setArch] = useState<Arch>('arm64')
  const reducedRef = useRef(false)
  const homeShot = useBaseUrl('/screenshots/home/home.png')

  useEffect(() => {
    reducedRef.current =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setOs(detectOs())
    setArch(detectArch())
  }, [])

  /* Lenis smooth scroll + in-page anchor handling */
  useEffect(() => {
    if (reducedRef.current) return
    const lenis = new Lenis({ lerp: 0.09 })
    lenis.on('scroll', ScrollTrigger.update)
    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      const link = target?.closest('a[href^="#"]') as HTMLAnchorElement | null
      if (!link) return
      const hash = link.getAttribute('href')
      if (!hash || hash === '#') return
      const el = document.getElementById(hash.slice(1))
      if (!el) return
      e.preventDefault()
      lenis.scrollTo(el, { duration: 1.2 })
    }
    document.addEventListener('click', onClick)
    return () => {
      document.removeEventListener('click', onClick)
      gsap.ticker.remove(raf)
      lenis.destroy()
    }
  }, [])

  /* Choreography + scroll work */
  useGSAP(
    () => {
      const root = rootRef.current
      if (!root || reducedRef.current) return

      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from('.lp-header', { y: -26, autoAlpha: 0, duration: 0.7 }, 0.05)
        .from('.lp-hero__mark', { scale: 0, rotation: -110, autoAlpha: 0, duration: 0.9, ease: 'back.out(1.4)' }, 0.2)
        .from('.lp-line__inner', { yPercent: 112, duration: 1.15, stagger: 0.14 }, 0.35)
        .from('.lp-hero__tag', { y: 22, autoAlpha: 0, duration: 0.7 }, 1.0)
        .from('.lp-hero__pitch', { y: 20, autoAlpha: 0, duration: 0.7 }, 1.1)
        .from('.lp-hero__cta-row > *', { y: 22, autoAlpha: 0, duration: 0.7, stagger: 0.1 }, 1.2)
        .from('.lp-hero__note', { autoAlpha: 0, duration: 0.6 }, 1.45)
        .from('.lp-hero__cue', { autoAlpha: 0, duration: 0.6 }, 1.5)

      gsap.to('.lp-progress__bar', {
        scaleX: 1,
        ease: 'none',
        scrollTrigger: { start: 0, end: 'max', scrub: 0.3 },
      })

      ScrollTrigger.create({
        start: 40,
        end: 'max',
        onToggle: (self) =>
          root.querySelector('.lp-header')?.classList.toggle('is-solid', self.isActive),
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
        gsap.fromTo(
          el,
          { y: 46, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%' } },
        )
      })

      gsap.utils.toArray<HTMLElement>('[data-reveal-group]').forEach((group) => {
        const items = group.querySelectorAll('[data-reveal-item]')
        gsap.fromTo(
          items,
          { y: 34, autoAlpha: 0 },
          {
            y: 0,
            autoAlpha: 1,
            duration: 0.9,
            ease: 'expo.out',
            stagger: 0.08,
            scrollTrigger: { trigger: group, start: 'top 84%' },
          },
        )
      })

      const media = root.querySelector('.lp-showcase__media')
      const img = root.querySelector('.lp-showcase__img')
      if (media && img) {
        gsap.fromTo(
          img,
          { yPercent: -8 },
          { yPercent: 0, ease: 'none', scrollTrigger: { trigger: media, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
        )
      }

      gsap.to('.lp-hero__ghost', {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: { trigger: '.lp-hero', start: 'top top', end: 'bottom top', scrub: true },
      })

      return () => {
        ScrollTrigger.getAll().forEach((t) => t.kill())
        tl.kill()
      }
    },
    { scope: rootRef },
  )

  /* Re-measure scroll positions once images and fonts have settled */
  useEffect(() => {
    const t = window.setTimeout(() => ScrollTrigger.refresh(), 400)
    const onLoad = () => ScrollTrigger.refresh()
    window.addEventListener('load', onLoad)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  const primaryAsset =
    os === 'windows'
      ? 'aka-nasu-windows-amd64-installer.exe'
      : os === 'macos'
        ? arch === 'arm64'
          ? 'aka-nasu-macos-arm64.dmg'
          : 'aka-nasu-macos-amd64.dmg'
        : os === 'linux'
          ? 'aka-nasu-linux-amd64.deb'
          : null
  const primaryHref = primaryAsset ? `${RELEASE_BASE}${primaryAsset}` : RELEASES_URL
  const primaryLabel =
    os === 'windows'
      ? 'Download for Windows'
      : os === 'macos'
        ? 'Download for macOS'
        : os === 'linux'
          ? 'Download for Linux'
          : 'Download Aka Nasu'
  const osName = os === 'windows' ? 'Windows' : os === 'macos' ? 'macOS' : os === 'linux' ? 'Linux' : null
  const detectedLabel =
    os === 'windows' ? 'Windows detected' : os === 'macos' ? 'macOS detected' : os === 'linux' ? 'Linux detected' : ''

  return (
    <div className="lp" ref={rootRef}>
      <div aria-hidden="true" className="lp-seed" dangerouslySetInnerHTML={{ __html: SEED }} />

      <div className="lp-progress" aria-hidden="true">
        <div className="lp-progress__bar" />
      </div>

      <header className="lp-header">
        <a className="lp-header__brand" href="#top" aria-label="Back to the top of the page">
          <TomatoMark className="tomato-mark" size={30} />
          <span>
            Aka <em>Nasu</em>
          </span>
        </a>
        <nav className="lp-header__actions" aria-label="Primary">
          <a className="lp-header__link" href="#download">
            Platforms
          </a>
          <a className="lp-header__link" href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a className="lp-pill" href={primaryHref}>
            {osName ? (
              <span className="lp-pill__label">
                Download<span className="lp-pill__os"> for {osName}</span>
              </span>
            ) : (
              primaryLabel
            )}
          </a>
        </nav>
      </header>

      <main id="top">
        <section className="lp-hero" aria-label="Aka Nasu, the tomato clock">
          <div className="lp-hero__kiss" aria-hidden="true" />
          <TomatoMark className="lp-hero__ghost" size={720} />
          <div className="lp-hero__mark">
            <TomatoMark size={76} />
          </div>
          <h1 className="lp-hero__title">
            <span className="lp-line">
              <span className="lp-line__inner">Aka</span>
            </span>
            <span className="lp-line">
              <span className="lp-line__inner">
                <em>Nasu</em>
              </span>
            </span>
          </h1>
          <p className="lp-hero__tag">トマトの時計</p>
          <p className="lp-hero__pitch">
            A pomodoro focus timer for the desktop, built around one tomato. Spin it to set your
            focus, then work through your list.
          </p>
          <div className="lp-hero__cta-row">
            <Magnetic>
              <a className="lp-btn lp-btn--primary" href={primaryHref}>
                {primaryLabel}
              </a>
            </Magnetic>
            <Magnetic>
              <a className="lp-btn lp-btn--ghost" href="#download">
                See all platforms
              </a>
            </Magnetic>
          </div>
          <p className="lp-hero__note">
            {detectedLabel ? `${detectedLabel} · ` : ''}Free and open source, for Windows, macOS, and
            Linux.
          </p>
          <div className="lp-hero__cue">Scroll</div>
        </section>

        <section className="lp-section lp-showcase" aria-label="The app">
          <div className="lp-gutter">
            <div className="lp-showcase__frame" data-reveal>
              <div className="lp-showcase__bar">
                <span className="lp-showcase__dots" aria-hidden="true">
                  <span className="lp-showcase__dot" />
                  <span className="lp-showcase__dot" />
                  <span className="lp-showcase__dot" />
                </span>
                <span className="lp-showcase__title">Aka Nasu · トマトの時計</span>
              </div>
              <div className="lp-showcase__media">
                <img
                  className="lp-showcase__img"
                  src={homeShot}
                  alt="Aka Nasu home screen: a big serif 50:00 timer, a 3D tomato dial, and the day's checklist"
                  width="1440"
                  height="900"
                />
              </div>
            </div>
            <p className="lp-showcase__cap">
              <span>The whole app is one tomato.</span>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer">
                View the source on GitHub
              </a>
            </p>
          </div>
        </section>

        <section className="lp-section lp-features" aria-label="What it does">
          <div className="lp-gutter">
            <div className="lp-section__head" data-reveal>
              <h2 className="lp-section__title">
                The whole interface is a <em>tomato</em>
              </h2>
              <p className="lp-section__sub">
                A 3D dial sets your focus. A wall-clock timer counts it down. A checklist harvests
                the day. A mini window keeps it close.
              </p>
            </div>
            <div className="lp-features__grid" data-reveal-group>
              {FEATURES.map((f) => (
                <article className="lp-feature" data-reveal-item key={f.body}>
                  <div className="lp-feature__glyph">{f.glyph}</div>
                  <h3 className="lp-feature__title">{f.title}</h3>
                  <p className="lp-feature__body">{f.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="lp-section lp-download" id="download" aria-label="Download">
          <div className="lp-gutter">
            <div className="lp-section__head" data-reveal>
              <h2 className="lp-section__title">
                Grab a build for <em>your</em> machine
              </h2>
              <p className="lp-section__sub">
                Every link points at the newest release, and each release ships a SHA256SUMS.txt so
                you can verify what you download.
              </p>
            </div>
            <div className="lp-download__grid" data-reveal-group>
              {PLATFORMS.map((p) => (
                <div className="lp-os" data-reveal-item key={p.group}>
                  <h3 className="lp-os__name">
                    <BrandIcon path={p.icon.path} size={20} />
                    {p.group}
                  </h3>
                  <div className="lp-os__rows">
                    {p.rows.map((r) => (
                      <a className="lp-dl" key={r.file} href={`${RELEASE_BASE}${r.file}`}>
                        <span>
                          <span className="lp-dl__label">{r.label}</span>
                          <span className="lp-dl__note">{r.note}</span>
                        </span>
                        <ArrowGlyph />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <p className="lp-download__foot" data-reveal>
              <a href={RELEASES_URL} target="_blank" rel="noreferrer">
                All releases on GitHub
              </a>
              <span>Checksums and changelogs live with each release.</span>
            </p>
            <div className="lp-run" data-reveal>
              <p className="lp-run__title">
                <TomatoMark className="tomato-mark" size={20} /> First run: your OS may warn you
              </p>
              <p>
                <strong>Windows:</strong> SmartScreen, then More info and Run anyway. Or right-click
                the file, Properties, Unblock.
              </p>
              <p>
                <strong>macOS:</strong> Right-click the .dmg, Open, Open again. Or System Settings,
                Privacy &amp; Security, Open Anyway.
              </p>
              <p>
                <strong>Linux:</strong> chmod +x aka-nasu-linux-amd64, then run it.
              </p>
            </div>
          </div>
        </section>

        <section className="lp-section lp-story" aria-label="Why I built this">
          <div className="lp-gutter">
            <p className="lp-story__lead" data-reveal>
              Twenty-five minutes on, five off is the standard thing, and it does the opposite for
              me: a break right as I get deep just breaks the flow, and I have to climb back from
              zero every time.
            </p>
            <p className="lp-story__body" data-reveal>
              So I run it at <strong>50 minutes on, 10 off</strong>, with a longer break after four
              rounds. Long enough to actually get into something, and a break long enough to stand
              up. Spin the tomato, set your own times. <strong>It's your clock, not mine.</strong>
            </p>
          </div>
        </section>

        <footer className="lp-footer lp-gutter">
          <span className="lp-footer__brand">
            <TomatoMark className="tomato-mark" size={26} />
            Aka <em>Nasu</em> · トマトの時計
          </span>
          <nav className="lp-footer__links" aria-label="Footer">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href={RELEASES_URL} target="_blank" rel="noreferrer">
              Releases
            </a>
            <a href="#top">Back to top</a>
          </nav>
          <p className="lp-footer__note">
            Free and open source, MIT licensed. Built for people who need fifty minutes to get in
            the zone.
          </p>
        </footer>
      </main>
    </div>
  )
}
