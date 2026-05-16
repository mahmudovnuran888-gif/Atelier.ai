import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Caption} from '../components/Caption';
import {SceneFrame} from '../components/SceneFrame';

export const SceneInspection: React.FC = () => {
	const frame = useCurrentFrame();

	const checkmarks = new Array(6).fill(0);

	return (
		<SceneFrame background="linear-gradient(180deg, #1d1a14 0%, #2d2519 100%)">
			<AbsoluteFill>
				{/* Drywall texture stripes */}
				{new Array(8).fill(0).map((_, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 0,
							top: i * 260,
							right: 0,
							height: 1,
							background: 'rgba(255,255,255,0.04)',
						}}
					/>
				))}

				{/* Spotlight */}
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: 0,
						width: 1200,
						height: 1200,
						borderRadius: '50%',
						background:
							'radial-gradient(circle, rgba(255,220,150,0.15) 0%, rgba(0,0,0,0) 60%)',
						transform: 'translateX(-50%)',
					}}
				/>

				{/* Clipboard */}
				<div
					style={{
						position: 'absolute',
						left: 130,
						top: 380,
						width: 820,
						height: 1080,
						background: '#8b6f3a',
						borderRadius: 18,
						boxShadow: '0 40px 90px rgba(0,0,0,0.7)',
						padding: 40,
						transform: `rotate(${interpolate(frame, [0, 120], [-3, 2])}deg)`,
					}}
				>
					<div
						style={{
							position: 'absolute',
							top: -30,
							left: '50%',
							transform: 'translateX(-50%)',
							width: 200,
							height: 60,
							background: '#3a3a3a',
							borderRadius: 8,
							boxShadow: '0 6px 14px rgba(0,0,0,0.5)',
						}}
					/>
					<div
						style={{
							background: '#f5efe0',
							width: '100%',
							height: '100%',
							borderRadius: 10,
							padding: 50,
							fontFamily: 'sans-serif',
							color: '#1a1a1a',
						}}
					>
						<div
							style={{
								fontSize: 48,
								fontWeight: 900,
								marginBottom: 30,
								borderBottom: '4px solid #1a1a1a',
								paddingBottom: 10,
							}}
						>
							YOXLAMA
						</div>
						{[
							'Divar düzlüyü',
							'Boya qatı',
							'Plitə sırası',
							'Elektrik',
							'Su tıxacı',
							'Tavan',
						].map((t, i) => {
							const showFrame = 20 + i * 12;
							const checked = frame > showFrame;
							const seed = `chk-${i}`;
							const pulse = checked
								? interpolate(
										Math.min(frame - showFrame, 10),
										[0, 10],
										[0, 1],
									)
								: 0;
							return (
								<div
									key={i}
									style={{
										display: 'flex',
										alignItems: 'center',
										fontSize: 34,
										marginBottom: 22,
										fontWeight: 600,
									}}
								>
									<div
										style={{
											width: 44,
											height: 44,
											border: '4px solid #1a1a1a',
											borderRadius: 8,
											marginRight: 22,
											display: 'flex',
											justifyContent: 'center',
											alignItems: 'center',
											background: checked ? '#d62828' : 'transparent',
											transform: `scale(${0.9 + pulse * 0.2})`,
										}}
									>
										{checked ? (
											<span
												style={{
													color: 'white',
													fontSize: 32,
													fontWeight: 900,
												}}
											>
												✗
											</span>
										) : null}
									</div>
									<span
										style={{
											textDecoration: checked ? 'line-through' : 'none',
											opacity: checked ? 0.6 : 1,
										}}
									>
										{t}
									</span>
								</div>
							);
						})}
					</div>
				</div>
			</AbsoluteFill>

			<Caption
				text="30 ustalara nəzarət"
				subtitle="təxminən 70 saat"
				accent="#D62828"
			/>
		</SceneFrame>
	);
};
