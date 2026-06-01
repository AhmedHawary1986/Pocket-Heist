// this page should be used only as a splash page to decide where a user should be navigated to
// when logged in --> to /heists
// when not logged in --> to /login

import { Clock8 } from "lucide-react"
import Link from "next/link"

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Share+Tech+Mono&display=swap');

        .splash-bg {
          background:
            radial-gradient(ellipse 80% 55% at 50% 35%, rgba(194,122,255,0.11) 0%, transparent 70%),
            radial-gradient(ellipse 50% 35% at 50% 65%, rgba(251,100,182,0.06) 0%, transparent 60%),
            #030712;
          position: relative;
          overflow: hidden;
        }
        .splash-bg::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(194,122,255,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(194,122,255,0.025) 1px, transparent 1px);
          background-size: 56px 56px;
          pointer-events: none;
        }
        .splash-bg::after {
          content: '';
          position: absolute;
          inset: 0;
          background: repeating-linear-gradient(
            0deg, transparent, transparent 3px,
            rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px
          );
          pointer-events: none;
          z-index: 1;
        }
        .splash-inner {
          position: relative;
          z-index: 2;
        }

        .op-label {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.62rem;
          letter-spacing: 0.28em;
          color: rgba(251,100,182,0.65);
          text-transform: uppercase;
          animation: fadeUp 0.55s ease both;
        }
        .op-label-bar {
          display: inline-block;
          width: 28px;
          height: 1px;
          background: rgba(251,100,182,0.45);
          vertical-align: middle;
          margin: 0 10px 1px;
        }

        .heist-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(4.5rem, 13vw, 9.5rem);
          letter-spacing: 0.03em;
          line-height: 0.88;
          color: white;
          animation: fadeUp 0.6s ease 0.12s both;
        }
        .heist-icon {
          display: inline-block;
          vertical-align: middle;
          margin-bottom: 0.12em;
          color: #C27AFF;
          filter: drop-shadow(0 0 10px rgba(194,122,255,0.55));
          animation: iconGlow 3.2s ease-in-out infinite;
        }

        .heist-tagline {
          font-family: 'Share Tech Mono', monospace;
          font-size: 1rem;
          letter-spacing: 0.22em;
          color: #C27AFF;
          animation: fadeUp 0.6s ease 0.26s both;
        }

        .accent-line {
          width: 72px;
          height: 1px;
          background: linear-gradient(to right, #C27AFF, #FB64B6);
          margin: 0 auto;
          animation: expandLine 0.65s ease 0.38s both;
        }

        .brief-box {
          position: relative;
          padding: 0 28px;
          animation: fadeUp 0.6s ease 0.48s both;
        }
        .brief-box p {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.78rem;
          line-height: 1.85;
          color: #99A1AF;
          max-width: 460px;
          text-align: center;
        }
        .corner {
          position: absolute;
          width: 18px;
          height: 18px;
          border-color: rgba(194,122,255,0.28);
          border-style: solid;
        }
        .c-tl { top: -6px; left: 0;  border-width: 1px 0 0 1px; }
        .c-tr { top: -6px; right: 0; border-width: 1px 1px 0 0; }
        .c-bl { bottom: -6px; left: 0;  border-width: 0 0 1px 1px; }
        .c-br { bottom: -6px; right: 0; border-width: 0 1px 1px 0; }

        .tag {
          display: inline;
          background: rgba(194,122,255,0.12);
          border: 1px solid rgba(194,122,255,0.2);
          border-radius: 2px;
          padding: 1px 5px;
          font-size: 0.68rem;
          color: rgba(194,122,255,0.55);
        }

        .cta-area {
          animation: fadeUp 0.6s ease 0.62s both;
        }
        .login-link {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.73rem;
          letter-spacing: 0.07em;
          color: #99A1AF;
          transition: color 0.2s;
        }
        .login-link:hover { color: #C27AFF; }
        .login-link span { color: #C27AFF; }

        .footer-stats {
          font-family: 'Share Tech Mono', monospace;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
          color: rgba(153,161,175,0.4);
          animation: fadeUp 0.6s ease 0.76s both;
          border-top: 1px solid rgba(194,122,255,0.08);
          padding-top: 20px;
          width: 100%;
          text-align: center;
        }
        .footer-stats span.val { color: rgba(194,122,255,0.5); }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandLine {
          from { width: 0; opacity: 0; }
          to   { width: 72px; opacity: 1; }
        }
        @keyframes iconGlow {
          0%,100% { filter: drop-shadow(0 0 8px rgba(194,122,255,0.45)); }
          50%      { filter: drop-shadow(0 0 22px rgba(194,122,255,0.9)); }
        }
      `}</style>

      <div className="center-content splash-bg">
        <div className="page-content splash-inner">
          <div className="flex flex-col items-center gap-7 py-20">

            <p className="op-label">
              <span className="op-label-bar" />
              Operation Briefing — Classification: Open
              <span className="op-label-bar" />
            </p>

            <h1 className="heist-title">
              P<Clock8 className="heist-icon logo" strokeWidth={2.5} size="0.82em" />cket Heist
            </h1>

            <p className="heist-tagline">STEAL THE DAY. OWN THE OFFICE.</p>

            <div className="accent-line" />

            <div className="brief-box">
              <span className="corner c-tl" />
              <span className="corner c-tr" />
              <span className="corner c-bl" />
              <span className="corner c-br" />
              <p>
                Your mission: complete workplace challenges, outmaneuver your colleagues,
                and build a reputation for office infamy. Every great heist begins with
                a single step. <span className="tag">IDENTITY UNVERIFIED</span>
              </p>
            </div>

            <div className="cta-area flex flex-col items-center gap-4 mt-2">
              <Link href="/signup" className="btn px-10 py-3 text-sm tracking-widest uppercase">
                Register
              </Link>
              <a href="/login" className="login-link">
                Already an operative? <span>Log in →</span>
              </a>
            </div>

            <div className="footer-stats">
              STATUS: <span className="val">RECRUITING</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              CLEARANCE REQUIRED: <span className="val">NONE</span>
              &nbsp;&nbsp;·&nbsp;&nbsp;
              MISSION CLOCK: <span className="val">RUNNING</span>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
