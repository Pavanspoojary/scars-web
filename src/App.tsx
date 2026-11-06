import { useState, useEffect } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  ArrowLeft
} from 'lucide-react';

interface ScarStory {
  id: string;
  shortId: string;
  name: string;
  title: string;
  lesson: string;
  fileAnchor: string;
  symbolAnchor: string;
  badPattern: string;
  goodPattern: string;
  verifier: string;
}

const SCARS: ScarStory[] = [
  {
    id: 'map-write-crash-391945',
    shortId: '#391945',
    name: 'concurrent-map-write',
    title: 'Concurrent Map Write in Telemetry Exporter',
    lesson: 'Metrics map must be protected by sync.RWMutex during RecordMetric calls.',
    fileAnchor: 'pkg/telemetry/exporter.go',
    symbolAnchor: 'RecordMetric',
    badPattern: 'm[key] = val',
    goodPattern: 'mu.Lock(); m[key] = val; mu.Unlock()',
    verifier: 'go test -race ./pkg/telemetry/...'
  },
  {
    id: 'nil-pointer-auth-8a1b3f',
    shortId: '#8A1B3F',
    name: 'nil-pointer-auth-ctx',
    title: 'Nil Pointer Dereference in Request Auth Context',
    lesson: 'Always verify context value existence with comma-ok idiom before accessing user claims.',
    fileAnchor: 'pkg/auth/context.go',
    symbolAnchor: 'UserFromContext',
    badPattern: 'user := ctx.Value(userKey).(*User)',
    goodPattern: 'user, ok := ctx.Value(userKey).(*User); if !ok { return nil, ErrUnauthorized }',
    verifier: 'go test ./pkg/auth/... -run TestUserFromContext_Nil'
  },
  {
    id: 'goroutine-leak-42719a',
    shortId: '#42719A',
    name: 'goroutine-channel-leak',
    title: 'Unbuffered Channel Goroutine Leak on Timeout',
    lesson: 'Senders on timeout channels must use buffered channel capacity 1 or select with default to prevent goroutine hang.',
    fileAnchor: 'pkg/worker/pool.go',
    symbolAnchor: 'DispatchWithTimeout',
    badPattern: 'ch := make(chan Result)',
    goodPattern: 'ch := make(chan Result, 1)',
    verifier: 'git-scars heal -- go test -timeout 5s ./pkg/worker/...'
  },
  {
    id: 'ast-drift-gate-61b20c',
    shortId: '#61B20C',
    name: 'ast-declaration-drift',
    title: 'AST Symbol Declaration Drift Gate',
    lesson: 'Tracks AST symbol hashes across Go, Python, and TypeScript to ignore whitespace while catching real signature changes.',
    fileAnchor: 'pkg/api/handlers.go',
    symbolAnchor: 'HandleBillingWebhook',
    badPattern: 'unanchored glob rule (*.go)',
    goodPattern: 'git-scars check --format sarif (deterministic symbol AST)',
    verifier: 'git-scars check --format sarif'
  }
];

interface BlogPost {
  slug: string;
  date: string;
  readTime: string;
  title: string;
  excerpt: string;
  body: string[];
}

