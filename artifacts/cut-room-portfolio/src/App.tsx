import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import emailjs from '@emailjs/browser';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ArrowDown, ArrowUpRight, Clapperboard, Mail, Menu, Play, Volume2, VolumeX, X } from 'lucide-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

// Replace these three values with your EmailJS dashboard credentials.
const SERVICE_ID = "YOUR_SERVICE_ID";
const TEMPLATE_ID = "YOUR_TEMPLATE_ID";
const PUBLIC_KEY = "YOUR_PUBLIC_KEY";

type Category = 'All' | 'Brand Films' | 'Social Media' | 'Commercials' | 'Campaigns' | 'Reels';

type Project = {
  id: string;
  title: string;
  client: string;
  category: Exclude<Category, 'All'>;
  year: string;
  format: string;
  description: string;
  visualClass: string;
  videoFile?: string;
};

const projects: Project[] = [
  {
    id: 'zenvic-01',
    title: 'Brand Content 01',
    client: 'Zenvic',
    category: 'Brand Films',
    year: '—',
    format: 'Brand Film / —',
    description: 'Brand-led video content shaped for clarity, consistency, and audience attention.',
    visualClass: 'visual-one',
    videoFile: 'Zenvic 1.MP4',
  },
  {
    id: 'shift-surge-garage-01',
    title: 'Garage Campaign 01',
    client: 'Shift & Surge Garage',
    category: 'Campaigns',
    year: '—',
    format: 'Campaign / —',
    description: 'Promotional edits that bring together pace, product focus, and a clear brand voice.',
    visualClass: 'visual-two',
    videoFile: 'Car 1.MP4',
  },
  {
    id: 'shift-surge-garage-02',
    title: 'Garage Campaign 02',
    client: 'Shift & Surge Garage',
    category: 'Campaigns',
    year: '—',
    format: 'Campaign / —',
    description: 'Promotional edits that bring together pace, product focus, and a clear brand voice.',
    visualClass: 'visual-three',
    videoFile: 'car 2.MP4',
  },
  {
    id: 'shift-surge-garage-03',
    title: 'Garage Campaign 03',
    client: 'Shift & Surge Garage',
    category: 'Campaigns',
    year: '—',
    format: 'Campaign / —',
    description: 'Promotional edits that bring together pace, product focus, and a clear brand voice.',
    visualClass: 'visual-four',
    videoFile: 'car 3.MP4',
  },
  {
    id: 'jote-masala-01',
    title: 'Masala Social Content 01',
    client: 'JoTe Masala',
    category: 'Social Media',
    year: '—',
    format: 'Social Media / —',
    description: 'Short-form brand content edited for clear messaging and repeat viewing.',
    visualClass: 'visual-three',
    videoFile: 'IMG_0974.MP4',
  },
  {
    id: 'jote-masala-02',
    title: 'Masala Social Content 02',
    client: 'JoTe Masala',
    category: 'Social Media',
    year: '—',
    format: 'Social Media / —',
    description: 'Short-form brand content edited for clear messaging and repeat viewing.',
    visualClass: 'visual-four',
    videoFile: 'JoTe Masala 02.mp4',
  },
  {
    id: 'jote-masala-03',
    title: 'Masala Social Content 03',
    client: 'JoTe Masala',
    category: 'Social Media',
    year: '—',
    format: 'Social Media / —',
    description: 'Short-form brand content edited for clear messaging and repeat viewing.',
    visualClass: 'visual-one',
    videoFile: 'New JoTe.mp4',
  },
  {
    id: 'air-my-cart-01',
    title: 'Air My Cart Promotional Content',
    client: 'Air My Cart',
    category: 'Commercials',
    year: '—',
    format: 'Commercial / —',
    description: 'Promotional video edits built around product communication and platform-ready pacing.',
    visualClass: 'visual-four',
    videoFile: 'Air my Cart_1.mp4',
  },
  {
    id: 'ranji-textiles-01',
    title: 'Textile Brand Content 01',
    client: 'Ranji Textiles',
    category: 'Reels',
    year: 'Current',
    format: 'Reels / —',
    description: 'Ongoing short-form content with a focus on rhythm, presentation, and brand consistency.',
    visualClass: 'visual-one',
    videoFile: 'Ranji TEX 1.mp4',
  },
  {
    id: 'ranji-textiles-02',
    title: 'Textile Brand Content 02',
    client: 'Ranji Textiles',
    category: 'Reels',
    year: 'Current',
    format: 'Reels / —',
    description: 'Ongoing short-form content with a focus on rhythm, presentation, and brand consistency.',
    visualClass: 'visual-two',
    videoFile: 'Ranji TEX 2.mp4',
  },
  {
    id: 'ranji-textiles-03',
    title: 'Textile Brand Content 03',
    client: 'Ranji Textiles',
    category: 'Reels',
    year: 'Current',
    format: 'Reels / —',
    description: 'Ongoing short-form content with a focus on rhythm, presentation, and brand consistency.',
    visualClass: 'visual-three',
    videoFile: 'Ranji TEX_3.mp4',
  },
  {
    id: 'tiny-littora-01',
    title: 'Brand Content 01',
    client: 'TINY LITTORA',
    category: 'Brand Films',
    year: '—',
    format: 'Brand Film / —',
    description: 'A focused brand edit shaped around clear visual identity and audience attention.',
    visualClass: 'visual-four',
    videoFile: 'Ranji TEX 3.mp4',
  },
];

