import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useCallback, useEffect, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import ResponsiveImage from "../components/ResponsiveImage";
import { preloadPortfolioProject } from "../features/portfolio/projects/portfolioProjectModules";
import {
  loadPortfolioCover,
  type PortfolioCoverOrientation,
} from "../features/portfolio/projects/portfolioCovers";
import type { PortfolioProjectSummary } from "../features/portfolio/projects/portfolioProjects";
import type { Photo } from "../features/portfolio/photoTypes";

const MOBILE_COVER_MEDIA_QUERY = "(max-width: 639px)";
const COVER_REVEAL_EASE = [0.22, 0.61, 0.36, 1] as const;
const INITIAL_COVER_PRELOAD_LIMIT = 4;

interface PortfolioMenuProps {
  readonly isOpen: boolean;
  readonly projects: readonly PortfolioProjectSummary[];
  readonly reduceMotion: boolean;
  readonly transitionSeconds: number;
  readonly onClose: () => void;
  readonly onNavigate: (path: string) => void;
  readonly onNavigationComplete: () => void;
  readonly preloadProject?: (slug: string) => Promise<boolean>;
}

function isModifiedActivation(event: ReactMouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.altKey ||
    event.ctrlKey ||
    event.shiftKey
  );
}

export default function PortfolioMenu({
  isOpen,
  projects,
  reduceMotion,
  transitionSeconds,
  onClose,
  onNavigate,
  onNavigationComplete,
  preloadProject = preloadPortfolioProject,
}: PortfolioMenuProps) {
  const location = useLocation();
  const [activeProjectId, setActiveProjectId] = useState<string>();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const [orientation, setOrientation] = useState<PortfolioCoverOrientation>();
  const [covers, setCovers] = useState<Record<string, Photo | undefined>>({});
  const [isNavigating, setIsNavigating] = useState(false);
  const [coverPreloadCount, setCoverPreloadCount] = useState(0);
  const readyCoverKeysRef = useRef(new Set<string>());
  const readyProjectIdsRef = useRef(new Set<string>());
  const loadingProjectIdsRef = useRef(new Set<string>());
  const selectedProjectIdRef = useRef<string>();
  const orientationRef = useRef<PortfolioCoverOrientation>();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const currentLocationKeyRef = useRef(location.key);
  const openedLocationKeyRef = useRef<string>();
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const restoreFocusRef = useRef(false);
  const displayedProjectId = selectedProjectId ?? activeProjectId;

  const revealSelectedProjectIfReady = useCallback((projectId: string) => {
    const currentOrientation = orientationRef.current;
    if (
      selectedProjectIdRef.current === projectId &&
      currentOrientation &&
      readyProjectIdsRef.current.has(projectId) &&
      readyCoverKeysRef.current.has(`${projectId}:${currentOrientation}`)
    ) {
      setIsNavigating(true);
    }
  }, []);

  const markCoverReady = useCallback(
    (projectId: string, coverOrientation: PortfolioCoverOrientation) => {
      readyCoverKeysRef.current.add(`${projectId}:${coverOrientation}`);
      revealSelectedProjectIfReady(projectId);
      if (coverOrientation !== orientationRef.current) return;
      setCoverPreloadCount((count) => {
        let next = count;
        while (
          next > 0 &&
          next < Math.min(projects.length, INITIAL_COVER_PRELOAD_LIMIT) &&
          readyCoverKeysRef.current.has(
            `${projects[next - 1]?.id}:${coverOrientation}`,
          )
        ) {
          next += 1;
        }
        return next;
      });
    },
    [projects, revealSelectedProjectIfReady],
  );

  useEffect(() => {
    const startWarming = () =>
      setCoverPreloadCount((count) => Math.max(count, 1));
    if (document.readyState === "complete") startWarming();
    else window.addEventListener("load", startWarming, { once: true });
    return () => window.removeEventListener("load", startWarming);
  }, []);

  useEffect(() => {
    const project = projects[coverPreloadCount - 1];
    if (
      project &&
      orientation &&
      readyCoverKeysRef.current.has(`${project.id}:${orientation}`)
    ) {
      markCoverReady(project.id, orientation);
    }
  }, [coverPreloadCount, covers, markCoverReady, orientation, projects]);

  const prepareProject = useCallback(
    (project: PortfolioProjectSummary) => {
      if (
        readyProjectIdsRef.current.has(project.id) ||
        loadingProjectIdsRef.current.has(project.id)
      ) {
        revealSelectedProjectIfReady(project.id);
        return;
      }

      loadingProjectIdsRef.current.add(project.id);
      void preloadProject(project.slug).then(
        (loaded) => {
          loadingProjectIdsRef.current.delete(project.id);
          if (!loaded) return;
          readyProjectIdsRef.current.add(project.id);
          revealSelectedProjectIfReady(project.id);
        },
        () => loadingProjectIdsRef.current.delete(project.id),
      );
    },
    [preloadProject, revealSelectedProjectIfReady],
  );

  useEffect(() => {
    currentLocationKeyRef.current = location.key;
  }, [location.key]);

  useEffect(() => {
    if (!isOpen) return;

    const dialog = dialogRef.current;
    openedLocationKeyRef.current = currentLocationKeyRef.current;
    if (!restoreFocusRef.current) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    }
    restoreFocusRef.current = true;
    document.documentElement.classList.add("modal-open");
    if (dialog && !dialog.open) dialog.showModal();
    dialog?.focus({ preventScroll: true });
  }, [isOpen]);

  useEffect(
    () => () => document.documentElement.classList.remove("modal-open"),
    [],
  );

  useEffect(() => {
    const media = window.matchMedia(MOBILE_COVER_MEDIA_QUERY);
    let current = true;
    const loadCovers = async () => {
      const nextOrientation = media.matches ? "portrait" : "landscape";
      orientationRef.current = nextOrientation;
      setOrientation(nextOrientation);
      setCovers({});
      setCoverPreloadCount((count) => Math.min(count, 1));
      readyCoverKeysRef.current.clear();
      const loadedCovers = await Promise.all(
        projects.map(
          async (project) =>
            [
              project.id,
              await loadPortfolioCover(project, nextOrientation).catch(
                () => undefined,
              ),
            ] as const,
        ),
      );
      if (!current) return;
      setCovers(Object.fromEntries(loadedCovers));
      loadedCovers.forEach(([projectId, cover]) => {
        if (!cover) markCoverReady(projectId, nextOrientation);
      });
    };

    void loadCovers();
    media.addEventListener("change", loadCovers);

    return () => {
      current = false;
      media.removeEventListener("change", loadCovers);
    };
  }, [markCoverReady, projects]);

  return createPortal(
    <AnimatePresence
      onExitComplete={() => {
        if (dialogRef.current?.open) dialogRef.current.close();
        document.documentElement.classList.remove("modal-open");
        if (
          restoreFocusRef.current &&
          openedLocationKeyRef.current === currentLocationKeyRef.current
        ) {
          previouslyFocusedRef.current?.focus({ preventScroll: true });
        } else {
          onNavigationComplete();
        }
        restoreFocusRef.current = false;
        previouslyFocusedRef.current = null;
        openedLocationKeyRef.current = undefined;
        setActiveProjectId(undefined);
        setSelectedProjectId(undefined);
        selectedProjectIdRef.current = undefined;
        setIsNavigating(false);
      }}
    >
      {orientation && (
        <div
          key="cover-preloads"
          aria-hidden="true"
          className="pointer-events-none fixed -top-px -left-px h-px w-px overflow-hidden opacity-0"
        >
          {projects.slice(0, coverPreloadCount).map((project) => {
            const cover = covers[project.id];
            if (!cover) return null;

            return (
              <div
                key={`${project.id}-${orientation}`}
                data-portfolio-cover-preload="true"
              >
                <ResponsiveImage
                  {...cover}
                  sizes="100vw"
                  loading="eager"
                  fetchPriority="low"
                  alt=""
                  onLoad={() => markCoverReady(project.id, orientation)}
                  onError={() => markCoverReady(project.id, orientation)}
                />
              </div>
            );
          })}
        </div>
      )}
      {isOpen && (
        <m.dialog
          key="portfolio-dialog"
          ref={dialogRef}
          aria-label="Portfolios"
          tabIndex={-1}
          className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none border-0 bg-transparent p-0 text-text backdrop:bg-transparent"
          initial={reduceMotion ? false : { clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={
            reduceMotion || isNavigating
              ? { opacity: 0 }
              : { clipPath: "inset(0 0 100% 0)" }
          }
          transition={{
            duration: reduceMotion
              ? 0
              : isNavigating
                ? 0.18
                : transitionSeconds,
            ease: "easeInOut",
          }}
          onCancel={(event) => {
            event.preventDefault();
            onClose();
          }}
        >
          <nav
            id="portfolio-menu"
            aria-label="Portfolios"
            data-portfolio-menu="true"
            className={`fixed inset-0 z-[80] isolate overflow-hidden ${
              isNavigating ? "bg-transparent" : "bg-canvas"
            }`}
            data-navigating={isNavigating ? "true" : undefined}
            onPointerDown={(event) => {
              if (!(event.target as Element).closest("a")) onClose();
            }}
          >
            <button
              type="button"
              aria-label="Close portfolios"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={onClose}
              className="absolute top-2 right-4 z-20 grid h-11 w-11 cursor-pointer place-items-center
                         text-text opacity-90 hover:opacity-100 focus-visible:opacity-100"
            >
              <span
                aria-hidden="true"
                className="absolute h-px w-6 rotate-45 bg-current"
              />
              <span
                aria-hidden="true"
                className="absolute h-px w-6 -rotate-45 bg-current"
              />
            </button>
            <AnimatePresence>
              {displayedProjectId &&
                orientation &&
                covers[displayedProjectId] && (
                  <m.div
                    key={`${displayedProjectId}-${orientation}`}
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0"
                    data-portfolio-cover="true"
                    initial={
                      reduceMotion ? false : { clipPath: "inset(0 50% 0 50%)" }
                    }
                    animate={{ clipPath: "inset(0 0% 0 0%)" }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { clipPath: "inset(0 50% 0 50%)" }
                    }
                    transition={{
                      duration: reduceMotion ? 0 : transitionSeconds,
                      ease: COVER_REVEAL_EASE,
                    }}
                  >
                    <ResponsiveImage
                      {...covers[displayedProjectId]}
                      sizes="100vw"
                      loading="eager"
                      fetchPriority="high"
                      alt=""
                      pictureClassName="block h-full w-full"
                      className="h-full w-full object-cover"
                      onLoad={() =>
                        markCoverReady(displayedProjectId, orientation)
                      }
                      onError={() =>
                        markCoverReady(displayedProjectId, orientation)
                      }
                    />
                    <m.div
                      animate={{
                        clipPath: isNavigating
                          ? "inset(0 50% 0 50%)"
                          : "inset(0 0% 0 0%)",
                      }}
                      className="absolute inset-0 bg-canvas/35"
                      transition={{
                        duration: reduceMotion ? 0 : transitionSeconds,
                        ease: "easeInOut",
                      }}
                    />
                  </m.div>
                )}
            </AnimatePresence>

            <m.div
              animate={isNavigating ? "navigating" : "visible"}
              aria-hidden={isNavigating ? true : undefined}
              className="relative z-10 mx-auto flex h-full w-[80vw] flex-col justify-center"
              data-portfolio-labels="true"
              onAnimationComplete={(definition) => {
                if (definition === "navigating") onClose();
              }}
              transition={{
                duration: reduceMotion ? 0 : transitionSeconds,
                ease: "easeInOut",
              }}
              variants={{
                navigating: {
                  clipPath: "inset(0 50% 0 50%)",
                  opacity: 0,
                },
                visible: { clipPath: "inset(0 0% 0 0%)", opacity: 1 },
              }}
            >
              {projects.map((project) => (
                <Link
                  key={project.id}
                  to={project.route}
                  aria-label={project.title}
                  onPointerEnter={() => {
                    setActiveProjectId(project.id);
                    prepareProject(project);
                  }}
                  onPointerLeave={() => setActiveProjectId(undefined)}
                  onPointerDown={() => {
                    setActiveProjectId(project.id);
                    prepareProject(project);
                  }}
                  onFocus={() => {
                    setActiveProjectId(project.id);
                    prepareProject(project);
                  }}
                  onBlur={() => setActiveProjectId(undefined)}
                  onClick={(event) => {
                    if (event.defaultPrevented || isModifiedActivation(event)) {
                      return;
                    }

                    event.preventDefault();
                    restoreFocusRef.current = false;
                    selectedProjectIdRef.current = project.id;
                    setSelectedProjectId(project.id);
                    prepareProject(project);
                    revealSelectedProjectIfReady(project.id);
                    onNavigate(project.route);
                  }}
                  className="flex min-h-0 flex-1 items-center justify-center text-center uppercase font-photo-number text-[clamp(3rem,min(18vw,26vh),18rem)] leading-none text-text [text-shadow:0_3px_12px_rgb(0_0_0_/_0.7)] hover:text-focus focus-visible:text-focus focus-visible:outline-none"
                >
                  {project.title}
                </Link>
              ))}
            </m.div>
          </nav>
        </m.dialog>
      )}
    </AnimatePresence>,
    document.body,
  );
}
