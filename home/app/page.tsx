import DotGrid from "./components/DotGrid";
import type { CSSProperties } from "react";

const navLinkStyle: CSSProperties = {
  color: "#e6eef6",
  letterSpacing: "-0.1rem",
};

const accentLinkStyle: CSSProperties = {
  color: "#c084fc",
};

export default function Home() {
  const year = new Date().getFullYear();

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        background: "#071021",
        color: "#e6eef6",
        fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
        letterSpacing: "-0.05rem",
      }}
    >
      <div className="fixed inset-0 w-full h-full z-0">
        <DotGrid
          dotSize={8}
          gap={12}
          baseColor="#ffffff"
          activeColor="#a855f7"
          proximity={140}
          speedTrigger={30}
          shockRadius={220}
          shockStrength={2.5}
          resistance={200}
          returnDuration={0.5}
          opacity={0.025}
          throttleMs={16}
          maxDots={4000}
        />
      </div>

      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center relative z-10">
        <header className="w-full text-center my-8">
          <h1
            className="text-3xl inline-flex items-center justify-center"
            style={{ fontWeight: 700, letterSpacing: "-0.15rem" }}
          >
            johostudio
          </h1>

          <div className="mt-2 flex gap-6 justify-center opacity-70">
            <a href="/gallery.html" className="text-sm" style={navLinkStyle}>
              GALLERY
            </a>
            <a href="/about.html" className="text-sm" style={navLinkStyle}>
              ABOUT
            </a>
            <a
              href="/projects/vancouver.html"
              className="text-sm"
              style={navLinkStyle}
            >
              VANCOUVER
            </a>
            <a href="/hoshii.html" className="text-sm" style={navLinkStyle}>
              hsoh
            </a>
          </div>
        </header>

        <main className="w-full flex flex-col items-center">
          <section className="w-full flex flex-col items-center justify-center py-20">
            <ul
              className="flex flex-col items-center gap-6"
              style={{ letterSpacing: "-0.1rem" }}
            >
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://www.youtube.com/channel/UCm9AkiBCwALnpblVcV7E65g"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  youtube
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://www.tiktok.com/@lifeofjoho"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  tiktok
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://instagram.com/96joho"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ig: personal
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://instagram.com/hosh.autumn"
                >
                  ig: photography
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://instagram.com/joho.studio"
                >
                  ig: creative archive
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://ko-fi.com/johostudio"
                >
                  ko-fi / tba shop
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://www.buymeacoffee.com/johostudio"
                >
                  buy me a matcha tea
                </a>
              </li>
              <li>
                <a
                  className="text-lg"
                  style={accentLinkStyle}
                  href="https://linktr.ee/dusktodvwn"
                >
                  &quot;hoshii.wav&quot; / &apos;26 q1
                </a>
              </li>
            </ul>
          </section>

          <section className="w-full text-center mb-16">
            <h2 className="text-2xl mb-4">find me :</h2>
            <p>
              <a style={accentLinkStyle} href="mailto:96joho@gmail.com">
                96joho@gmail.com
              </a>
            </p>
          </section>
        </main>

        <footer className="text-center mt-6 w-full mb-10">
          <small>
            &copy; {year} joho&apos;s studio &#26124;&#26959;
          </small>
          <div className="text-sm mt-2">ALL RIGHTS RESERVED. &reg;</div>
        </footer>
      </div>
    </div>
  );
}
