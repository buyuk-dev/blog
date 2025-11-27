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
				// Meteors start off-screen to the top-left and travel diagonally down-right
				// Spread starting positions along an imaginary line above and to the left of viewport
				// This creates entry points that will result in meteors covering the whole screen
				const offsetAlongEdge = Math.random() * (dimensions.width + dimensions.height);

				// Start position: above viewport or to the left, distributed along the edge
				let startX: number;
				let startY: number;

				if (offsetAlongEdge < dimensions.width) {
					// Start above the viewport
					startX = offsetAlongEdge;
					startY = -100 - Math.random() * 200;
				} else {
					// Start to the left of viewport
					startX = -100 - Math.random() * 200;
					startY = offsetAlongEdge - dimensions.width;
				}

				return (
					<span
						aria-hidden={true}
						key={idx}
						class={cn(
							'absolute h-1 w-1 rotate-[45deg] rounded-full bg-white opacity-0',
							'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-[2px] before:w-[80px] before:transform before:rounded-full before:bg-gradient-to-r before:from-white before:via-slate-300 before:to-transparent before:content-[""]',
							'animate-meteor-effect',
						)}
						style={{
							top: `${startY}px`,
							left: `${startX}px`,
							animationDelay: `${(idx * 0.6) + Math.random() * 2}s`,
							animationDuration: `${Math.floor(Math.random() * 3) + 5}s`,
						}}
					/>
				);
			})}
		</div>
	);
}
