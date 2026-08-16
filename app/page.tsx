'use client'

import { useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  FileText,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  Play,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from 'lucide-react'

type Screen = 'dashboard' | 'reviewer' | 'practice' | 'progress' | 'incorrect'
type Answer = { id: string; text: string; correct?: boolean }

type Question = {
  id: number
  section: string
  prompt: string
  answers: Answer[]
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    section: 'Insurance Basics',
    prompt: 'Which principle of insurance requires the insured to disclose all material facts to the insurer?',
    answers: [
      { id: 'a', text: 'Indemnity' },
      { id: 'b', text: 'Utmost good faith', correct: true },
      { id: 'c', text: 'Contribution' },
      { id: 'd', text: 'Subrogation' },
    ],
    explanation: 'Utmost good faith requires both parties to disclose all material facts that could influence the underwriting decision.',
  },
  {
    id: 2,
    section: 'Life & Health',
    prompt: 'What is the primary purpose of a life insurance beneficiary designation?',
    answers: [
      { id: 'a', text: 'To set the policy premium' },
      { id: 'b', text: 'To select the policy owner' },
      { id: 'c', text: 'To identify who receives the death benefit', correct: true },
      { id: 'd', text: 'To determine the policy term' },
    ],
    explanation: 'A beneficiary designation names the person or entity who receives the policy proceeds after the insured dies.',
  },
  {
    id: 3,
    section: 'Regulation',
    prompt: 'An insurance producer must keep client records for how long after a policy is issued?',
    answers: [
      { id: 'a', text: 'One year' },
      { id: 'b', text: 'Three years' },
      { id: 'c', text: 'Five years', correct: true },
      { id: 'd', text: 'Ten years' },
    ],
    explanation: 'Most state regulations require producers to retain transaction records for at least five years.',
  },
]

const navItems: { id: Screen; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'reviewer', label: 'Reviewer', icon: BookOpen },
  { id: 'practice', label: 'Practice Exam', icon: FileText },
  { id: 'progress', label: 'My Progress', icon: BarChart3 },
  { id: 'incorrect', label: 'Incorrect Answers', icon: CircleHelp },
]

function Brand() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--navy)] text-[var(--yellow)]">
        <ShieldCheck className="size-5" strokeWidth={2.5} />
      </div>
      <span className="font-mono text-sm font-bold tracking-tight text-[var(--navy)]">INSURE<span className="text-[var(--blue)]">PREP</span></span>
    </div>
  )
}

function Sidebar({ screen, setScreen, open, close }: { screen: Screen; setScreen: (s: Screen) => void; open: boolean; close: () => void }) {
  return (
    <aside className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-slate-200 bg-white p-5 transition-transform lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="mb-12 flex items-center justify-between px-1">
        <Brand />
        <button className="rounded-md p-1 text-slate-400 lg:hidden" onClick={close} aria-label="Close menu"><X className="size-5" /></button>
      </div>
      <nav className="flex flex-col gap-1.5" aria-label="Primary navigation">
        <p className="mb-3 px-3 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Workspace</p>
        {navItems.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => { setScreen(id); close() }} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition-colors ${screen === id ? 'bg-[var(--navy)] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-[var(--navy)]'}`}>
            <Icon className="size-4" />{label}
            {id === 'incorrect' && <span className="ml-auto rounded-full bg-[var(--yellow)] px-1.5 py-0.5 font-mono text-[10px] font-bold text-[var(--navy)]">4</span>}
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-1.5 border-t border-slate-100 pt-5">
        <button className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50"><Settings className="size-4" />Settings</button>
        <div className="mt-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
          <div className="flex size-8 items-center justify-center rounded-full bg-[var(--blue)] font-mono text-xs font-bold text-white">JD</div>
          <div className="min-w-0"><p className="truncate text-xs font-bold text-[var(--navy)]">Jordan Davis</p><p className="truncate text-[11px] text-slate-400">Student account</p></div>
          <MoreHorizontal className="ml-auto size-4 text-slate-400" />
        </div>
      </div>
    </aside>
  )
}

function Header({ title, onMenu }: { title: string; onMenu: () => void }) {
  return <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-10"><div className="flex items-center gap-3"><button onClick={onMenu} className="rounded-md p-2 text-slate-500 lg:hidden" aria-label="Open menu"><Menu className="size-5" /></button><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Insurance Licensing</p><h1 className="mt-0.5 text-xl font-bold tracking-tight text-[var(--navy)]">{title}</h1></div></div><div className="flex items-center gap-3"><button className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500 sm:flex sm:items-center sm:gap-2"><Search className="size-3.5" /> Search</button><button className="rounded-lg border border-slate-200 p-2 text-slate-500" aria-label="Help"><CircleHelp className="size-4" /></button><div className="flex size-8 items-center justify-center rounded-full bg-[var(--blue)] font-mono text-xs font-bold text-white">JD</div></div></header>
}

function ProgressBar({ value, tone = 'blue' }: { value: number; tone?: 'blue' | 'green' | 'yellow' }) { return <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${tone === 'green' ? 'bg-[var(--green)]' : tone === 'yellow' ? 'bg-[var(--yellow)]' : 'bg-[var(--blue)]'}`} style={{ width: `${value}%` }} /></div> }

