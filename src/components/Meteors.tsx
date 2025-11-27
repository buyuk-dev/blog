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
				// Meteors travel toward bottom-left (215deg)
				// Spawn line: 45° diagonal going from upper-right to lower-left area,
				// passing through top-right corner of viewport
				//
				// The line equation through top-right corner (width, 0) at -45° slope:
				// Points on line: x increases, y decreases (going up-right)
				//                 x decreases, y increases (going down-left)

				// Meteors travel at 215deg (toward bottom-left)
				// They come FROM 35deg direction (upper-right)
				//
				// Spawn line should be PERPENDICULAR to travel direction
				// Travel direction: 215deg -> perpendicular is 215-90 = 125deg or 215+90 = 305deg
				//
				// Actually simpler: place meteors along a line perpendicular to their travel,
				// positioned off-screen in the direction they come from.
				//
				// 215deg travel = coming from 35deg
				// Perpendicular spawn line runs at 125deg-305deg (or slope = tan(125deg) ≈ -2.14)
				//
				// But you wanted the line at 45deg through top-right corner. Let's do exactly that.
				// Line at 45deg = slope of -1, through (width, 0)
				//
				// Distribute meteors along this line, then offset them in the 35deg direction
				// (the direction they travel FROM) to push them off-screen.

				// Range along the spawn line to cover full viewport
				const totalRange = (dimensions.width + dimensions.height) * 1.5;

				// Random position along the line, centered on top-right corner
				const t = (Math.random() - 0.5) * totalRange;

				// Spawn line: slope -1 through top-right corner (width, 0)
				// Direction along line: (1, -1) normalized
				// t positive = right and up, t negative = left and down
				const baseX = dimensions.width + t;
				const baseY = 0 - t;

				// Push in the direction meteors come FROM (35deg from horizontal)
				// 35deg: cos(35) ≈ 0.819, sin(35) ≈ 0.574
				const pushDist = 100 + Math.random() * 150;
				const startX = baseX + pushDist * 0.819;
				const startY = baseY - pushDist * 0.574;

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
