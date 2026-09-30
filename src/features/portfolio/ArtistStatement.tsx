import { useReducedMotion } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef } from "react";

interface ArtistStatementProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}

export default function ArtistStatement({
  isOpen,
  onClose,
}: ArtistStatementProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const closeTimeoutRef = useRef<number | null>(null);
  const closeScrollEndRef = useRef<(() => void) | null>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      if (closeScrollEndRef.current !== null) {
        window.removeEventListener("scrollend", closeScrollEndRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const frame = window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, reduceMotion]);

  const close = () => {
    if (reduceMotion) {
      onClose();
      return;
    }
    if (closeTimeoutRef.current !== null) return;

    const panelTop =
      (panelRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY;
    const finishClose = () => {
      onClose();
      closeTimeoutRef.current = null;
    };
    if (Math.abs(window.scrollY - panelTop) < 2) {
      closeTimeoutRef.current = window.setTimeout(finishClose, 100);
      return;
    }

    const finishScroll = () => {
      window.removeEventListener("scrollend", finishScroll);
      closeScrollEndRef.current = null;
      if (closeTimeoutRef.current !== null) {
        window.clearTimeout(closeTimeoutRef.current);
      }
      closeTimeoutRef.current = window.setTimeout(finishClose, 100);
    };
    closeScrollEndRef.current = finishScroll;
    window.addEventListener("scrollend", finishScroll, { once: true });
    sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    closeTimeoutRef.current = window.setTimeout(finishScroll, 2500);
  };

  return (
    <div
      ref={panelRef}
      aria-hidden={!isOpen}
      className="overflow-hidden [overflow-anchor:none]"
    >
      <m.div
        initial={false}
        animate={reduceMotion ? false : { height: isOpen ? "auto" : 0 }}
        style={reduceMotion ? { height: isOpen ? "auto" : 0 } : {}}
        onUpdate={() => {
          if (!isOpen || reduceMotion) return;
          sectionRef.current?.scrollIntoView({
            behavior: "auto",
            block: "start",
          });
        }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: isOpen ? 1.25 : 0.75, ease: "easeInOut" }
        }
      >
        <m.section
          ref={sectionRef}
          id="artist-statement"
          aria-labelledby="artist-statement-title"
          className="min-h-screen border-t border-border bg-surface"
          initial={false}
          animate={
            reduceMotion
              ? false
              : { opacity: isOpen ? 1 : 0, y: isOpen ? 0 : "-18vh" }
          }
          style={reduceMotion ? { opacity: isOpen ? 1 : 0 } : {}}
          transition={
            reduceMotion
              ? { duration: 0 }
              : isOpen
                ? {
                    opacity: { duration: 0 },
                    y: { duration: 0 },
                  }
                : { duration: 0.75, ease: "easeInOut" }
          }
        >
          <div className="reading-container py-20 sm:py-28">
            <h2
              id="artist-statement-title"
              className="font-display text-[clamp(1.9rem,5vw,4rem)] leading-none whitespace-nowrap text-text"
            >
              Artist Statement
            </h2>

            <div className="mt-10 space-y-7 font-inter text-[clamp(1rem,3vw,1.25rem)] leading-8 text-text-muted sm:space-y-9 sm:leading-9">
              <p>
                Entropy. Chaos. The second law of thermodynamics stands as a
                principal tenet to the fabric of our universe: the disorder of
                particles continually increases with each passing second. And
                when I looked back at my combined body of work, that’s all I
                could see: mayhem.
              </p>
              <p>
                Yet, within the chaos of my work, much like the universe, there
                is a beauty that cannot be described. Every family member, every
                friend, every love, every enemy, and every historical figure who
                has come and gone lived on this <em>single</em> planet among an
                inconceivable number of other possibilities. How? How did the
                Earth hit the lottery millions of times over? How can I go
                outside and find so many marvelings of nature juxtaposed with
                the horrors of human intervention? Was I placed here through
                sheer coincidence or predestination?
              </p>
              <p>
                When I was tasked with providing words for my work, I could not
                find any. I was met with more chaos. Static.
              </p>
              <p>
                I felt it was easier to show a glimpse into how my mind works.
                Each photo is arranged in chronological order from the day they
                were taken. You can see my progression as I come up with new
                ideas and experiments. You can see how one successful scheme
                bleeds into the next. You can see my progression from the inside
                to the outdoors in both a figurative and literal sense.
              </p>
              <p>
                These photos are jarring, disorienting, and perplexing, yet
                these photos hold an undeniable majesty to them. The sun manages
                to sparkle through the paper, bouncing off water droplets stuck
                in an endless freefall. The jagged, sharp geometry both tears
                through the scenes and adds a contained order to each photo. How
                can I describe my photos? I describe them as the universe from
                whence they came—a relentless whirlwind of possibilities that
                happened to align perfectly, resulting in something delightful
                and endlessly intriguing.
              </p>
              <p>
                And I find myself attempting to establish where I fit into this
                mess at the center of it all.
              </p>
            </div>

            <button
              type="button"
              disabled={!isOpen}
              onClick={close}
              className="mt-14 rounded-sm font-inter text-sm tracking-[0.16em] text-brand-warm uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-focus focus-visible:text-focus"
            >
              Close statement
            </button>
          </div>
        </m.section>
      </m.div>
    </div>
  );
}
