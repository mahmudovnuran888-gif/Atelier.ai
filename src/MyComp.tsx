import {AbsoluteFill, useCurrentFrame} from 'remotion';

export const MyComp: React.FC = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<div
				style={{
					color: 'white',
					fontSize: 80,
					fontFamily: 'sans-serif',
					fontWeight: 'bold',
				}}
			>
				Frame {frame}
			</div>
		</AbsoluteFill>
	);
};
