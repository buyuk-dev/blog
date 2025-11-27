import { useEffect, useState } from 'preact/hooks';
import { cn } from '../utils/cn'

interface MeteorsProps {
	number: number;
}

export function Meteors({ number }: MeteorsProps) {
	const meteors = new Array(number).fill(null);

	const [offset, setOffset] = useState({
		min: 0,
		max: 800,
	});

	useEffect(() => {
		function handler() {
			// Offset min/max to account for meteor angle - they need to start
			// spread across more than just the viewport width
			setOffset({
				min: -(window.innerWidth / 2),
				max: window.innerWidth * 1.5,
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
			{meteors.map((_el, idx) => (
				<span
					aria-hidden={true}
					key={idx}
					class={cn(
						'absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-full bg-slate-400 shadow-[0_0_0_1px_#ffffff10]',
						'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-0.5 before:w-20 before:transform before:rounded-full before:bg-gradient-to-r before:from-slate-400 before:to-transparent before:content-[""]',
					)}
					style={{
						top: `${Math.floor(Math.random() * -800 - 100)}px`,
						left: `${Math.floor(Math.random() * (offset.max - offset.min) + offset.min)}px`,
						animationDelay: `${Math.random() * 2 + idx * 0.3}s`,
						animationDuration: `${Math.floor(Math.random() * 6 + 4)}s`,
					}}
				/>
			))}
		</div>
	);
}
