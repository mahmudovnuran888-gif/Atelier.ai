import {
	AbsoluteFill,
	interpolate,
	spring,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

export const SceneFinal: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	// Fast-forward calendar montage 0-60f
	const calendarProgress = interpolate(frame, [0, 60], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const months = ['1-ci ay', '2-ci ay', '3-cü ay'];
	const monthIndex = Math.min(2, Math.floor(calendarProgress * 3));

	const calendarOpacity = interpolate(frame, [50, 70], [1, 0], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Total number reveal
	const numberSpring = spring({
		fps,
		frame: frame - 70,
		config: {damping: 14, stiffness: 90, mass: 0.8},
	});
	const totalCount = Math.floor(numberSpring * 490);

	const numberScale = interpolate(numberSpring, [0, 1], [0.4, 1]);
	const numberOpacity = interpolate(frame, [70, 90], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Sub-text reveal
	const subOpacity = interpolate(frame, [150, 180], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	// Disclaimer
	const discOpacity = interpolate(frame, [200, 230], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	const pulseGlow = interpolate(
		frame % 60,
		[0, 30, 60],
		[0.3, 0.6, 0.3],
	);

	return (
		<AbsoluteFill
			style={{
				background:
					'radial-gradient(ellipse at center, #1a0a0a 0%, #050505 70%, #000 100%)',
			}}
		>
			{/* Calendar fast-forward */}
			<AbsoluteFill
				style={{
					opacity: calendarOpacity,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						color: '#FFD166',
						fontSize: 56,
						fontFamily: 'sans-serif',
						fontWeight: 700,
						letterSpacing: 4,
						opacity: 0.7,
					}}
				>
					3 ay sonra...
				</div>
				<div
					style={{
						marginTop: 60,
						color: 'white',
						fontSize: 200,
						fontFamily: 'sans-serif',
						fontWeight: 900,
						transform: `scale(${1 + (calendarProgress * 3) % 1 * 0.1})`,
					}}
				>
					{months[monthIndex]}
				</div>
				<div
					style={{
						marginTop: 40,
						display: 'flex',
						gap: 20,
					}}
				>
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							style={{
								width: 80,
								height: 12,
								borderRadius: 6,
								background:
									i <= monthIndex ? '#FFD166' : 'rgba(255,255,255,0.15)',
							}}
						/>
					))}
				</div>
			</AbsoluteFill>

			{/* Glow */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					width: 1200,
					height: 1200,
					transform: 'translate(-50%, -50%)',
					borderRadius: '50%',
					background: `radial-gradient(circle, rgba(255,78,80,${pulseGlow * numberOpacity}) 0%, rgba(0,0,0,0) 60%)`,
					pointerEvents: 'none',
				}}
			/>

			{/* Final result */}
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					padding: 60,
					opacity: numberOpacity,
				}}
			>
				<div
					style={{
						color: '#cbd5e1',
						fontSize: 44,
						fontFamily: 'sans-serif',
						fontWeight: 600,
						letterSpacing: 6,
						marginBottom: 30,
					}}
				>
					CƏMİ
				</div>
				<div
					style={{
						transform: `scale(${numberScale})`,
						display: 'flex',
						alignItems: 'baseline',
						gap: 20,
					}}
				>
					<div
						style={{
							color: '#FF4E50',
							fontSize: 320,
							fontFamily: 'sans-serif',
							fontWeight: 900,
							lineHeight: 1,
							textShadow: '0 10px 60px rgba(255,78,80,0.6)',
						}}
					>
						{totalCount}
					</div>
					<div
						style={{
							color: 'white',
							fontSize: 100,
							fontFamily: 'sans-serif',
							fontWeight: 800,
						}}
					>
						saat
					</div>
				</div>

				<div
					style={{
						marginTop: 80,
						maxWidth: 900,
						color: 'white',
						fontSize: 44,
						fontFamily: 'sans-serif',
						fontWeight: 700,
						textAlign: 'center',
						lineHeight: 1.3,
						opacity: subOpacity,
					}}
				>
					Sərf olunan səylər sizə
					<br />
					<span style={{color: '#FFD166'}}>üç aylıq əmək haqqına</span>
					<br />
					başa gələcək.
				</div>

				<div
					style={{
						position: 'absolute',
						bottom: 80,
						left: 60,
						right: 60,
						color: 'rgba(255,255,255,0.55)',
						fontSize: 22,
						fontFamily: 'sans-serif',
						fontStyle: 'italic',
						textAlign: 'center',
						lineHeight: 1.4,
						opacity: discOpacity,
					}}
				>
					*Hesablama 100 kv.m-lik interyer əsasında aparılmışdır.
				</div>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
