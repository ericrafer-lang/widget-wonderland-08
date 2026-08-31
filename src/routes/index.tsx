import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { UploadPanel } from "@/components/docusense/UploadPanel";
import { EvidencePanel } from "@/components/docusense/EvidencePanel";
import { ReaderPanel } from "@/components/docusense/ReaderPanel";
import { Dashboard } from "@/components/docusense/Dashboard";
import { SCANS, type LayerKey, type Scan } from "@/data/scans";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "DocuSense — Explainable AI-Content Detection for Academic Work" },
      {
        name: "description",
        content:
          "DocuSense scores academic documents across four transparent layers — stylometric, semantic, metadata and classifier — and shows exactly where the signals sit.",
      },
      {
        property: "og:title",
        content: "DocuSense — Explainable AI-Content Detection",
      },
      {
        property: "og:description",
        content:
          "A multi-layer, explainable AI-generated content detector for academic documents. Evidence for educators, never an automatic verdict.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [scan, setScan] = useState<Scan>(SCANS[0]!);
  const [activeLayer, setActiveLayer] = useState<LayerKey | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [revealKey, setRevealKey] = useState("ds-1");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);

  const select = (next: Scan) => {
    setScan(next);
    setActiveLayer(null);
    setRevealKey(`${next.id}-${Date.now()}`);
    document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const onFile = (name: string) => {
    if (analyzing) return;
    setFileName(name);
    setAnalyzing(true);
    setProgress(0);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (timer.current) clearInterval(timer.current);
          setAnalyzing(false);
          const next = SCANS[Math.floor(Math.random() * SCANS.length)]!;
          select({ ...next, title: name.replace(/\.[^.]+$/, ""), draft: "uploaded" });
          return 100;
        }
        return p + 4;
      });
    }, 70);
  };

  return (
    <main className="min-h-screen bg-tabledeep font-sans text-paper/80 antialiased">
      {/* HERO / UPLOAD */}
      <section className="grain relative overflow-hidden bg-table">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_15%_-10%,color-mix(in_oklab,var(--signal)_22%,transparent),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_95%_110%,color-mix(in_oklab,var(--signal)_12%,transparent),transparent_60%)]" />
        <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:px-10 lg:py-20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-[8px] bg-signal/15 font-mono text-[13px] font-medium text-signal ring-1 ring-signal/40">
                D
              </span>
              <span className="font-display text-lg text-paper">DocuSense</span>
              <span className="ml-1 rounded-full bg-paper/8 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-paper/50 ring-1 ring-paper/10">
                integrity lab
              </span>
            </div>
            <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.16em] text-paper/45 sm:flex">
              <a href="#result" className="transition-colors hover:text-signal">Method</a>
              <a href="#activity" className="transition-colors hover:text-signal">Library</a>
              <a href="#guidance" className="transition-colors hover:text-signal">Guidance</a>
            </nav>
          </div>

          <div className="mt-14 grid gap-12 lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-signal">
                Academic integrity · decision support
              </p>
              <h1 className="mt-5 max-w-[18ch] font-display text-[clamp(2.6rem,6vw,5rem)] font-medium leading-[0.96] tracking-[-0.02em] text-balance text-paper">
                Read a document the way evidence is read — layer by layer.
              </h1>
              <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-pretty text-paper/65">
                DocuSense scores a paper across four transparent layers and shows you
                exactly where the signals sit. It is a tool for judgement, not a
                verdict — the decision stays with you.
              </p>
            </div>

            <div className="lg:col-span-5">
              <UploadPanel
                onFile={onFile}
                analyzing={analyzing}
                progress={progress}
                fileName={fileName}
              />
            </div>
          </div>
        </div>
      </section>

      {/* RESULT */}
      <section id="result" className="scroll-mt-6 bg-tabledeep">
        <div className="mx-auto max-w-6xl px-6 py-16 lg:px-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/40">
                Scan result
              </p>
              <h2 className="mt-2 max-w-[30ch] font-display text-3xl font-medium leading-tight tracking-[-0.01em] text-balance text-paper">
                Evidence, layer by layer
              </h2>
            </div>
            <div className="rounded-[10px] bg-paper/5 px-3 py-2 ring-1 ring-paper/10">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper/40">
                Paper
              </p>
              <p className="mt-0.5 text-sm text-paper/80">
                {scan.title} · {scan.words.toLocaleString()} words
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <ReaderPanel scan={scan} activeLayer={activeLayer} />
            </div>
            <div className="lg:col-span-7">
              <EvidencePanel
                scan={scan}
                activeLayer={activeLayer}
                onLayer={setActiveLayer}
                revealKey={revealKey}
              />
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD */}
      <section id="activity" className="scroll-mt-6 border-t border-paper/8 bg-table">
        <Dashboard selected={scan} onSelect={select} />
      </section>

      <footer id="guidance" className="bg-tabledeep">
        <div className="mx-auto max-w-6xl px-6 py-10 lg:px-10">
          <div className="border-t border-paper/10 pt-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <span className="font-display text-base text-paper/70">
                DocuSense — a forensic reading instrument
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-paper/30">
                Ref. DS-2025 · build 04.19
              </span>
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[10px] uppercase tracking-[0.16em] text-paper/30">
              <span>Method</span>
              <span>Calibration</span>
              <span>Privacy</span>
              <span>For educators</span>
              <span>Changelog</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
