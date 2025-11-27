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

				const diagonalLength = Math.sqrt(
					dimensions.width * dimensions.width + dimensions.height * dimensions.height
				);

				// Position along the diagonal, centered on top-right corner
				// Negative = up-right (above viewport), Positive = down-left (into viewport area)
				const offset = (Math.random() - 0.5) * diagonalLength * 1.4;

				// Line direction: going down-left means x decreases, y increases
				// So offset positive: x = width - offset*cos45, y = 0 + offset*sin45
				const cos45 = Math.SQRT1_2;
				const sin45 = Math.SQRT1_2;

				const lineX = dimensions.width - offset * cos45;
				const lineY = 0 + offset * sin45;

				// Push slightly off-screen in the up-right direction (perpendicular, away from viewport)
				const perpOffset = 30 + Math.random() * 70;
				const startX = lineX + perpOffset;
				const startY = lineY - perpOffset;

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