function Dashboard({ setScreen }: { setScreen: (s: Screen) => void }) {
  return <div className="flex flex-col gap-8 p-5 lg:p-10"><section className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-[#e9f1ff] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--blue)]"><Sparkles className="size-3" /> Keep your momentum</p><h2 className="max-w-xl text-3xl font-bold tracking-tight text-[var(--navy)] md:text-4xl">Good morning, Jordan<span className="text-[var(--blue)]">.</span></h2><p className="mt-2 text-sm leading-6 text-slate-500">You&apos;re building a strong foundation. A little practice today goes a long way.</p></div><button onClick={() => setScreen('practice')} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--yellow)] px-4 py-3 text-sm font-bold text-[var(--navy)] shadow-sm transition-transform hover:-translate-y-0.5"><Play className="size-4 fill-current" /> Start practice exam</button></section>
    <section className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-[var(--navy)] p-5 text-white shadow-sm"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">Overall progress</p><p className="mt-4 text-4xl font-bold">68<span className="text-xl text-slate-300">%</span></p></div><Target className="size-5 text-[var(--yellow)]" /></div><ProgressBar value={68} tone="yellow" /><p className="mt-3 text-xs text-slate-300">12 of 18 topics reviewed</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Practice score</p><p className="mt-4 text-4xl font-bold text-[var(--navy)]">82<span className="text-xl text-slate-400">%</span></p></div><BarChart3 className="size-5 text-[var(--blue)]" /></div><ProgressBar value={82} /><p className="mt-3 text-xs text-slate-500">+6% from your last attempt</p></div><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between"><div><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Study streak</p><p className="mt-4 text-4xl font-bold text-[var(--navy)]">7<span className="ml-1 text-xl text-slate-400">days</span></p></div><Clock3 className="size-5 text-[var(--green)]" /></div><div className="mt-4 flex gap-1.5">{[1, 1, 1, 1, 1, 1, 1].map((_, i) => <span key={i} className="size-5 rounded-full bg-[var(--green)]" />)}</div><p className="mt-3 text-xs text-slate-500">Best streak: 12 days</p></div></section>
    <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]"><div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-[var(--navy)]">Continue learning</h3><p className="mt-1 text-xs text-slate-500">Pick up where you left off</p></div><button onClick={() => setScreen('reviewer')} className="text-xs font-bold text-[var(--blue)] hover:underline">View all</button></div><div className="mt-6 flex items-center gap-4 rounded-xl bg-slate-50 p-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f1ff] text-[var(--blue)]"><BookOpen className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold text-[var(--navy)]">Insurance Basics</p><span className="font-mono text-[11px] font-bold text-slate-400">72%</span></div><div className="mt-2"><ProgressBar value={72} /></div><p className="mt-2 text-xs text-slate-500">8 lessons · 24 min remaining</p></div><button onClick={() => setScreen('reviewer')} className="rounded-lg bg-[var(--navy)] p-2.5 text-white" aria-label="Continue Insurance Basics"><ArrowRight className="size-4" /></button></div><div className="mt-3 flex items-center gap-4 rounded-xl border border-slate-100 p-4"><div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#e9f8ed] text-[var(--green)]"><LockKeyhole className="size-5" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--navy)]">State Regulations</p><p className="mt-1 text-xs text-slate-500">Complete the previous section to unlock</p></div><span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Locked</span></div></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div><h3 className="font-bold text-[var(--navy)]">Recent activity</h3><p className="mt-1 text-xs text-slate-500">Your latest wins</p></div><button onClick={() => setScreen('progress')} className="text-xs font-bold text-[var(--blue)] hover:underline">See progress</button></div><div className="mt-6 flex flex-col gap-5">{[['Practice exam completed', '82% score', 'Today', 'bg-[#e9f8ed]', 'text-[var(--green)]'], ['Life & Health reviewed', 'Section complete', 'Yesterday', 'bg-[#e9f1ff]', 'text-[var(--blue)]'], ['Study streak extended', '7 days in a row', 'Yesterday', 'bg-[#fff7d6]', 'text-[var(--navy)]']].map(([title, detail, date, bg, text]) => <div key={title} className="flex gap-3"><div className={`flex size-8 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}><Check className="size-4" /></div><div className="min-w-0 flex-1"><p className="text-xs font-bold text-[var(--navy)]">{title}</p><p className="mt-0.5 text-[11px] text-slate-500">{detail}</p></div><span className="text-[10px] text-slate-400">{date}</span></div>)}</div></div></section>
  </div>
}

