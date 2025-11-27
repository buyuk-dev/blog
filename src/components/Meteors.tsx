import { useEffect, useState } from 'preact/hooks';
import { cn } from '../utils/cn'

interface MeteorsProps {
	number: number;
}

export function Meteors({ number }: MeteorsProps) {
	const meteors = new Array(number).fill(null);

	const [offset, setOffset] = useState<{
		min: number;
		max: number;
	}>({
		min: 0,
		max: 0,
	});

	useEffect(() => {
		function handler() {
			// Note: Because of the angle of the meteors, we need to offset the min / max
			// start positions to be off-screen.
			setOffset({
				min: -(window.innerWidth / 4),
				max: window.innerWidth - window.innerWidth / 4,
			});
		}

		handler();

		window.addEventListener('resize', handler);

		return () => {
			window.removeEventListener('resize', handler);
		};
	}, []);

	return (
		<div class='absolute inset-0 h-40 w-full overflow-hidden motion-reduce:hidden z-0'>
			{meteors.map((_el, idx) => (
				<span
					aria-hidden={true}
					key={idx}
					class={cn(
						'absolute h-0.5 w-0.5 rotate-[215deg] animate-meteor-effect rounded-full bg-slate-200',
						'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-0.5 before:w-14 before:transform before:rounded-full before:bg-gradient-to-r before:from-slate-200 before:to-transparent before:content-[""]',
					)}
					style={{
						top: `${Math.floor(Math.random() * (0 - -400) + -400)}px`,
						left: `${Math.floor(Math.random() * offset.max + offset.min)}px`,
						animationDelay: `${Math.random() * (0.8 - 0.2) + 0.2}s`,
						animationDuration: `${Math.floor(Math.random() * (10 - 2) + 2) + 10}s`,
					}}
				/>
			))}
		</div>
	);
}
