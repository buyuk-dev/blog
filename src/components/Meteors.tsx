import { useEffect, useState, useMemo } from 'preact/hooks';
import { cn } from '../utils/cn'

interface MeteorsProps {
	number?: number;
}

// Base density: number of meteors per million pixels of viewport
const METEORS_PER_MILLION_PX = 15;
const MIN_METEORS = 10;
const MAX_METEORS = 60;

export function Meteors({ number }: MeteorsProps) {
	const [dimensions, setDimensions] = useState({
		width: 1200,
		height: 800,
	});

	useEffect(() => {
		function handler() {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		handler();
		window.addEventListener('resize', handler);
		return () => {
			window.removeEventListener('resize', handler);
		};
	}, []);

	// Calculate meteor count based on viewport area
	const meteorCount = useMemo(() => {
		if (number !== undefined) return number;
		const area = dimensions.width * dimensions.height;
		const calculated = Math.floor((area / 1_000_000) * METEORS_PER_MILLION_PX);
		return Math.max(MIN_METEORS, Math.min(MAX_METEORS, calculated));
	}, [dimensions.width, dimensions.height, number]);

	const meteors = useMemo(() => new Array(meteorCount).fill(null), [meteorCount]);

	return (
		<div class='fixed inset-0 w-full h-screen overflow-hidden pointer-events-none motion-reduce:hidden z-0'>
			{meteors.map((_el, idx) => {
				// Coordinate system: origin (0,0) at top-left, X right, Y down
				// Meteors travel at 215deg (toward bottom-left)
				//
				// Spawn line: slope +1 line (the \ diagonal) passing through top-right corner
				// This is perpendicular to the / diagonal
				// Line through (width, 0): y - 0 = 1 * (x - width), so y = x - width
				//
				// Parametric form starting at top-right (width, 0):
				//   x = width + t
				//   y = 0 + t
				// t < 0: moves left and up (above viewport)
				// t > 0: moves right and down (right of viewport)

				const totalRange = (dimensions.width + dimensions.height) * 1.2;

				// Distribute along the line, centered at top-right corner
				const t = (Math.random() - 0.5) * totalRange;

				// Position on the spawn line
				const lineX = dimensions.width + t;
				const lineY = 0 + t;

				// Push off-screen: meteors come from upper-right (roughly 35deg)
				// Push in direction (1, -1) to move up and right, off-screen
				const pushDist = 50 + Math.random() * 100;
				const startX = lineX + pushDist;
				const startY = lineY - pushDist;

				return (
					<span
						aria-hidden={true}
						key={idx}
						class={cn(
							'absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-full bg-slate-400 shadow-[0_0_0_1px_#ffffff10]',
							'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-0.5 before:w-20 before:transform before:rounded-full before:bg-gradient-to-r before:from-slate-400 before:to-transparent before:content-[""]',
						)}
						style={{
							top: `${startY}px`,
							left: `${startX}px`,
							animationDelay: `${Math.random() * 0.5}s`,
							animationDuration: `${Math.floor(Math.random() * 6 + 4)}s`,
						}}
					/>
				);
			})}
		</div>
	);
}