const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'prompt-budgets-scaling-agent-retrieval',
    date: 'NOV 2026',
    readTime: '5 MIN READ',
    title: 'Prompt Budgets: Scaling Agent Retrieval from 871 to 133 Tokens',
    excerpt: 'How multi-signal anchor scoring and hard token budget caps eliminate attention dilution in Claude Code, Cursor, and Windsurf.',
    body: [
      'Monolithic instruction files such as AGENTS.md or CLAUDE.md present a fundamental scaling problem: every rule must be loaded for every task. In monorepos, this dumps hundreds of unrelated concurrency, authentication, and database constraints into the initial context window.',
      'Research shows that as prompt length grows, LLM attention is diluted—a phenomenon widely documented as "lost in the middle". An agent working on frontend UI components should never pay attention tokens for backend telemetry map synchronization.',
      'GitScars introduces token-budgeted prompt injection (git-scars inject --files "path" --budget 300). By computing a composite score across file paths, AST symbols, test commands, and error signatures, it retrieves only the exact relevant guardrails capped strictly to the specified token ceiling.',
      'In our modeled production benchmarks across 10 common incident categories, selective injection reduced prompt token consumption from 871 tokens to an average of 133 tokens—a 28.9% efficiency improvement over standard glob-scoped rules.'
    ]
  },
  {
    slug: 'automating-regression-memory-git-harvest-ci',
    date: 'NOV 2026',
    readTime: '6 MIN READ',
    title: 'Automating Regression Memory: From Git Blame to AST Guardrails',
    excerpt: 'Why manual documentation fails in fast-moving teams, and how git-scars harvest mines historical bug fixes into reviewable drafts.',
    body: [
      'The hardest part of failure memory is capture discipline. Engineers under pressure to restore production rarely write post-mortems in the exact schema needed by AI coding assistants.',
      'GitScars bridges this gap with git-scars harvest. By walking Git history, it identifies past bug-fixing commits and extracts candidate failure memories automatically using built-in quality heuristics.',
      'To prevent human review fatigue and noise, harvest applies three strict quality filters: a diff-size cap (ignoring commits touching > 5 files to filter out mass refactors), a mandatory co-located test requirement, and a 1-10 confidence score. Only high-confidence fixes (score >= 7) become reviewable drafts.',
      'Combined with git-scars check --format sarif in GitHub Actions, anchor drift and regression guardrails surface as native pull request annotations directly on changed code lines.'
    ]
  },
  {
    slug: 'the-myth-of-monolithic-agents-md',
    date: 'OCT 2026',
    readTime: '4 MIN READ',
    title: 'The Myth of the Monolithic AGENTS.md',
    excerpt: 'Why stuffing hundreds of rules into global prompt files dilutes model attention and provides zero protection when code refactors.',
    body: [
      'As repositories grow, teams inevitably compile rules: "Never use sync.Map here", "Always use context.WithTimeout on gRPC clients", "Remember the billing math rounding rule". Most teams paste these into a flat AGENTS.md or CLAUDE.md.',
      'Our scenario analysis across 10 production regression patterns revealed a stark finding: flat instruction files average 871 tokens of prompt bloat. More critically, when an engineer edits a frontend client, loading unrelated backend concurrency rules creates measurable attention dilution ("lost in the middle").',
      'Worse still is code drift. When services/billing/calc.go moves to core/pricing/calc.go, flat text rules silently become dead code. GitScars replaces this with selective, AST-anchored retrieval: rules fire only when anchored symbols are touched, consuming an average of 133 tokens.'
    ]
  },
  {
    slug: 'why-vector-memory-hallucinates-without-ast-proof',
    date: 'SEP 2026',
    readTime: '6 MIN READ',
    title: 'Why Vector Memory Hallucinates Without AST Proof',
    excerpt: 'Semantic similarity search is fundamentally the wrong paradigm for regression prevention in production codebases.',
    body: [
      'Vector memory systems and RAG pipelines promise that an agent will "remember" past incidents by computing embedding similarity between the current prompt and historical post-mortems.',
      'Recent benchmarks (such as VibeMemBench arXiv:2609.23570) reveal two fundamental failure modes of vector retrieval in software engineering: false-positive recall on superficial keyword overlaps, and zero awareness of code drift.',
      'A lesson written six months ago for a deprecated API looks semantically identical to a vector search query today. Without deterministic AST symbol hashing and fail-to-pass verification proofs, retrieved memories hallucinate stale recommendations directly into code.'
    ]
  },
  {
    slug: 'the-fail-to-pass-verification-invariant',
    date: 'AUG 2026',
    readTime: '5 MIN READ',
    title: 'The Fail-to-Pass Verification Invariant',
    excerpt: 'Why unverified failure advice is toxic to codebases, and how scrubbed test environments guarantee reproduction.',
    body: [
      'In production engineering, untested advice is worse than no advice. A developer or agent might claim: "Set DisableKeepAlives = true on http.Transport to fix connection resets". In production, disabling keep-alives forces TLS handshakes on every request, spiking latency and exhausting local ports.',
      'GitScars enforces a strict fail-to-pass invariant. A scar cannot transition to active status without a runnable test verifier that passes on the current worktree and conclusively fails when detached onto the parent base commit.',
      'Every active guardrail is cryptographically hashed against its argv and verified in clean environments before any AI agent prompt ever sees it.'
    ]
  }
];

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== 'undefined' && window.location.pathname === '/blog' ? '/blog' : '/'
  );
  const [selectedScarId, setSelectedScarId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  // Sync route with browser history and dynamic document title for SEO & LLM crawlers
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname === '/blog' ? '/blog' : '/';
      setCurrentPath(path);
      updateMetadata(path);
    };

    updateMetadata(currentPath);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentPath]);

  const updateMetadata = (path: string) => {
    if (path === '/blog') {
      document.title = 'Field Notes on Failure — GitScars Blog | Essays on Memory & Code Drift';
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', 'Essays on software regressions, attention budgets in AI coding assistants, and the architectural principles behind deterministic failure memory.');
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', 'https://pavanspoojary.github.io/scars-web/blog');
    } else {
      document.title = 'GitScars — The Weight of Scars | Git-Native Failure Memory & Regression Guardrails';
      const desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', 'GitScars anchors hard-won production incident lessons and concurrency bugs directly to Git trees, AST symbols, and error signatures. Selective prompt injection for Claude Code, Cursor, and Windsurf.');
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute('href', 'https://pavanspoojary.github.io/scars-web/');
    }
  };

  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    updateMetadata(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedScar = SCARS.find((s) => s.id === selectedScarId) || null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen py-16 sm:py-24 px-6 sm:px-12 flex flex-col justify-between selection:bg-[#2e2c29]/10 selection:text-[#1c1a18]">
      
      {/* Central Reading Page */}
      <main className="w-full max-w-2xl mx-auto space-y-10">
        
        {/* Top Minimal Breadcrumb Bar */}
        <div className="flex items-center justify-between text-[13px] font-sans text-[#78746d] tracking-normal">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => navigateTo('/')}
              className="hover:text-[#1c1a18] transition-colors cursor-pointer text-left"
            >
              gitscars
            </button>
            <span>/</span>
            <span>{currentPath === '/blog' ? 'blog' : 'digital failure memory'}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* The requested < blog/ > button */}
            {currentPath === '/blog' ? (
              <button
                onClick={() => navigateTo('/')}
                className="font-mono text-xs font-normal text-[#78746d] hover:text-[#1c1a18] transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>&lt; home/ &gt;</span>
              </button>
            ) : (
              <button
                onClick={() => navigateTo('/blog')}
                className="font-mono text-xs font-normal text-[#78746d] hover:text-[#1c1a18] transition-colors cursor-pointer"
                title="Read field notes and essays"
              >
                &lt; blog/ &gt;
              </button>
            )}

            <a
              href="https://github.com/Pavanspoojary/scars"
              target="_blank"
              rel="noreferrer"
              className="text-[#78746d] hover:text-[#1c1a18] transition-colors inline-flex items-center gap-1 text-xs"
            >
              <span>github</span>
              <ExternalLink className="w-2.5 h-2.5 text-[#9e9a91]" />
            </a>
          </div>
        </div>

        {/* ========================================================= */}
        {/* VIEW 1: BLOG PAGE (/blog)                                 */}
        {/* ========================================================= */}
        {currentPath === '/blog' ? (
          <div className="space-y-12 animate-fadeIn">
            {/* Blog Header */}
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-[46px] font-serif text-[#2b2927] tracking-tight leading-[1.14]">
                Field notes on failure
              </h1>
              <p className="text-[15.5px] sm:text-[16px] font-serif text-[#4a4742] leading-[1.8]">
                Essays on software regressions, attention budgets in AI coding assistants, and the architectural principles behind deterministic failure memory.
              </p>
            </div>

            {/* Ruled Paper Articles List */}
            <div className="ruled-paper-lines py-4 space-y-10">
              {BLOG_POSTS.map((post) => {
                const isExpanded = expandedPost === post.slug;

                return (
                  <article key={post.slug} className="space-y-3 pt-2" itemScope itemType="https://schema.org/TechArticle">
                    <meta itemProp="author" content="Pavan Spoojary" />
                    <meta itemProp="publisher" content="GitScars" />
                    <div className="flex items-center gap-3 text-[11px] font-mono text-[#78746d] tracking-wider uppercase">
                      <time dateTime="2026-10" itemProp="datePublished">{post.date}</time>
                      <span>&bull;</span>
                      <span>{post.readTime}</span>
                    </div>

                    <h2
                      onClick={() => setExpandedPost(isExpanded ? null : post.slug)}
                      className="text-2xl sm:text-[26px] font-serif text-[#1c1a18] hover:text-[#c2410c] cursor-pointer tracking-tight leading-snug transition-colors"
                      itemProp="headline"
                    >
                      {post.title}
                    </h2>

                    <p className="text-[15px] font-serif text-[#4a4742] leading-[1.75]" itemProp="description">
                      {post.excerpt}
                    </p>

                    {/* Expandable Essay Content */}
                    {isExpanded && (
                      <div className="pt-3 space-y-4 text-[15px] font-serif text-[#4a4742] leading-[1.8] border-l-2 border-[#ded8cb] pl-4 my-2" itemProp="articleBody">
                        {post.body.map((para, i) => (
                          <p key={i}>{para}</p>
                        ))}
                      </div>
                    )}

                    <div>
                      <button
                        onClick={() => setExpandedPost(isExpanded ? null : post.slug)}
                        className="font-mono text-xs text-[#78746d] hover:text-[#1c1a18] transition-colors cursor-pointer"
                      >
                        {isExpanded ? '[\u2212 collapse essay]' : '[+ read essay]'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Back button at the bottom of blog */}
            <div className="pt-6 border-t border-[#e2dccf] flex items-center justify-between">
              <button
                onClick={() => navigateTo('/')}
                className="font-handwriting text-xl text-[#44413c] hover:text-[#1c1a18] transition-colors cursor-pointer"
              >
                &larr; return to specification
              </button>
              <span className="font-mono text-xs text-[#8c8880]">
                {BLOG_POSTS.length} essays published
              </span>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: HOME PAGE (The Weight of Scars)                   */
          /* ========================================================= */
          <>
            {/* Headline */}
            <h1 className="text-4xl sm:text-[46px] font-serif text-[#2b2927] tracking-tight leading-[1.14]">
              The weight of scars
            </h1>

            {/* Semantic AI / LLM Search Knowledge Extract (Accessible to crawlers & screen readers) */}
            <section aria-label="GitScars Technical Abstract" className="sr-only">
              <h2>What is GitScars (git-scars)?</h2>
              <p>
                GitScars is a Git-native failure memory and regression guardrail system for software engineers and AI coding assistants (Claude Code, Cursor, Windsurf, Copilot).
                It captures production incidents and concurrency regressions as versioned Markdown documents stored in .gitscars/scars/, anchored to repository file paths, AST symbols, error signatures, and dependencies.
              </p>
              <h3>Core Capabilities</h3>
              <ul>
                <li>Deterministic AST symbol hashing for Go, Python, and TypeScript, preventing stale rules on hot files while detecting real signature alterations.</li>
                <li>Fail-to-pass verification gate requiring tests to fail on parent base commits and pass on current worktrees before activation.</li>
                <li>Token-budgeted prompt injection capped to exact token limits (averaging 133 tokens, a 28.9% reduction compared to monolithic AGENTS.md files).</li>
                <li>Native OASIS SARIF 2.1.0 output for GitHub Code Scanning and CI pipelines.</li>
                <li>Pure Go standalone static binary with zero external runtime dependencies.</li>
              </ul>
              <h3>Installation</h3>
              <p>Install via Go: go install github.com/Pavanspoojary/scars/cmd/git-scars@latest</p>
            </section>

            {/* Prose */}
            <div className="space-y-5 text-[15.5px] sm:text-[16px] font-serif text-[#4a4742] leading-[1.8]">
              <p>
                Paying homage to hard-won lessons from production incidents, concurrency traps, and breaking regressions, by capturing them in a digital form, exploring the blend of engineering history, Git architecture, and deterministic guardrails &mdash; bringing them online for AI coding assistants to honor.
              </p>
              <p>
                Each scar tells a story of an incident averted, a moment in time. Some records are inspired by concurrency panics in high-throughput services, and some by silent AST drift discovered in CI. Together, they celebrate the enduring craft of regression prevention &mdash; and the stories that linger in a miniature piece of <span className="italic">code.</span>
              </p>
            </div>

            {/* Ruled Notebook Section */}
            <div className="pt-2">
              <div className="ruled-paper-lines py-6 px-2 sm:px-4 relative min-h-[250px] flex flex-col justify-center">
                
                {!selectedScar ? (
                  // Default: Hand-drawn pencil sketch, cursive prompt & selector
                  <div className="py-2 flex flex-col items-center sm:items-start select-none">
                    
                    <div className="relative w-full max-w-md mx-auto sm:mx-0 min-h-[170px] flex items-center justify-center">
                      
                      {/* SVG Hand-Drawn Pencil Sketch */}
                      <svg
                        viewBox="0 0 340 160"
                        fill="none"
                        className="absolute inset-0 w-full h-full pointer-events-none stroke-[#6b6760]"
                      >
                        <g opacity="0.5">
                          <rect
                            x="75"
                            y="20"
                            width="82"
                            height="100"
                            rx="2"
                            strokeWidth="1.1"
                            strokeDasharray="4 2"
                            transform="rotate(-6 116 70)"
                          />
                          <path
                            d="M 82 35 L 145 30 M 84 50 L 148 45 M 86 65 L 150 60 M 88 80 L 152 75 M 90 95 L 154 90"
                            strokeWidth="0.75"
                            strokeOpacity="0.35"
                            transform="rotate(-6 116 70)"
                          />
                        </g>

                        <g opacity="0.7">
                          <rect
                            x="105"
                            y="28"
                            width="86"
                            height="104"
                            rx="2"
                            strokeWidth="1.1"
                            strokeDasharray="4 2"
                            transform="rotate(4 148 80)"
                          />
                          <path
                            d="M 112 45 L 180 50 M 114 60 L 182 65 M 116 75 L 184 80 M 118 90 L 186 95 M 120 105 L 188 110"
                            strokeWidth="0.75"
                            strokeOpacity="0.35"
                            transform="rotate(4 148 80)"
                          />
                        </g>

                        <g transform="translate(195, 25)" strokeWidth="1.1">
                          <circle cx="12" cy="12" r="8" strokeDasharray="3 1" />
                          <path d="M 9 10 Q 10 9 11 10" strokeLinecap="round" />
                          <path d="M 13 10 Q 14 9 15 10" strokeLinecap="round" />
                          <path d="M 9 14 Q 12 17 15 14" strokeLinecap="round" />
                          <line x1="12" y1="1" x2="12" y2="3" />
                          <line x1="12" y1="21" x2="12" y2="23" />
                          <line x1="1" y1="12" x2="3" y2="12" />
                          <line x1="21" y1="12" x2="23" y2="12" />
                          <line x1="4" y1="4" x2="6" y2="6" />
                          <line x1="18" y1="18" x2="20" y2="20" />
                          <line x1="4" y1="20" x2="6" y2="18" />
                          <line x1="18" y1="4" x2="20" y2="6" />
                        </g>

                        <path
                          d="M 180 115 C 215 118, 225 78, 260 76"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                        />
                        <path
                          d="M 252 70 L 262 76 L 255 83"
                          strokeWidth="1.4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* Handwritten cursive prompt */}
                      <div className="relative z-10 text-center font-handwriting text-[27px] sm:text-[30px] text-[#44413c] leading-[1.1] select-none pr-8">
                        <div>select a scar</div>
                        <div>to see the details</div>
                      </div>
                    </div>

                    {/* Subtle scar selectors on paper */}
                    <div className="w-full pt-4 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] text-[#6b6760]">
                      {SCARS.map((scar) => (
                        <button
                          key={scar.id}
                          onClick={() => setSelectedScarId(scar.id)}
                          className="px-2.5 py-1 rounded-sm border border-[#ded8cb] bg-[#f2efe6]/70 hover:bg-[#ede9dc] text-[#33312e] transition-colors cursor-pointer"
                        >
                          {scar.shortId} {scar.name}
                        </button>
                      ))}
                    </div>

                  </div>
                ) : (
                  // Selected: Quietly typed onto the ruled notebook lines
                  <div className="space-y-3 font-serif py-1">
                    <div className="flex items-center justify-between pb-1 font-mono text-xs text-[#78746d]">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#2b2927]">{selectedScar.shortId}</span>
                        <span>&bull;</span>
                        <span>{selectedScar.name}</span>
                      </div>
                      <button
                        onClick={() => setSelectedScarId(null)}
                        className="hover:text-[#1c1a18] font-handwriting text-base transition-colors cursor-pointer"
                      >
                        &larr; return
                      </button>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-serif text-[#1c1a18] tracking-tight leading-snug">
                      {selectedScar.title}
                    </h3>

                    <p className="text-sm text-[#4a4742] leading-relaxed">
                      {selectedScar.lesson}
                    </p>

                    {/* Rules */}
                    <div className="pt-2 space-y-1.5 font-mono text-xs text-[#383531]">
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] uppercase font-bold text-[#9f1239] w-12 flex-shrink-0 pt-0.5">don't</span>
                        <span className="line-through text-[#6b6760]">{selectedScar.badPattern}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-[10px] uppercase font-bold text-[#166534] w-12 flex-shrink-0 pt-0.5">do</span>
                        <span className="text-[#1c1a18] font-medium">{selectedScar.goodPattern}</span>
                      </div>
                    </div>

                    {/* Verification runner */}
                    <div className="pt-2 flex items-center justify-between font-mono text-[11px] text-[#57534e]">
                      <div className="truncate pr-2">
                        <span className="text-[#9e9a91] select-none">$ </span>
                        <span>{selectedScar.verifier}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedScar.verifier, selectedScar.id)}
                        className="p-1 hover:bg-[#ede8dc] rounded text-[#78746d] hover:text-[#1c1a18] transition-colors flex-shrink-0 cursor-pointer"
                        title="Copy command"
                      >
                        {copiedId === selectedScar.id ? <Check className="w-3.5 h-3.5 text-[#166534]" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Minimal Install Note */}
            <div className="pt-4 flex items-center justify-between font-mono text-xs text-[#57534e] border-t border-[#e2dccf]">
              <div className="truncate pr-2">
                <span className="text-[#9e9a91] select-none">$ </span>
                <span className="text-[#2b2927]">go install github.com/Pavanspoojary/scars/cmd/git-scars@latest</span>
              </div>
              <button
                onClick={() =>
                  handleCopy(
                    'go install github.com/Pavanspoojary/scars/cmd/git-scars@latest',
                    'install-cmd'
                  )
                }
                className="p-1 hover:bg-[#ede8dc] rounded text-[#78746d] hover:text-[#1c1a18] transition-colors flex-shrink-0 text-[11px] flex items-center gap-1 cursor-pointer"
                title="Copy command"
              >
                {copiedId === 'install-cmd' ? (
                  <>
                    <Check className="w-3 h-3 text-[#166534]" />
                    <span className="text-[#166534]">copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>copy</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

      </main>

      {/* Whisper-Light Minimal Footer */}
      <footer className="w-full max-w-2xl mx-auto pt-16 pb-4 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#8c8880] gap-2">
        <div className="flex items-center gap-2">
          <span>gitscars</span>
          <span>&bull;</span>
          <span>deterministic failure memory</span>
          <span>&bull;</span>
          <span>apache 2.0</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo(currentPath === '/blog' ? '/' : '/blog')}
            className="hover:text-[#1c1a18] transition-colors cursor-pointer"
          >
            {currentPath === '/blog' ? 'home' : 'blog'}
          </button>
          <span>&bull;</span>
          <a
            href="https://github.com/Pavanspoojary/scars"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[#1c1a18] transition-colors"
          >
            github.com/pavanspoojary/scars
          </a>
        </div>
      </footer>

    </div>
  );
}