function Reviewer({ setScreen }: { setScreen: (s: Screen) => void }) {
  const sections = [{ title: 'Insurance Basics', desc: 'Core concepts, terms, and principles', progress: 72, lessons: '8 lessons', color: 'blue' }, { title: 'Life & Health', desc: 'Policies, provisions, and underwriting', progress: 48, lessons: '11 lessons', color: 'green' }, { title: 'Property & Casualty', desc: 'Coverage, claims, and risk management', progress: 25, lessons: '14 lessons', color: 'yellow' }, { title: 'State Regulations', desc: 'Compliance, ethics, and licensing rules', progress: 0, lessons: '9 lessons', color: 'blue' }]
  return <div className="flex flex-col gap-8 p-5 lg:p-10"><div><h2 className="text-3xl font-bold tracking-tight text-[var(--navy)]">Your reviewer</h2><p className="mt-2 text-sm text-slate-500">Master each topic before test day.</p></div><div className="grid gap-4 md:grid-cols-2">{sections.map((item, i) => <article key={item.title} className="group rounded-2xl border border-slate-200 bg-white p-6 transition-shadow hover:shadow-md"><div className="flex items-start justify-between gap-4"><div className={`flex size-11 items-center justify-center rounded-xl ${item.color === 'green' ? 'bg-[#e9f8ed] text-[var(--green)]' : item.color === 'yellow' ? 'bg-[#fff7d6] text-[var(--navy)]' : 'bg-[#e9f1ff] text-[var(--blue)]'}`}><BookOpen className="size-5" /></div><span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">0{i + 1}</span></div><h3 className="mt-6 font-bold text-[var(--navy)]">{item.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{item.desc}</p><div className="mt-5 flex items-center justify-between text-xs"><span className="font-semibold text-slate-500">{item.lessons}</span><span className="font-mono font-bold text-[var(--navy)]">{item.progress}%</span></div><div className="mt-2"><ProgressBar value={item.progress} tone={item.color as 'blue' | 'green' | 'yellow'} /></div><button onClick={() => setScreen('practice')} className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 py-2.5 text-xs font-bold text-[var(--navy)] transition-colors group-hover:border-[var(--blue)] group-hover:text-[var(--blue)]">{item.progress ? 'Continue section' : 'Start section'} <ArrowRight className="size-3.5" /></button></article>)}</div></div>
}

