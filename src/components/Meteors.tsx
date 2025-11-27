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
			{/* Debug markers - fixed positions */}
			<div style={{ position: 'fixed', left: '0px', top: '0px', width: '30px', height: '30px', backgroundColor: 'red', borderRadius: '50%', zIndex: 9999 }} />
			<div style={{ position: 'fixed', right: '0px', top: '0px', width: '30px', height: '30px', backgroundColor: 'blue', borderRadius: '50%', zIndex: 9999 }} />
			<div style={{ position: 'fixed', left: '0px', bottom: '0px', width: '30px', height: '30px', backgroundColor: 'green', borderRadius: '50%', zIndex: 9999 }} />
			<div style={{ position: 'fixed', right: '0px', bottom: '0px', width: '30px', height: '30px', backgroundColor: 'yellow', borderRadius: '50%', zIndex: 9999 }} />
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

				// Spawn line: slope -1 (the / diagonal direction)
				// We want it to pass through top-right corner (width, 0)
				// and be shifted off-screen to the upper-right
				//
				// Line equation: y = -(x - width) = width - x
				// Or parametrically from top-right: x = width + t, y = -t
				// t > 0: moves right and up (off-screen)
				// t < 0: moves left and down (toward bottom-left)

				const totalRange = (dimensions.width + dimensions.height) * 1.5;

				// t ranges from 0 to totalRange (all on one side of top-right corner)
				// This places all spawn points to the upper-right of the top-right corner
				const t = Math.random() * totalRange;

				// Position on the spawn line (upper-right of viewport)
				const startX = dimensions.width + t + 50;
				const startY = -t - 50;

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
