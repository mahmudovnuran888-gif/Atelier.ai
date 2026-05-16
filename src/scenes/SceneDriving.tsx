import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Caption} from '../components/Caption';
import {SceneFrame} from '../components/SceneFrame';

export const SceneDriving: React.FC = () => {
	const frame = useCurrentFrame();

	const dashOffset = (frame * 14) % 80;

	return (
		<SceneFrame background="linear-gradient(180deg, #0d1320 0%, #1b2a48 60%, #2d1810 100%)">
			<AbsoluteFill>
				{/* Sky / horizon glow */}
				<div
					style={{
						position: 'absolute',
						top: 600,
						left: 0,
						right: 0,
						height: 220,
						background:
							'radial-gradient(ellipse at center, rgba(255,180,90,0.55) 0%, rgba(255,120,40,0) 70%)',
					}}
				/>

				{/* Road */}
				<svg
					viewBox="0 0 1080 1920"
					style={{position: 'absolute', inset: 0}}
					preserveAspectRatio="none"
				>
					<polygon
						points="380,800 700,800 1080,1920 0,1920"
						fill="#1a1a1a"
					/>
					<polygon
						points="380,800 700,800 1080,1920 0,1920"
						fill="url(#roadGrad)"
					/>
					<defs>
						<linearGradient id="roadGrad" x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor="rgba(255,255,255,0)" />
							<stop offset="100%" stopColor="rgba(255,255,255,0.08)" />
						</linearGradient>
					</defs>
					{/* Center dashed line */}
					<line
						x1="540"
						y1="800"
						x2="540"
						y2="1920"
						stroke="#FFD166"
						strokeWidth="10"
						strokeDasharray="40 40"
						strokeDashoffset={-dashOffset}
					/>
				</svg>

				{/* Distant buildings */}
				{[0, 1, 2, 3, 4].map((i) => {
					const x = 100 + i * 200;
					const h = 120 + (i % 2) * 80;
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: x,
								top: 680 - h,
								width: 140,
								height: h,
								background: 'rgba(20, 30, 50, 0.9)',
								boxShadow: 'inset -10px 0 0 rgba(0,0,0,0.4)',
							}}
						/>
					);
				})}

				{/* Steering wheel hint */}
				<div
					style={{
						position: 'absolute',
						bottom: -200,
						left: '50%',
						transform: `translateX(-50%) rotate(${interpolate(
							frame,
							[0, 60, 120],
							[-8, 6, -4],
						)}deg)`,
						width: 700,
						height: 700,
						borderRadius: '50%',
						border: '40px solid #111',
						boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
						background:
							'radial-gradient(circle at center, #1a1a1a 30%, transparent 31%)',
					}}
				/>

				{/* Trip counter */}
				<div
					style={{
						position: 'absolute',
						top: 200,
						left: 80,
						background: 'rgba(0,0,0,0.6)',
						padding: '18px 28px',
						borderRadius: 14,
						color: '#7CE3B1',
						fontFamily: 'monospace',
						fontSize: 36,
						fontWeight: 800,
						border: '2px solid rgba(124,227,177,0.4)',
					}}
				>
					KM: {Math.floor(interpolate(frame, [0, 120], [0, 480]))}
				</div>
			</AbsoluteFill>

			<Caption
				text="50 əlavə səfər"
				subtitle="təxminən 100 saat"
				accent="#7CE3B1"
			/>
		</SceneFrame>
	);
};
