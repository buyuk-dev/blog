import { useEffect, useState } from 'preact/hooks';
import { cn } from '../utils/cn'

interface MeteorsProps {
	number: number;
}

export function Meteors({ number }: MeteorsProps) {
	const meteors = new Array(number).fill(null);

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

	return (
		<div class='fixed inset-0 w-full h-screen overflow-hidden pointer-events-none motion-reduce:hidden z-0'>
			{meteors.map((_el, idx) => {
				// With rotate(215deg), meteors travel toward bottom-left
				// So they should start from top-right area (above or to the right of viewport)
				// Spread starting positions along the top and right edges
				const offsetAlongEdge = Math.random() * (dimensions.width + dimensions.height);

				let startX: number;
				let startY: number;

				if (offsetAlongEdge < dimensions.width) {
					// Start above the viewport, spread across width
					startX = offsetAlongEdge;
					startY = -50 - Math.random() * 100;
				} else {
					// Start to the right of viewport
					startX = dimensions.width + 50 + Math.random() * 100;
					startY = offsetAlongEdge - dimensions.width;
				}

				return (
					<span
						aria-hidden={true}
						key={idx}
						class={cn(
							'absolute h-0.5 w-0.5 rounded-full bg-slate-500',
							'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-[1px] before:w-[50px] before:transform before:rounded-full before:bg-gradient-to-r before:from-slate-500 before:to-transparent before:content-[""]',
							'animate-meteor-effect',
						)}
						style={{
							top: `${startY}px`,
							left: `${startX}px`,
							animationDelay: `${(idx * 0.4) + Math.random() * 2}s`,
							animationDuration: `${Math.floor(Math.random() * 8) + 2}s`,
						}}
					/>
				);
			})}
		</div>
	);
}
