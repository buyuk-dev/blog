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
				// Meteors travel from top-right to bottom-left (215deg rotation)
				// To cover the whole screen, start them from two edges:
				// 1. Above the viewport (top edge) - spread across the width
				// 2. To the right of viewport (right edge) - spread down the height
				// This creates an L-shaped spawn zone that covers the full screen

				const totalEdgeLength = dimensions.width + dimensions.height;
				const position = Math.random() * totalEdgeLength;

				let startX: number;
				let startY: number;

				if (position < dimensions.width) {
					// Spawn above viewport, spread across width
					startX = position;
					startY = -50 - Math.random() * 150;
				} else {
					// Spawn to the right of viewport, spread down height
					startX = dimensions.width + 50 + Math.random() * 150;
					startY = position - dimensions.width;
				}

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
