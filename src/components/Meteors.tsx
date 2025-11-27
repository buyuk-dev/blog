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
				// Spread meteors across starting positions
				// They start off-screen (top or left) and travel diagonally down-right
				// Starting X: from -200px (off left) to full width
				// Starting Y: from -100px (off top) to 80% of viewport height
				const startX = Math.random() * (dimensions.width + 200) - 200;
				const startY = Math.random() * (dimensions.height * 0.8) - 100;

				return (
					<span
						aria-hidden={true}
						key={idx}
						class={cn(
							'absolute h-1 w-1 rotate-[215deg] animate-meteor-effect rounded-full bg-white',
							'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-[2px] before:w-[80px] before:transform before:rounded-full before:bg-gradient-to-r before:from-white before:via-slate-300 before:to-transparent before:content-[""]',
						)}
						style={{
							top: `${startY}px`,
							left: `${startX}px`,
							animationDelay: `${Math.random() * 10}s`,
							animationDuration: `${Math.floor(Math.random() * 4) + 4}s`,
						}}
					/>
				);
			})}
		</div>
	);
}
