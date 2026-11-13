import { useEffect, useRef } from "react";
import type { Diagnosis } from "./data";

const W = 96;
const ROW = 220;
const x = (i: number) => (i % 2 === 0 ? 30 : W - 30);
const y = (i: number) => ROW * i + ROW / 2;
const href = (i: number) => `#/step/${i + 1}`;

export default function Roadmap({ d }: { d: Diagnosis }) {
  const n = d.steps.length;
  const roadRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const carRef = useRef<SVGGElement>(null);
  const movingRoadRef = useRef<SVGGElement>(null);
  const dashesRef = useRef<SVGPathElement>(null);

  // The road moves vertically (never sideways), and the car follows that road.
  useEffect(() => {
    const road = roadRef.current;
    const path = pathRef.current;
    const car = carRef.current;
    const movingRoad = movingRoadRef.current;
    const dashes = dashesRef.current;
    if (!road || !path || !car || !movingRoad || !dashes) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const length = path.getTotalLength();
    const roadHeight = ROW * n;
    let frame = 0;
    let currentY = 0;
    let targetY = 0;
    let currentShift = 0;
    let targetShift = 0;
    let currentDash = 0;
    let targetDash = 0;
    let initialized = false;

    // The path is always descending. Find the point at the requested road height,
    // rather than estimating it from the length of the winding curves.
    const distanceAtY = (wantedY: number) => {
      let low = 0;
      let high = length;
      for (let i = 0; i < 18; i++) {
        const mid = (low + high) / 2;
        if (path.getPointAtLength(mid).y < wantedY) low = mid;
        else high = mid;
      }
      return (low + high) / 2;
    };

    const renderCar = (positionY: number) => {
      const distance = distanceAtY(positionY);
      const point = path.getPointAtLength(distance);
      const before = path.getPointAtLength(Math.max(0, distance - 2));
      const after = path.getPointAtLength(Math.min(length, distance + 2));
      const angle = Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI - 90;
      car.setAttribute("transform", `translate(${point.x} ${point.y}) rotate(${angle})`);
    };

    // Use the road's position in the document, not the length of the entire page.
    // The car finishes when the road's end approaches the visible lower portion
    // of the screen, or at the latest when the page reaches the bottom.
    const getTargetY = () => {
      const scroll = window.scrollY;
      const viewport = window.innerHeight;
      const roadTop = road.getBoundingClientRect().top + scroll;
      const roadBottom = roadTop + roadHeight;
      const maxScroll = Math.max(0, document.documentElement.scrollHeight - viewport);
      const start = Math.max(0, roadTop - viewport * 0.4);
      const finish = Math.min(maxScroll, roadBottom - viewport * 0.72);
      const progress = finish <= start
        ? (scroll >= maxScroll ? 1 : 0)
        : Math.max(0, Math.min(1, (scroll - start) / (finish - start)));
      return scroll >= maxScroll - 2 ? roadHeight : progress * roadHeight;
    };

    const animate = () => {
      frame = 0;
      currentY += (targetY - currentY) * 0.17;
      currentShift += (targetShift - currentShift) * 0.12;
      currentDash += (targetDash - currentDash) * 0.2;
      if (Math.abs(targetY - currentY) < 0.5) currentY = targetY;
      if (Math.abs(targetShift - currentShift) < 0.05) currentShift = targetShift;
      if (Math.abs(targetDash - currentDash) < 0.5) currentDash = targetDash;
      renderCar(currentY);
      movingRoad.setAttribute("transform", `translate(0 ${currentShift})`);
      dashes.style.strokeDashoffset = `${currentDash}`;
      if (currentY !== targetY || currentShift !== targetShift || currentDash !== targetDash) {
        frame = requestAnimationFrame(animate);
      }
    };

    const update = () => {
      targetY = getTargetY();
      // Gentle upward movement, capped so the road never overlaps the text.
      // The moving road layer also contains the car, so the car stays centered.
      targetShift = reducedMotion.matches ? 0 : -Math.min(14, window.scrollY * 0.022);
      targetDash = reducedMotion.matches ? 0 : window.scrollY * 0.42;
      const atBottom = window.scrollY >=
        document.documentElement.scrollHeight - window.innerHeight - 2;
      if (!initialized || reducedMotion.matches || atBottom) {
        cancelAnimationFrame(frame);
        frame = 0;
        currentY = targetY;
        currentShift = targetShift;
        currentDash = targetDash;
        initialized = true;
        renderCar(currentY);
        movingRoad.setAttribute("transform", `translate(0 ${currentShift})`);
        dashes.style.strokeDashoffset = `${currentDash}`;
      } else if (!frame) {
        frame = requestAnimationFrame(animate);
      }
    };

    const onMotionChange = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      update();
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reducedMotion.addEventListener("change", onMotionChange);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", onMotionChange);
      cancelAnimationFrame(frame);
    };
  }, [n]);

  let path = `M ${x(0)} 0 L ${x(0)} ${y(0)}`;
  for (let i = 1; i < n; i++) {
    const mid = (y(i - 1) + y(i)) / 2;
    path += ` C ${x(i - 1)} ${mid} ${x(i)} ${mid} ${x(i)} ${y(i)}`;
  }
  path += ` L ${x(n - 1)} ${ROW * n}`;

  return (
    <main className="roadmap">
      <div className="banner" style={{ background: d.color }} />
      <h1>
        <span className="light">Road Map After</span>
        <span className="name">{d.name}</span>
        <span className="light">Diagnosis:</span>
      </h1>
      <p className="subtitle">{d.subtitle}</p>

      <div className="road">
        <svg
          ref={roadRef}
          width={W}
          height={ROW * n}
          viewBox={`0 0 ${W} ${ROW * n}`}
          aria-label="Moving winding road with a car that follows scrolling"
          role="img"
          style={{ overflow: "visible" }}
        >
          <g ref={movingRoadRef}>
            <path ref={pathRef} d={path} className="asphalt" />
            <path ref={dashesRef} d={path} className="dashes" />

          {/* Top-down car, pointing along the road (toward the next step). */}
          <g ref={carRef} style={{ pointerEvents: "none" }}>
            <ellipse cx="1" cy="2" rx="14" ry="19" fill="#111" opacity="0.25" />
            <rect x="-13" y="-12" width="5" height="9" rx="2" fill="#171717" />
            <rect x="8" y="-12" width="5" height="9" rx="2" fill="#171717" />
            <rect x="-13" y="5" width="5" height="9" rx="2" fill="#171717" />
            <rect x="8" y="5" width="5" height="9" rx="2" fill="#171717" />
            <rect x="-10" y="-18" width="20" height="36" rx="7" fill={d.color} stroke="#ffffff" strokeWidth="1.8" />
            <path d="M -7 -7 Q 0 -12 7 -7 L 7 -2 L -7 -2 Z" fill="#deeff6" stroke="#38545c" strokeWidth="1" />
            <path d="M -7 9 L 7 9 L 6 13 L -6 13 Z" fill="#c6e4ed" opacity="0.9" />
            <rect x="-8" y="14" width="5" height="2" rx="1" fill="#fff5bb" />
            <rect x="3" y="14" width="5" height="2" rx="1" fill="#fff5bb" />
            <rect x="-8" y="-16" width="4" height="2" rx="1" fill="#d94b47" />
            <rect x="4" y="-16" width="4" height="2" rx="1" fill="#d94b47" />
          </g>
          </g>

          {d.steps.map((s, i) => (
            <a key={s.title} href={href(i)} className="pin" tabIndex={-1}>
              <circle cx={x(i)} cy={y(i)} r={20} fill={s.color} stroke="#fff" strokeWidth={3} />
              <text x={x(i)} y={y(i)} className="num">{i + 1}</text>
            </a>
          ))}
        </svg>
        <ol>
          {d.steps.map((s, i) => (
            <li key={s.title} style={{ height: ROW }}>
              <a href={href(i)}>
                <h2 style={{ color: s.ink ?? s.color }}>{s.title}</h2>
                <ul>
                  {s.items.map((item) => (
                    <li key={item.label}>{item.label}</li>
                  ))}
                </ul>
              </a>
            </li>
          ))}
        </ol>
      </div>

      {d.resourcesUrl && (
        <p className="all">
          To view all resources visit <a href={d.resourcesUrl} target="_blank" rel="noreferrer">{d.resourcesUrl}</a>
        </p>
      )}
    </main>
  );
}
