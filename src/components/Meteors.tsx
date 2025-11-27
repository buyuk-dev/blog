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
			{/* Debug markers */}
			<div style={{ position: 'fixed', left: '10px', top: '60px', width: '30px', height: '30px', backgroundColor: 'red', borderRadius: '50%', zIndex: 9999 }} />
			<div style={{ position: 'fixed', right: '10px', top: '60px', width: '30px', height: '30px', backgroundColor: 'blue', borderRadius: '50%', zIndex: 9999 }} />
			<div style={{ position: 'fixed', left: '10px', bottom: '10px', width: '30px', height: '30px', backgroundColor: 'green', borderRadius: '50%', zIndex: 9999 }} />
			<div style={{ position: 'fixed', right: '10px', bottom: '10px', width: '30px', height: '30px', backgroundColor: 'yellow', borderRadius: '50%', zIndex: 9999 }} />
			{/* Test meteor at center of screen */}
			<span
				class={cn(
					'absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-full bg-slate-400 shadow-[0_0_0_1px_#ffffff10]',
					'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-0.5 before:w-20 before:transform before:rounded-full before:bg-gradient-to-r before:from-slate-400 before:to-transparent before:content-[""]',
				)}
				style={{
					top: '200px',
					left: '400px',
					animationDelay: '0s',
					animationDuration: '5s',
				}}
			/>
			{meteors.map((_el, idx) => {
				// Spawn line: y = x (\ diagonal through RED/top-left corner)
				// No offset - spawn exactly on the line

				const t = Math.random() * (dimensions.width + dimensions.height);

				const startX = t;
				const startY = t;

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
