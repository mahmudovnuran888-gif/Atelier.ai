import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const Caption: React.FC<{
	text: string;
	subtitle?: string;
	accent?: string;
}> = ({text, subtitle, accent = '#FFD166'}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const enter = spring({
		fps,
		frame,
		config: {damping: 18, stiffness: 120, mass: 0.6},
	});

	const translateY = interpolate(enter, [0, 1], [80, 0]);
	const opacity = interpolate(enter, [0, 1], [0, 1]);

	const barWidth = interpolate(frame, [10, 40], [0, 100], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill
			style={{
				justifyContent: 'flex-end',
				alignItems: 'center',
				paddingBottom: 220,
				paddingLeft: 60,
				paddingRight: 60,
			}}
		>
			<div
				style={{
					transform: `translateY(${translateY}px)`,
					opacity,
					background: 'rgba(0, 0, 0, 0.78)',
					backdropFilter: 'blur(8px)',
					padding: '32px 48px',
					borderRadius: 24,
					borderLeft: `8px solid ${accent}`,
					boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
					maxWidth: 940,
					width: '100%',
				}}
			>
				<div
					style={{
						height: 4,
						background: accent,
						width: `${barWidth}%`,
						marginBottom: 18,
						borderRadius: 2,
					}}
				/>
				<div
					style={{
						color: 'white',
						fontSize: 56,
						fontFamily: 'sans-serif',
						fontWeight: 800,
						lineHeight: 1.15,
						letterSpacing: -0.5,
					}}
				>
					{text}
				</div>
				{subtitle ? (
					<div
						style={{
							color: '#cbd5e1',
							fontSize: 30,
							fontFamily: 'sans-serif',
							fontWeight: 500,
							marginTop: 14,
						}}
					>
						{subtitle}
					</div>
				) : null}
			</div>
		</AbsoluteFill>
	);
};
