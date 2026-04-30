import {
  FaBackwardStep,
  FaCirclePlay,
  FaForwardStep,
  FaShuffle,
  FaRepeat,
  FaVolumeHigh,
  FaHeart,
  FaDesktop,
  FaListUl,
} from "react-icons/fa6";

export default function AudioPlayer() {
  return (
    <div className="h-15 border-t border-neutral-800 rounded-t-xl bg-[#181818] px-4 text-white shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
      <div className="mx-auto grid h-full grid-cols-[minmax(180px,1.2fr)_minmax(240px,1.5fr)_minmax(180px,1fr)] items-center gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded bg-neutral-700 shadow-inner" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">No song playing</p>
            <p className="truncate text-xs text-neutral-400">Spotify Clone</p>
          </div>
          <button
            type="button"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Like"
          >
            <FaHeart className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-0.5 pt-1.5">
          <div className="flex items-center gap-3 text-neutral-300">
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Shuffle"
            >
              <FaShuffle className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Previous"
            >
              <FaBackwardStep className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black transition hover:scale-105"
              aria-label="Play"
            >
              <FaCirclePlay className="h-6 w-6" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Next"
            >
              <FaForwardStep className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
              aria-label="Repeat"
            >
              <FaRepeat className="h-4 w-4" />
            </button>
          </div>

          <div className="flex w-full items-center gap-2 text-[11px] text-neutral-400">
            <span>0:00</span>
            <div className="h-1 flex-1 rounded-full bg-neutral-700">
              <div className="h-1 w-1/4 rounded-full bg-green-900" />
            </div>
            <span>0:00</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 text-neutral-300">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            aria-label="Queue"
          >
            <FaListUl className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            aria-label="Device"
          >
            <FaDesktop className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-white/10 hover:text-white"
            aria-label="Volume"
          >
            <FaVolumeHigh className="h-4 w-4" />
          </button>
          <div className="w-24">
            <div className="h-1 rounded-full bg-neutral-700">
              <div className="h-1 w-3/5 rounded-full bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
