'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Bot, Gamepad2, RotateCcw, UserRound, Users } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

type Cell = 'X' | 'O' | null;
type Mode = 'solo' | 'duo';

const wins = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

const winnerOf = (board: Cell[]): Cell => {
  for (const [a, b, c] of wins) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
  }
  return null;
};

const winningMove = (board: Cell[], mark: Cell) => {
  for (const line of wins) {
    const values = line.map((index) => board[index]);
    if (values.filter((value) => value === mark).length === 2 && values.includes(null)) {
      return line[values.indexOf(null)];
    }
  }
  return -1;
};

const chooseAiMove = (board: Cell[]) => {
  const win = winningMove(board, 'O');
  if (win >= 0) return win;

  const block = winningMove(board, 'X');
  if (block >= 0) return block;

  if (!board[4]) return 4;

  const corners = [0, 2, 6, 8].filter((index) => !board[index]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];

  const empty = board.map((cell, index) => (cell ? -1 : index)).filter((index) => index >= 0);
  return empty[Math.floor(Math.random() * empty.length)];
};

export function TableGameView() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode | null>(null);
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [turn, setTurn] = useState<'X' | 'O'>('X');
  const [aiThinking, setAiThinking] = useState(false);
  const aiTimer = useRef<number | null>(null);

  const winner = winnerOf(board);
  const full = board.every(Boolean);

  const clearAiTimer = () => {
    if (aiTimer.current !== null) {
      window.clearTimeout(aiTimer.current);
      aiTimer.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (aiTimer.current !== null) window.clearTimeout(aiTimer.current);
    };
  }, []);

  const resetBoard = () => {
    clearAiTimer();
    setBoard(Array(9).fill(null));
    setTurn('X');
    setAiThinking(false);
  };

  const chooseMode = (nextMode: Mode) => {
    resetBoard();
    setMode(nextMode);
  };

  const play = (index: number) => {
    if (!mode || board[index] || winner || full || aiThinking) return;
    if (mode === 'solo' && turn !== 'X') return;

    const next = [...board];
    next[index] = turn;
    setBoard(next);

    if (winnerOf(next) || next.every(Boolean)) return;

    if (mode === 'duo') {
      setTurn(turn === 'X' ? 'O' : 'X');
      return;
    }

    setTurn('O');
    setAiThinking(true);
    aiTimer.current = window.setTimeout(() => {
      const afterAi = [...next];
      const move = chooseAiMove(afterAi);
      if (move >= 0) afterAi[move] = 'O';
      setBoard(afterAi);
      setTurn('X');
      setAiThinking(false);
      aiTimer.current = null;
    }, 450);
  };

  const statusText = winner
    ? mode === 'solo'
      ? winner === 'X'
        ? t('youWin')
        : t('computerWins')
      : `${winner === 'X' ? t('playerX') : t('playerO')} ${t('wins')}!`
    : full
      ? t('draw')
      : aiThinking
        ? t('computerThinking')
        : mode === 'solo'
          ? t('yourTurn')
          : `${t('yourTurn')}: ${turn === 'X' ? t('playerX') : t('playerO')}`;

  const playerOneLabel = mode === 'solo' ? t('you') : t('playerX');
  const playerTwoLabel = mode === 'solo' ? t('computer') : t('playerO');

  return (
    <Card className="border-slate-200 bg-[#FFFFFF] shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-black text-[#0F172A]">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F59E0B]/15 text-[#B45309]">
            <Gamepad2 className="h-4 w-4" />
          </span>
          {t('games')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        {!mode ? (
          <div className="space-y-3">
            <p className="text-center text-xs font-bold text-[#64748B]">{t('chooseMode')}</p>

            <button
              type="button"
              onClick={() => chooseMode('solo')}
              className="flex w-full items-center gap-3 rounded-2xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 p-4 text-left transition hover:border-[#F59E0B]/60 hover:bg-[#F59E0B]/15"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F59E0B]/15 text-[#B45309]">
                <UserRound className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[#0F172A]">{t('soloPlay')}</span>
                <span className="mt-0.5 block text-[11px] font-semibold text-[#64748B]">
                  {t('vsComputer')}
                </span>
              </span>
              <Bot className="h-5 w-5 shrink-0 text-[#B45309]" />
            </button>

            <button
              type="button"
              onClick={() => chooseMode('duo')}
              className="flex w-full items-center gap-3 rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4 text-left transition hover:border-sky-400/60 hover:bg-sky-500/15"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600">
                <Users className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-black text-[#0F172A]">{t('twoPlayers')}</span>
                <span className="mt-0.5 block text-[11px] font-semibold text-[#64748B]">
                  {t('sameTable')}
                </span>
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  resetBoard();
                  setMode(null);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#64748B] transition hover:text-[#0F172A]"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> {t('changeMode')}
              </button>
              <span className="rounded-full border border-slate-200 bg-[#F1F5F9] px-2.5 py-1 text-[10px] font-bold text-[#334155]">
                {mode === 'solo' ? t('soloPlay') : t('twoPlayers')}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-[#F59E0B]/25 bg-[#F59E0B]/10 px-2 py-2 text-[#B45309]">
                <span className="text-sm font-black">X</span> {playerOneLabel}
              </div>
              <div className="flex items-center justify-center gap-1.5 rounded-xl border border-sky-500/25 bg-sky-500/10 px-2 py-2 text-sky-600">
                <span className="text-sm font-black">O</span> {playerTwoLabel}
              </div>
            </div>

            <p className="text-center text-xs font-bold text-[#64748B]">{statusText}</p>

            <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
              {board.map((cell, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => play(index)}
                  disabled={aiThinking || !!winner || full}
                  className={`flex aspect-square items-center justify-center rounded-2xl border text-3xl font-black transition disabled:cursor-not-allowed ${
                    cell === 'X'
                      ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#B45309]'
                      : cell === 'O'
                        ? 'border-sky-500/40 bg-sky-500/10 text-sky-600'
                        : 'border-slate-200 bg-[#F1F5F9] text-[#0F172A] hover:border-[#F59E0B]/40'
                  }`}
                >
                  {cell}
                </button>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={resetBoard}
              className="w-full border-slate-200 bg-[#F1F5F9] font-bold text-[#E2E8F0]"
            >
              <RotateCcw className="mr-1.5 h-4 w-4" /> {t('playAgain')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