const navItems = [
  { label: 'Work', href: '#work' },
  { label: 'Method', href: '#approach' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const clientFolderNames: Record<string, string> = {
  'Zenvic': 'zenvic',
  'Shift & Surge Garage': 'shift-and-surge-garage',
  'JoTe Masala': 'jote-masala',
  'Air My Cart': 'air-my-cart',
  'Ranji Textiles': 'ranji-textiles',
  'TINY LITTORA': 'tiny-littora',
};

function getClientVideoPath(client: string, videoNumber: number) {
  return `/client-videos/${clientFolderNames[client]}/${String(videoNumber).padStart(2, '0')}.mp4`;
}

const videoDatabaseName = 'blackxspace-client-videos';

function openVideoDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(videoDatabaseName, 1);
    request.onupgradeneeded = () => request.result.createObjectStore('videos');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadClientVideos() {
  const database = await openVideoDatabase();
  const videos = await new Promise<Record<string, string>>((resolve, reject) => {
    const result: Record<string, string> = {};
    const request = database.transaction('videos', 'readonly').objectStore('videos').openCursor();
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return resolve(result);
      result[String(cursor.key)] = URL.createObjectURL(cursor.value as Blob);
      cursor.continue();
    };
    request.onerror = () => reject(request.error);
  });
  database.close();
  return videos;
}

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
        BLACKxSPACE
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
          <strong id="reel-title">BLACKxSPACE — showreel 2024</strong>
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

function ProjectVideo({ src, autoPlay, onError }: { src: string; autoPlay: boolean; onError: () => void }) {
  const [aspectRatio, setAspectRatio] = useState('16 / 9');
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [muted, setMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      void videoRef.current.play();
    } else {
      videoRef.current.pause();
    }
  };

  return (
    <div className="modal-reel" style={{ aspectRatio }}>
      <video
        ref={videoRef}
        className="project-video"
        src={src}
        autoPlay={autoPlay}
        playsInline
        preload="metadata"
        muted={muted}
        onClick={togglePlayback}
        onLoadedMetadata={(event) => {
          const { videoWidth, videoHeight } = event.currentTarget;
          if (videoWidth && videoHeight) setAspectRatio(`${videoWidth} / ${videoHeight}`);
          setDuration(event.currentTarget.duration);
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onError={onError}
      />
      <button
        className="video-mute"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          setMuted((value) => !value);
        }}
        aria-label={muted ? 'Unmute client video' : 'Mute client video'}
      >
        {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
      </button>
      <input
        className="timeline-track"
        type="range"
        min="0"
        max={duration || 0}
        step="0.1"
        value={Math.min(currentTime, duration || 0)}
        onChange={(event) => {
          const nextTime = Number(event.target.value);
          if (videoRef.current) videoRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }}
        aria-label="Seek client video"
      />
    </div>
  );
}

function ProjectModal({ project, clientProjects, videoUrls, close }: { project: Project; clientProjects: Project[]; videoUrls: Record<string, string>; close: () => void }) {
  const [unavailableVideos, setUnavailableVideos] = useState<Record<string, boolean>>({});

  return (
    <div className="modal-backdrop" role="presentation" onClick={close}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="project-title" onClick={(event) => event.stopPropagation()}>
        <div className="modal-top">
          <strong>{project.client} / {project.year}</strong>
          <button className="modal-close" type="button" onClick={close} aria-label="Close project" data-testid="button-close-project">
            <X size={19} />
          </button>
        </div>
        <div className={`project-video-list${clientProjects.length === 1 ? ' single-video' : ''}`}>
          {clientProjects.map((clientProject, index) => {
            const uploadedVideo = videoUrls[clientProject.id];
            const folderVideo = clientProject.videoFile
              ? `/client-videos/${clientFolderNames[clientProject.client]}/${encodeURIComponent(clientProject.videoFile)}`
              : getClientVideoPath(clientProject.client, index + 1);
            const videoSource = uploadedVideo || (!unavailableVideos[clientProject.id] ? folderVideo : undefined);

            return (
            <div className={clientProject.visualClass} key={clientProject.id}>
              {videoSource ? (
                <ProjectVideo
                  src={videoSource}
                  autoPlay={index === 0}
                  onError={() => setUnavailableVideos((videos) => ({ ...videos, [clientProject.id]: true }))}
                />
              ) : (
                <div className="project-video-empty">
                  <Clapperboard size={28} />
                  <span>Upload {clientProject.title} to preview it here.</span>
                </div>
              )}
            </div>
            );
          })}
        </div>
        <div className="modal-copy">
          <strong id="project-title">{project.client}</strong>
          <p>{clientProjects.length} completed video{clientProjects.length === 1 ? '' : 's'} across {clientProjects[0].category.toLowerCase()} work.</p>
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
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const reelVideoRef = useRef<HTMLVideoElement | null>(null);
  const [reelTime, setReelTime] = useState(0);
  const [reelDuration, setReelDuration] = useState(0);
  const [heroMuted, setHeroMuted] = useState(false);
  const [projectVideos, setProjectVideos] = useState<Record<string, string>>({});

  useEffect(() => {
    void loadClientVideos().then(setProjectVideos).catch(() => undefined);
  }, []);

  const visibleProjects = useMemo(
    () => {
      const filteredProjects = category === 'All' ? projects : projects.filter((project) => project.category === category);
      return filteredProjects.filter((project, index) => filteredProjects.findIndex((item) => item.client === project.client) === index);
    },
    [category],
  );

  const handleContact = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactStatus('sending');
    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, event.currentTarget, { publicKey: PUBLIC_KEY });
      setContactStatus('success');
    } catch {
      setContactStatus('error');
    }
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
                  <span className="eyebrow">Freelancer / Tuticorin — Coimbatore</span>
                </div>
              </Reveal>
              <Reveal className="delay-1">
                <h1 id="hero-title" className="hero-title display-title">MAKE IT<br /><em>MOVE.</em></h1>
              </Reveal>
              <Reveal className="delay-2">
                <p className="hero-copy">
                  Editing that transforms footage into compelling stories. Commercials, music videos, documentaries, and branded films crafted with precision, rhythm, and a distinct cinematic point of view.
                </p>
                <div className="hero-meta">
                  <p><strong>Currently</strong>Editing from Chennai-Coimbatore, India</p>
                  <p><strong>Available</strong>Open for freelance &amp; collaborations</p>
                </div>
              </Reveal>
            </div>
            <Reveal className="delay-3">
              <div className="reel-stage">
                <div className="reel-frame">
                  <video
                    ref={reelVideoRef}
                    className="reel-video"
                    src="/showreel.mp4"
                    playsInline
                    muted={heroMuted}
                    loop
                    autoPlay
                    onClick={() => {
                      if (reelVideoRef.current?.paused) void reelVideoRef.current.play();
                      else reelVideoRef.current?.pause();
                    }}
                    onLoadedMetadata={(event) => setReelDuration(event.currentTarget.duration)}
                    onTimeUpdate={(event) => setReelTime(event.currentTarget.currentTime)}
                  />
                  <span className="reel-stamp">SHOWREEL / 01:32</span>
                  <button
                    className="video-mute hero-mute"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setHeroMuted((value) => !value);
                    }}
                    aria-label={heroMuted ? 'Unmute showreel' : 'Mute showreel'}
                  >
                    {heroMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                  </button>
                  <input
                    className="timeline-track"
                    type="range"
                    min="0"
                    max={reelDuration || 0}
                    step="0.1"
                    value={Math.min(reelTime, reelDuration || 0)}
                    onChange={(event) => {
                      const nextTime = Number(event.target.value);
                      if (reelVideoRef.current) reelVideoRef.current.currentTime = nextTime;
                      setReelTime(nextTime);
                    }}
                    aria-label="Seek showreel"
                  />
                </div>
              </div>
            </Reveal>
          </div>
          <Reveal className="delay-4">
            <div className="scroll-cue"><span />Scroll through the edit</div>
          </Reveal>
        </section>

        <section className="manifesto" aria-labelledby="manifesto-title">
          <div className="section-wrap manifesto-grid">
            <Reveal><span className="eyebrow">01 / Editing with purpose</span></Reveal>
            <Reveal className="delay-1">
              <h2 id="manifesto-title" className="display-title">Editing with <span>purpose.</span></h2>
              <p className="manifesto-note">Every frame serves a reason. From commercials to music videos and films, I craft edits that elevate the story through precision and timing.</p>
            </Reveal>
          </div>
        </section>

        <section id="work" className="work-section section-wrap" aria-labelledby="work-title">
          <Reveal>
            <div className="section-heading">
              <div>
                <span className="eyebrow">02 / Selected Work</span>
                <h2 id="work-title" className="display-title">SELECTED WORK</h2>
              </div>
              <p>12 commercial and brand edits across six clients, shaped with precision, rhythm, and a clear sense of purpose.</p>
            </div>
          </Reveal>
          <Reveal className="delay-1">
            <div className="filter-row" role="group" aria-label="Filter selected work">
              {(['All', 'Brand Films', 'Social Media', 'Commercials', 'Campaigns', 'Reels'] as Category[]).map((filter) => (
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
                    aria-label={`Play ${project.client} video`}
                    data-testid={`button-project-${project.id}`}
                  >
                    {project.videoFile && (
                      <video
                        className="work-card-video"
                        src={`/client-videos/${clientFolderNames[project.client]}/${encodeURIComponent(project.videoFile)}`}
                        muted
                        playsInline
                        loop
                        autoPlay
                        aria-hidden="true"
                      />
                    )}
                    <span className="visual-tag">{project.category} / {project.year}</span>
                    <span>{project.client}</span>
                    <span className="watch-label"><Play size={12} fill="currentColor" /> CLICK TO WATCH</span>
                  </button>
                  <div className="work-card-meta">
                    <div>
                      <h3>{project.client}</h3>
                      <p>{project.format}</p>
                    </div>
                    <time>
                      {projects.filter((item) => item.client === project.client).length} video{projects.filter((item) => item.client === project.client).length === 1 ? '' : 's'}
                    </time>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="approach" className="suite" aria-labelledby="approach-title">
          <div className="section-wrap suite-grid">
            <Reveal>
              <span className="eyebrow">03 / THE METHOD</span>
              <h2 id="approach-title" className="display-title">INSIDE<br />THE TIMELINE</h2>
              <p className="suite-intro">No presets doing the thinking. Just timing, movement, layers, and a lot of keyframes.</p>
            </Reveal>
            <div className="suite-list">
              {[
                ['01', 'Build the motion', 'Every movement starts with timing. I shape position, scale, rotation, and speed until the motion feels intentional.', 'ANIMATE'],
                ['02', 'Make it flow', "Transitions shouldn't just connect two shots. They should make the movement feel continuous.", 'CONNECT'],
                ['03', 'Add the detail', 'Typography, effects, compositing, and small movements bring the edit to life. Every detail has a purpose.', 'REFINE'],
                ['04', 'Let it breathe', "Good motion isn't about moving everything. Sometimes the strongest frame is the one that stays still.", 'DELIVER'],
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
            <Reveal>
              <div className="about-visuals">
                <img className="about-photo" src="/Black%20Hole.jpg" alt="Portrait of Jacob Abraham J" data-testid="img-jacob-photo" />
              </div>
            </Reveal>
            <Reveal className="delay-1">
              <span className="eyebrow">04 / THE PERSON BEHIND THE TIMELINE</span>
              <h2 id="about-title" className="display-title">JACOB<br /><span style={{ color: 'var(--acid)' }}>ABRAHAM J</span></h2>
              <p className="about-lede">Video editor, motion enthusiast, and someone who probably spends too long perfecting a 2-second cut.</p>
              <p className="about-copy">I work mainly on digital marketing, social media, and brand content — turning raw footage into edits that feel sharp, engaging, and built to hold attention.</p>
              <div className="credits">
                <p>Tools of choice<strong>Premiere Pro / After Effects</strong></p>
                <p>What I bring<strong>Editing / Motion Graphics / Visual Storytelling</strong></p>
                <p>Currently into<strong>Finding better ways to make every frame count.</strong></p>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="contact" className="contact" aria-labelledby="contact-title">
          <div className="section-wrap contact-grid">
            <Reveal>
              <span className="eyebrow">05 / LET'S CUT.</span>
              <h2 id="contact-title" className="display-title">You have the story.<br /><span>I'll find the rhythm.</span></h2>
              <p className="contact-lede">From raw footage to the final frame —<br />let's make something people want to watch.</p>
            </Reveal>
            <Reveal className="delay-2">
              {contactStatus === 'success' ? (
                <div className="form-success" data-testid="status-contact-success">
                  Thanks! Your project has been received. I'll get back to you within 24 hours.
                </div>
              ) : contactStatus === 'error' ? (
                <div className="form-error" role="alert" data-testid="status-contact-error">
                  Something went wrong. Please try again.
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleContact} data-testid="form-contact">
                  <input type="hidden" name="to_email" value="blackxspace3@gmail.com" />
                  <div className="contact-field">
                    <label htmlFor="full-name">Full Name *</label>
                    <input id="full-name" name="full_name" type="text" autoComplete="name" placeholder="Your full name" required data-testid="input-contact-name" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="email">Email Address *</label>
                    <input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required data-testid="input-contact-email" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="company">Company / Brand</label>
                    <input id="company" name="company" type="text" autoComplete="organization" placeholder="Company or brand name" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="project-type">Project Type</label>
                    <select id="project-type" name="project_type" defaultValue="">
                      <option value="" disabled>Select a project type</option>
                      <option>Social Media Reels</option>
                      <option>Brand Video</option>
                      <option>YouTube</option>
                      <option>Motion Graphics</option>
                      <option>Advertisement</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="contact-row">
                    <div className="contact-field">
                      <label htmlFor="budget">Budget</label>
                      <input id="budget" name="budget" type="text" placeholder="Optional" />
                    </div>
                    <div className="contact-field">
                      <label htmlFor="deadline">Deadline</label>
                      <input id="deadline" name="deadline" type="text" placeholder="Optional" />
                    </div>
                  </div>
                  <div className="contact-field">
                    <label htmlFor="brief">Project Brief *</label>
                    <textarea id="brief" name="project_brief" placeholder="Tell me what you're making." required data-testid="input-contact-brief" />
                  </div>
                  <div className="contact-field">
                    <label htmlFor="reference">Reference</label>
                    <input id="reference" name="reference" type="text" placeholder="Optional" />
                  </div>
                  <button className="contact-submit" type="submit" disabled={contactStatus === 'sending'} data-testid="button-send-contact">
                    {contactStatus === 'sending' ? <><span className="submit-spinner" /> Sending...</> : <>SEND PROJECT <ArrowUpRight size={15} /></>}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="section-wrap footer-row">
          <p>© 2026 BLACKxSPACE — Jacob Abraham J</p>
          <a href="mailto:blackxspace3@gmail.com" data-testid="link-footer-email"><Mail size={13} /> blackxspace3@gmail.com</a>
          <a href="#top" data-testid="link-back-top">Back to top <ArrowDown size={13} style={{ transform: 'rotate(180deg)' }} /></a>
        </div>
      </footer>

      {showreelOpen && <ReelModal close={() => setShowreelOpen(false)} />}
      {selectedProject && <ProjectModal project={selectedProject} clientProjects={projects.filter((project) => project.client === selectedProject.client)} videoUrls={projectVideos} close={() => setSelectedProject(null)} />}
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