function Practice({ setScreen }: { setScreen: (s: Screen) => void }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [score, setScore] = useState(0)
  const question = questions[index]
  const choose = (id: string) => { if (!submitted) setSelected(id) }
  const next = () => { if (index < questions.length - 1) { setIndex(index + 1); setSelected(null); setSubmitted(false) } else setScreen('progress') }
  return <div className="flex flex-col gap-6 p-5 lg:p-10"><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--blue)]">Practice exam · Question {index + 1} of {questions.length}</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[var(--navy)]">Test your knowledge<span className="text-[var(--blue)]">.</span></h2></div><div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-500 shadow-sm ring-1 ring-slate-200"><Clock3 className="size-4 text-[var(--blue)]" /> 18:42 remaining</div></div><ProgressBar value={((index + (submitted ? 1 : 0)) / questions.length) * 100} /><div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-10"><div className="flex items-center justify-between"><span className="rounded-full bg-[#e9f1ff] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--blue)]">{question.section}</span><button className="text-slate-400 hover:text-[var(--navy)]" aria-label="More question options"><MoreHorizontal className="size-5" /></button></div><h3 className="mt-8 max-w-2xl text-xl font-bold leading-8 text-[var(--navy)] md:text-2xl">{question.prompt}</h3><div className="mt-8 flex flex-col gap-3">{question.answers.map((answer) => <button key={answer.id} onClick={() => choose(answer.id)} className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-colors ${selected === answer.id && !submitted ? 'border-[var(--blue)] bg-[#e9f1ff]' : submitted && answer.correct ? 'border-[var(--green)] bg-[#e9f8ed]' : submitted && selected === answer.id ? 'border-red-300 bg-red-50' : 'border-slate-200 hover:border-[var(--blue)] hover:bg-slate-50'}`}><span className={`flex size-7 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-bold ${selected === answer.id && !submitted ? 'border-[var(--blue)] bg-[var(--blue)] text-white' : submitted && answer.correct ? 'border-[var(--green)] bg-[var(--green)] text-white' : 'border-slate-300 text-slate-500'}`}>{answer.id.toUpperCase()}</span><span className="text-sm font-semibold text-[var(--navy)]">{answer.text}</span>{submitted && answer.correct && <Check className="ml-auto size-4 text-[var(--green)]" />}</button>)}</div>{submitted && <div className="mt-6 rounded-xl bg-[#e9f8ed] p-4"><p className="text-xs font-bold text-[var(--green)]">{selected && question.answers.find((a) => a.id === selected)?.correct ? 'Correct answer' : 'Review this one'}</p><p className="mt-1 text-xs leading-5 text-slate-600">{question.explanation}</p></div>}<div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6"><button onClick={() => setScreen('dashboard')} className="text-xs font-bold text-slate-500 hover:text-[var(--navy)]">Exit practice</button>{!submitted ? <button disabled={!selected} onClick={() => { setSubmitted(true); if (question.answers.find((a) => a.id === selected)?.correct) setScore(score + 1) }} className="rounded-lg bg-[var(--navy)] px-5 py-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40">Check answer</button> : <button onClick={next} className="inline-flex items-center gap-2 rounded-lg bg-[var(--yellow)] px-5 py-3 text-xs font-bold text-[var(--navy)]">{index === questions.length - 1 ? 'View results' : 'Next question'} <ArrowRight className="size-3.5" /></button>}</div></div></div>
}

function Progress({ setScreen }: { setScreen: (s: Screen) => void }) { return <div className="flex flex-col gap-8 p-5 lg:p-10"><div><h2 className="text-3xl font-bold tracking-tight text-[var(--navy)]">My progress</h2><p className="mt-2 text-sm text-slate-500">Your path to exam day, at a glance.</p></div><div className="grid gap-4 md:grid-cols-3"><div className="rounded-2xl bg-[var(--navy)] p-6 text-white"><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-300">Average score</p><p className="mt-3 text-4xl font-bold">82%</p><p className="mt-2 text-xs text-slate-300">Passing score is 70%</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Questions answered</p><p className="mt-3 text-4xl font-bold text-[var(--navy)]">146</p><p className="mt-2 text-xs text-slate-500">32 this week</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Study time</p><p className="mt-3 text-4xl font-bold text-[var(--navy)]">11.5<span className="text-xl text-slate-400">h</span></p><p className="mt-2 text-xs text-slate-500">+2.4h from last week</p></div></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><h3 className="font-bold text-[var(--navy)]">Topic mastery</h3><button onClick={() => setScreen('reviewer')} className="text-xs font-bold text-[var(--blue)]">Review topics</button></div><div className="mt-6 flex flex-col gap-5">{[['Insurance Basics', 72, 'blue'], ['Life & Health', 48, 'green'], ['Property & Casualty', 25, 'yellow'], ['State Regulations', 8, 'blue']].map(([name, value, tone]) => <div key={name}><div className="mb-2 flex justify-between text-xs font-bold text-[var(--navy)]"><span>{name}</span><span>{value}%</span></div><ProgressBar value={value as number} tone={tone as 'blue' | 'green' | 'yellow'} /></div>)}</div></div></div> }

function Incorrect({ setScreen }: { setScreen: (s: Screen) => void }) { return <div className="flex flex-col gap-8 p-5 lg:p-10"><div><h2 className="text-3xl font-bold tracking-tight text-[var(--navy)]">Incorrect answers</h2><p className="mt-2 text-sm text-slate-500">Turn mistakes into your strongest topics.</p></div><div className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between border-b border-slate-100 pb-5"><div><p className="font-bold text-[var(--navy)]">4 questions to review</p><p className="mt-1 text-xs text-slate-500">Last updated after your practice exam</p></div><button onClick={() => setScreen('practice')} className="rounded-lg bg-[var(--yellow)] px-4 py-2.5 text-xs font-bold text-[var(--navy)]">Practice these</button></div><div className="flex flex-col divide-y divide-slate-100">{questions.slice(0, 3).map((question, i) => <div key={question.id} className="flex items-center gap-4 py-5"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-red-50 font-mono text-xs font-bold text-red-500">{i + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[var(--navy)]">{question.prompt}</p><p className="mt-1 text-xs text-slate-500">{question.section} · Missed yesterday</p></div><ChevronDown className="size-4 rotate-[-90deg] text-slate-400" /></div>)}</div></div></div> }

export default function Page() {
  const [screen, setScreen] = useState<Screen>('dashboard')
  const [menuOpen, setMenuOpen] = useState(false)
  const title = useMemo(() => navItems.find((item) => item.id === screen)?.label ?? 'Dashboard', [screen])
  return <div className="min-h-screen bg-[#f7f9fc]"><div className="flex min-h-screen"><Sidebar screen={screen} setScreen={setScreen} open={menuOpen} close={() => setMenuOpen(false)} /><div className="flex min-w-0 flex-1 flex-col"><Header title={title} onMenu={() => setMenuOpen(true)} /><main className="flex-1">{screen === 'dashboard' && <Dashboard setScreen={setScreen} />}{screen === 'reviewer' && <Reviewer setScreen={setScreen} />}{screen === 'practice' && <Practice setScreen={setScreen} />}{screen === 'progress' && <Progress setScreen={setScreen} />}{screen === 'incorrect' && <Incorrect setScreen={setScreen} />}</main></div></div>{menuOpen && <button aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-20 bg-[var(--navy)]/20 lg:hidden" />}</div>
}
