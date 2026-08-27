import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowUpRight, Clapperboard, Mail, Menu, Play, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

type Category = 'All' | 'Commercial' | 'Culture' | 'Music';

type Project = {
  id: string;
  title: string;
  client: string;
  category: Exclude<Category, 'All'>;
  year: string;
  format: string;
  description: string;
  visualClass: string;
};

const projects: Project[] = [
  {
    id: 'after-hours',
    title: 'After Hours',
    client: 'A24 × NTS',
    category: 'Culture',
    year: '2024',
    format: 'Film / 02:16',
    description: 'A restless portrait of the people keeping the city lit after the last train home.',
    visualClass: 'visual-one',
  },
  {
    id: 'soft-power',
    title: 'Soft Power',
    client: 'On Running',
    category: 'Commercial',
    year: '2024',
    format: 'Campaign / 00:45',
    description: 'A precise, kinetic cut about finding pace where everybody else sees noise.',
    visualClass: 'visual-two',
  },
  {
    id: 'glasshouse',
    title: 'Glasshouse',
    client: 'Maya Vale',
    category: 'Music',
    year: '2023',
    format: 'Music film / 03:41',
    description: 'Fragments of a relationship, assembled like evidence and scored in blue.',
    visualClass: 'visual-three',
  },
  {
    id: 'field-notes',
    title: 'Field Notes',
    client: 'Kinfolk Radio',
    category: 'Culture',
    year: '2023',
    format: 'Series / 04:08',
    description: 'A tactile dispatch from the edge of the map. Grain, breath and a little weather.',
    visualClass: 'visual-four',
  },
];

const navItems = [
  { label: 'Work', href: '#work' },
  { label: 'Method', href: '#approach' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

function useReveal() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, className: `reveal${visible ? ' visible' : ''}` };
}

function Reveal({ children, className = '' }: { children: ReactNode; className?: string }) {
  const reveal = useReveal();
  return (
    <div ref={reveal.ref} className={`${reveal.className} ${className}`}>
      {children}
    </div>
  );
}

