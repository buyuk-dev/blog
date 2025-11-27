import { useEffect, useState, useMemo } from 'preact/hooks';
import { cn } from '../utils/cn'

interface MeteorsProps {
	number?: number;
}

// Base density: number of meteors per million pixels of viewport
const METEORS_PER_MILLION_PX = 15;
const MIN_METEORS = 10;
const MAX_METEORS = 60;

// Chance for a meteor to be "burning debris" (0-1)
const DEBRIS_CHANCE = 0.25;

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

	// Pre-determine which meteors are debris (seeded by index for consistency)
	const meteorData = useMemo(() => {
		return new Array(meteorCount).fill(null).map((_, idx) => {
			// Use index-based pseudo-random to keep debris assignment stable
			const pseudoRandom = Math.sin(idx * 9999) * 10000;
			const isDebris = (pseudoRandom - Math.floor(pseudoRandom)) < DEBRIS_CHANCE;
			return { isDebris };
		});
	}, [meteorCount]);

	return (
		<div class='fixed inset-0 w-full h-screen overflow-hidden pointer-events-none motion-reduce:hidden z-0'>
			{meteorData.map((meteor, idx) => {
				// Spawn line should be perpendicular to GREEN-BLUE diagonal (/)
				// GREEN is bottom-left, BLUE is top-right
				// Perpendicular to / is a line with slope -1 (going from top-left to bottom-right area)
				// Line: y = -x + c, passing near RED corner but shifted toward BLUE
				//
				// Let's try: x goes from 0 to width+height, y = -x + some_offset
				// To pass through area near RED but off-screen toward BLUE:
				// y = -x + offset, where offset shifts it up

				// Random position along spawn line, centered around RED corner
				const range = dimensions.width + dimensions.height;
				const t = (Math.random() - 0.5) * range;

				// Line passes through RED (0, 0) with slope -1: y = -x
				// Shifted to be off-screen (toward BLUE)
				const lineOffset = 100;
				const startX = t + lineOffset;
				const startY = -t;

				const isDebris = meteor.isDebris;

				return (
					<span
						aria-hidden={true}
						key={idx}
						class={cn(
							'absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-full',
							// Normal meteors: cool slate
							!isDebris && 'bg-slate-400 shadow-[0_0_0_1px_#ffffff10]',
							!isDebris && 'before:bg-gradient-to-r before:from-slate-400 before:to-transparent',
							// Debris meteors: warm amber glow with subtle flicker
							isDebris && 'bg-amber-500 shadow-[0_0_6px_2px_rgba(251,146,60,0.4)]',
							isDebris && 'before:bg-gradient-to-r before:from-amber-500 before:via-orange-400/60 before:to-transparent',
							isDebris && 'animate-meteor-debris',
							// Common trail styles
							'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-0.5 before:w-20 before:transform before:rounded-full before:content-[""]',
						)}
						style={{
							top: `${startY}px`,
							left: `${startX}px`,
							animationDelay: `${Math.random() * 2}s`,
							animationDuration: `${4 + Math.random() * 6}s`,
						}}
					/>
				);
			})}
		</div>
	);
}
