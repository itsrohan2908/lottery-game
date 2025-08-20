// Lottery.jsx
import { useState, useMemo, useRef, useEffect } from 'react';
import { genTicket, getConditionFn } from './helper';
import Ticket from './Ticket';
import './Lottery.css';

const CONDITION_OPTIONS = [
  { value: 'sum-equals', label: 'Sum equals (enter value)' },
  { value: 'all-even', label: 'All even numbers' },
  { value: 'palindrome', label: 'Palindrome (e.g., 121)' },
  { value: 'all-same', label: 'All digits the same' },
  { value: 'increasing', label: 'Strictly increasing digits' },
  { value: 'repeats', label: 'Has repeated digits' },
  { value: 'contains-digit', label: 'Contains digit (enter digit)' },
];

export default function Lottery({ n = 3 }) {
  // tickets
  const [ticket, setTicket] = useState(() => genTicket(n));
  // condition & parameter
  const [condition, setCondition] = useState('sum-equals');
  const [param, setParam] = useState(15);

  // dropdown state
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);

  const wrapperRef = useRef(null);
  const listRef = useRef(null);

  // predicate computed from condition + param
  const predicate = useMemo(() => getConditionFn(condition, param), [condition, param]);
  const isWinning = predicate(ticket);

  // actions
  const buyTicket = () => setTicket(genTicket(n));

  // select a condition (set sensible defaults for param)
  const handleConditionSelect = (value) => {
    setCondition(value);
    setOpen(false);
    if (value === 'sum-equals') setParam(15);
    else if (value === 'contains-digit') setParam(7);
    else setParam('');
  };

  // close on outside pointer
  useEffect(() => {
    const onPointer = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('pointerdown', onPointer);
    return () => document.removeEventListener('pointerdown', onPointer);
  }, []);

  // keyboard nav when open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setHighlight(h => Math.min(h + 1, CONDITION_OPTIONS.length - 1));
        scrollIntoView(highlight + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setHighlight(h => Math.max(h - 1, 0));
        scrollIntoView(highlight - 1);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const sel = CONDITION_OPTIONS[highlight];
        if (sel) handleConditionSelect(sel.value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, highlight]);

  function scrollIntoView(index) {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-index="${index}"]`);
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  // when opening, set highlight to currently active condition
  useEffect(() => {
    if (open) {
      const idx = CONDITION_OPTIONS.findIndex(c => c.value === condition);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, condition]);

  // helpers to validate param fields
  const isSumInvalid = () => typeof param === 'number' ? param < 0 : param === '';
  const isDigitInvalid = () => param === '' || !Number.isInteger(param) || param < 0 || param > 9;

  return (
    <div className={`lottery-container${isWinning ? ' win' : ''}`}>
      <h1>Welcome to the Lottery Game</h1>

      <div className="controls" aria-label="winning conditions">
        <div className="custom-select-wrapper" ref={wrapperRef}>
          <button
            type="button"
            className={`select-trigger ${open ? 'open' : ''}`}
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setOpen(true);
                setHighlight(h => Math.min(h + 1, CONDITION_OPTIONS.length - 1));
              }
            }}
          >
            <span className="trigger-label">
              {CONDITION_OPTIONS.find(c => c.value === condition)?.label}
            </span>
            <svg className="chev" width="16" height="16" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M5 7.5 L10 12.5 L15 7.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {open && (
            <ul
              id="condition-list"
              ref={listRef}
              className="select-list"
              role="listbox"
              aria-activedescendant={`opt-${highlight}`}
            >
              {CONDITION_OPTIONS.map((opt, idx) => (
                <li
                  key={opt.value}
                  id={`opt-${idx}`}
                  data-index={idx}
                  role="option"
                  aria-selected={opt.value === condition}
                  className={`select-item ${highlight === idx ? 'highlight' : ''} ${opt.value === condition ? 'selected' : ''}`}
                  onMouseEnter={() => setHighlight(idx)}
                  onClick={() => handleConditionSelect(opt.value)}
                >
                  <span className="item-label">{opt.label}</span>
                  {opt.value === condition && <span className="item-check">✓</span>}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Param input kept inline with dropdown (same row) */}
        {(condition === 'sum-equals') && (
          <label className="param inline" aria-label="sum value">
            <span className="param-label">Sum</span>
            <input
              className={`param-input ${isSumInvalid() ? 'invalid' : ''}`}
              type="number"
              value={param}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') return setParam('');
                const v = Number(raw);
                setParam(Number.isNaN(v) ? '' : v);
              }}
              min="0"
              aria-describedby="sum-note"
            />
            <small id="sum-note" className="param-note">Enter target total (0 or higher)</small>
          </label>
        )}

        {(condition === 'contains-digit') && (
          <label className="param inline" aria-label="digit value">
            <span className="param-label">Digit</span>
            <input
              className={`param-input ${isDigitInvalid() ? 'invalid' : ''}`}
              type="number"
              value={param}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === '') return setParam('');
                const v = Number(raw);
                setParam(Number.isNaN(v) ? '' : v);
              }}
              min="0"
              max="9"
              aria-describedby="digit-note"
            />
            <small id="digit-note" className="param-note">Choose a single digit (0–9)</small>
          </label>
        )}
      </div>

      <Ticket ticket={ticket} isWinning={isWinning} />

      <div className="actions">
        <button
          onClick={buyTicket}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty('--x', `${x}px`);
            e.currentTarget.style.setProperty('--y', `${y}px`);
          }}
        >
          Buy Ticket
        </button>
      </div>

      {isWinning && <div className="confetti" aria-hidden="true" /> }
      <h3>{isWinning ? "🎉 Congratulations! You won!" : "Try again — buy a ticket!"}</h3>
    </div>
  );
}
