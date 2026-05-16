import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

export const SceneFrame: React.FC<{
	children: React.ReactNode;
	background: string;
	zoom?: boolean;
}> = ({children, background, zoom = true}) => {
	const frame = useCurrentFrame();

	const scale = zoom
		? interpolate(frame, [0, 120], [1.0, 1.08], {
				extrapolateLeft: 'clamp',
				extrapolateRight: 'clamp',
			})
		: 1;

	const drift = interpolate(frame, [0, 120], [0, -20], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<AbsoluteFill style={{background, overflow: 'hidden'}}>
			<AbsoluteFill
				style={{
					transform: `scale(${scale}) translateY(${drift}px)`,
				}}
			>
				{children}
			</AbsoluteFill>
			<AbsoluteFill
				style={{
					background:
						'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.85) 100%)',
					pointerEvents: 'none',
				}}
			/>
		</AbsoluteFill>
	);
};