function Header({ menuOpen, setMenuOpen }: { menuOpen: boolean; setMenuOpen: (open: boolean) => void }) {
  const scrollTo = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  return (
    <header className="topbar">
      <a className="brand-mark" href="#top" data-testid="link-brand">
        CUT <span>/</span> TO
      </a>
      <nav className={`top-nav${menuOpen ? ' open' : ''}`} aria-label="Main navigation">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            onClick={(event) => {
              event.preventDefault();
              scrollTo(item.href);
            }}
            data-testid={`link-nav-${item.label.toLowerCase()}`}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <div className="nav-availability">
        <span className="status-dot" />
        Taking on select work
      </div>
      <button
        className="menu-toggle"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
        data-testid="button-toggle-menu"
      >
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}

function ReelModal({ close }: { close: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="reel-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-top">
          <strong id="reel-title">CUT / TO — showreel 2024</strong>
          <button className="modal-close" type="button" onClick={close} aria-label="Close showreel" data-testid="button-close-reel">
            <X size={19} />
          </button>
        </div>
        <div className="modal-reel">
          <h3 className="display-title">PLAY<br />THE CUT</h3>
          <Play size={36} fill="currentColor" color="var(--acid)" style={{ position: 'absolute', zIndex: 3 }} />
        </div>
        <div className="modal-copy">
          The reel is a 01:32 pulse-check: commercials, music films and documentaries cut for rhythm before genre. Sound on, if you can.
        </div>
      </div>
    </div>
  );
}

function ProjectModal({ project, close }: { project: Project; close: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-top">
          <strong>{project.client} / {project.year}</strong>
          <button className="modal-close" type="button" onClick={close} aria-label="Close project" data-testid="button-close-project">
            <X size={19} />
          </button>
        </div>
        <div className={`modal-reel ${project.visualClass}`}>
          <h3 id="project-title" className="display-title">{project.title}</h3>
        </div>
        <div className="modal-copy">
          {project.description} <span style={{ color: 'var(--acid)' }}>{project.format}</span>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showreelOpen, setShowreelOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [category, setCategory] = useState<Category>('All');
  const [sent, setSent] = useState(false);

  const visibleProjects = useMemo(
    () => category === 'All' ? projects : projects.filter((project) => project.category === category),
    [category],
  );

  const handleContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <div className="site-shell" id="top">
      <Header menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main>
        <section className="hero section-wrap" aria-labelledby="hero-title">
          <div className="hero-grid">
            <div>
              <Reveal>
                <div className="hero-kicker">
                  <span className="line" />
                  <span className="eyebrow">Independent editor / Mumbai — London</span>
                </div>
              </Reveal>
              <Reveal className="delay-1">
                <h1 id="hero-title" className="hero-title display-title">MAKE IT<br /><em>MOVE.</em></h1>
              </Reveal>
              <Reveal className="delay-2">
                <p className="hero-copy">
                  Ayan Mehta cuts images until they have a pulse. Commercials, music films and documentaries with a point of view.
                </p>
                <div className="hero-meta">
                  <p><strong>Currently</strong>Cutting in suite 04</p>
                  <p><strong>Available</strong>Q3 / 2024</p>
                </div>
              </Reveal>
            </div>
            <Reveal className="delay-3">
              <div className="reel-stage">
                <div className="reel-frame">
                  <span className="reel-stamp">SHOWREEL / 01:32</span>
                  <span className="reel-word">EYES<br />OPEN</span>
                  <button className="play-button" type="button" onClick={() => setShowreelOpen(true)} data-testid="button-play-showreel">
                    <Play size={14} fill="currentColor" /> Play showreel
                  </button>
                </div>
                <div className="timeline-bar"><span>00:00</span><span className="timeline-track" /><span>01:32</span></div>
              </div>
            </Reveal>
          </div>
          <Reveal className="delay-4">
            <div className="scroll-cue"><span />Scroll through the edit</div>
          </Reveal>
        </section>

        <section className="manifesto" aria-labelledby="manifesto-title">
          <div className="section-wrap manifesto-grid">
            <Reveal><span className="eyebrow">01 / The feeling</span></Reveal>
            <Reveal className="delay-1">
              <h2 id="manifesto-title" className="display-title">Good editing is knowing <span>what to leave out.</span></h2>
              <p className="manifesto-note">The cut is the conversation. I listen for the half-second before a look, the breath after a line, the frame nobody else noticed.</p>
            </Reveal>
          </div>
        </section>

        <section id="work" className="work-section section-wrap" aria-labelledby="work-title">
          <Reveal>
            <div className="section-heading">
              <div>
                <span className="eyebrow">02 / Selected work</span>
                <h2 id="work-title" className="display-title">THE CUTS</h2>
              </div>
              <p>Recent work, arranged by instinct rather than chronology. Click a frame to enter.</p>
            </div>
          </Reveal>
          <Reveal className="delay-1">
            <div className="filter-row" role="group" aria-label="Filter selected work">
              {(['All', 'Commercial', 'Culture', 'Music'] as Category[]).map((filter) => (
                <button
                  key={filter}
                  className={`filter-btn${category === filter ? ' active' : ''}`}
                  type="button"
                  onClick={() => setCategory(filter)}
                  aria-pressed={category === filter}
                  data-testid={`button-filter-${filter.toLowerCase()}`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </Reveal>
          <div className="work-grid">
            {visibleProjects.map((project, index) => (
              <Reveal key={project.id} className={`delay-${Math.min(index + 1, 4)}`}>
                <article className="work-card" data-testid={`card-project-${project.id}`}>
                  <button
                    className={`work-visual ${project.visualClass}`}
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    aria-label={`View ${project.title} project`}
                    data-testid={`button-project-${project.id}`}
                  >
                    <span className="visual-tag">{project.category} / {project.year}</span>
                    <span>{project.title}</span>
                  </button>
                  <div className="work-card-meta">
                    <div>
                      <h3>{project.client}</h3>
                      <p>{project.format}</p>
                    </div>
                    <time>{String(index + 1).padStart(2, '0')} — 04</time>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="approach" className="suite" aria-labelledby="approach-title">
          <div className="section-wrap suite-grid">
            <Reveal>
              <span className="eyebrow">03 / The method</span>
              <h2 id="approach-title" className="display-title">INSIDE<br />THE SUITE</h2>
              <p className="suite-intro">No magic button. Just a sharp brief, an unreasonable amount of listening, and a timeline that knows when to get out of the way.</p>
            </Reveal>
            <div className="suite-list">
              {[
                ['01', 'Find the pulse', 'I watch without sound first. Then I listen without looking.', 'ASSEMBLE'],
                ['02', 'Protect the strange', 'The unexpected take is usually where the film starts breathing.', 'DISCOVER'],
                ['03', 'Make it inevitable', 'Every frame earns its place. Every exit leaves a mark.', 'REFINE'],
                ['04', 'Give it air', 'A pause is not a gap. It is where the audience catches up.', 'RELEASE'],
              ].map(([number, title, copy, label], index) => (
                <Reveal key={number} className={`delay-${Math.min(index + 1, 4)}`}>
                  <div className="suite-row" data-testid={`row-method-${number}`}>
                    <span className="number">{number}</span>
                    <div><h3>{title}</h3><p>{copy}</p></div>
                    <strong>{label}</strong>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="about section-wrap" aria-labelledby="about-title">
          <div className="about-grid">
            <Reveal><div className="about-portrait" role="img" aria-label="Abstract portrait mark for Ayan Mehta" data-testid="img-ayan-portrait" /></Reveal>
            <Reveal className="delay-1">
              <span className="eyebrow">04 / The person behind the timeline</span>
              <h2 id="about-title" className="display-title">AYAN<br /><span style={{ color: 'var(--acid)' }}>MEHTA</span></h2>
              <p className="about-lede">Editor, sound obsessive, collector of almost-moments.</p>
              <p className="about-copy">Based between Mumbai and London, Ayan works with directors, brands and artists who want the film to feel like something — not just look like it. He brings a documentary eye to commercial work and a little mischief to everything else.</p>
              <div className="credits">
                <p>Represented by<strong>Cutting Room / IN</strong></p>
                <p>Tools of choice<strong>Premiere / Resolve</strong></p>
                <p>After-hours habit<strong>Field recordings</strong></p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="contact" aria-labelledby="contact-title">
          <div className="section-wrap contact-grid">
            <Reveal>
              <span className="eyebrow">05 / Start something</span>
              <h2 id="contact-title" className="display-title">LET'S<br />CUT.</h2>
              <p className="contact-lede">Have a rough idea, a locked picture, or just a feeling you cannot quite name? Send it over. I will know where to start.</p>
            </Reveal>
            <Reveal className="delay-2">
              {sent ? (
                <div className="form-success" data-testid="status-contact-success">
                  <strong>Message received.</strong><br />
                  I will get back to you within two working days. In the meantime, keep the strange take.
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContact} data-testid="form-contact">
                  <label htmlFor="name">Your name</label>
                  <input id="name" name="name" type="text" placeholder="Director / producer / curious human" required data-testid="input-contact-name" />
                  <label htmlFor="email">Your email</label>
                  <input id="email" name="email" type="email" placeholder="you@somewhere.com" required data-testid="input-contact-email" />
                  <label htmlFor="brief">The short version</label>
                  <textarea id="brief" name="brief" placeholder="What are we making?" required data-testid="input-contact-brief" />
                  <button className="contact-submit" type="submit" data-testid="button-send-contact">
                    Send the brief <ArrowUpRight size={15} />
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="section-wrap footer-row">
          <p>© 2024 CUT / TO — Ayan Mehta</p>
          <a href="mailto:hello@cutto.studio" data-testid="link-footer-email"><Mail size={13} /> hello@cutto.studio</a>
          <a href="#top" data-testid="link-back-top">Back to top <ArrowDown size={13} style={{ transform: 'rotate(180deg)' }} /></a>
        </div>
      </footer>

      {showreelOpen && <ReelModal close={() => setShowreelOpen(false)} />}
      {selectedProject && <ProjectModal project={selectedProject} close={() => setSelectedProject(null)} />}
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;