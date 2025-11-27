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
		max: 800,
	});

	useEffect(() => {
		function handler() {
			setOffset({
				min: 0,
				max: window.innerWidth,
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
						'absolute h-1 w-1 rotate-[215deg] animate-meteor-effect rounded-full bg-white',
						'before:-translate-y-[50%] before:absolute before:top-1/2 before:h-[2px] before:w-[80px] before:transform before:rounded-full before:bg-gradient-to-r before:from-white before:via-slate-300 before:to-transparent before:content-[""]',
					)}
					style={{
						top: `-20px`,
						left: `${Math.floor(Math.random() * offset.max)}px`,
						animationDelay: `${Math.random() * 8}s`,
						animationDuration: `${Math.floor(Math.random() * 3) + 3}s`,
					}}
				/>
			))}
		</div>
	);
}
