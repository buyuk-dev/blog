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
				// Meteors travel from top-right to bottom-left (215deg rotation)
				// Spawn line: 45-degree diagonal passing through top-right corner
				// This line extends from above-right to below-right of viewport
				// Meteors distributed along this line will cover the entire screen

				// The diagonal line length needs to cover the full viewport diagonal
				const diagonalLength = Math.sqrt(
					dimensions.width * dimensions.width + dimensions.height * dimensions.height
				);

				// Position along the diagonal, centered on top-right corner
				// Range: -diagonalLength/2 to +diagonalLength/2
				const offset = (Math.random() - 0.5) * diagonalLength * 1.2;

				// Top-right corner is the anchor point
				// Move along 45-degree line (down-right is positive, up-left is negative)
				// 45 degrees: dx = offset * cos(45°), dy = offset * sin(45°)
				const cos45 = Math.SQRT1_2; // ~0.707
				const sin45 = Math.SQRT1_2;

				// Start position: top-right corner + offset along 45° line + small perpendicular offset to be off-screen
				const perpOffset = 50 + Math.random() * 100; // Push off-screen
				const startX = dimensions.width + offset * cos45 + perpOffset * cos45;
				const startY = 0 + offset * sin45 - perpOffset * sin45;

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
