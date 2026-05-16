import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Caption} from '../components/Caption';
import {SceneFrame} from '../components/SceneFrame';

export const ScenePhoneCalls: React.FC = () => {
	const frame = useCurrentFrame();

	const ring = interpolate(frame % 18, [0, 9, 18], [1, 1.08, 1]);

	const bubbles = new Array(12).fill(0);

	return (
		<SceneFrame background="linear-gradient(180deg, #0c1b2a 0%, #1a3550 100%)">
			<AbsoluteFill>
				{/* Dust particles */}
				{bubbles.map((_, i) => {
					const seed = `dust-${i}`;
					const x = random(seed) * 1080;
					const y =
						(random(seed + 'y') * 1920 + frame * (1 + random(seed + 's') * 2)) %
						1920;
					const size = 6 + random(seed + 'r') * 14;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: x,
								top: y,
								width: size,
								height: size,
								borderRadius: '50%',
								background: 'rgba(255, 220, 150, 0.3)',
								filter: 'blur(3px)',
							}}
						/>
					);
				})}

				{/* Phone */}
				<div
					style={{
						position: 'absolute',
						left: 280,
						top: 480,
						width: 520,
						height: 900,
						borderRadius: 80,
						background:
							'linear-gradient(160deg, #1f1f1f 0%, #0a0a0a 100%)',
						boxShadow: '0 50px 120px rgba(0,0,0,0.8)',
						transform: `scale(${ring}) rotate(-6deg)`,
						border: '4px solid #2a2a2a',
					}}
				>
					<div
						style={{
							position: 'absolute',
							top: 40,
							left: 40,
							right: 40,
							bottom: 40,
							borderRadius: 56,
							background:
								'linear-gradient(180deg, #b71c1c 0%, #7a0e0e 100%)',
							display: 'flex',
							flexDirection: 'column',
							justifyContent: 'center',
							alignItems: 'center',
							padding: 60,
						}}
					>
						<div
							style={{
								fontSize: 200,
								filter: 'drop-shadow(0 6px 20px rgba(0,0,0,0.5))',
							}}
						>
							📞
						</div>
						<div
							style={{
								color: 'white',
								fontSize: 38,
								fontFamily: 'sans-serif',
								fontWeight: 700,
								marginTop: 30,
							}}
						>
							Usta
						</div>
						<div
							style={{
								color: 'rgba(255,255,255,0.8)',
								fontSize: 28,
								fontFamily: 'sans-serif',
								marginTop: 10,
							}}
						>
							gələn zəng...
						</div>
					</div>
				</div>

				{/* Call count ticker */}
				<div
					style={{
						position: 'absolute',
						top: 180,
						left: 0,
						right: 0,
						textAlign: 'center',
						color: '#FFD166',
						fontSize: 64,
						fontFamily: 'monospace',
						fontWeight: 900,
						textShadow: '0 4px 20px rgba(0,0,0,0.8)',
					}}
				>
					{Math.floor(interpolate(frame, [0, 100], [1800, 1900], {extrapolateRight: 'clamp'}))}
				</div>
			</AbsoluteFill>

			<Caption
				text="1800–1900 zəng"
				subtitle="təxminən 70 saat"
				accent="#FF4E50"
			/>
		</SceneFrame>
	);
};
