import {AbsoluteFill, interpolate, random, useCurrentFrame} from 'remotion';
import {Caption} from '../components/Caption';
import {SceneFrame} from '../components/SceneFrame';

export const SceneShopping: React.FC = () => {
	const frame = useCurrentFrame();

	const shelves = new Array(7).fill(0);
	const boxes = new Array(40).fill(0);

	return (
		<SceneFrame background="linear-gradient(180deg, #1f1a14 0%, #2a1f15 100%)">
			<AbsoluteFill>
				{shelves.map((_, i) => {
					const y = 200 + i * 230;
					const offset = interpolate(
						frame,
						[0, 120],
						[0, (i % 2 === 0 ? -1 : 1) * 30],
					);
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								top: y,
								left: -40,
								right: -40,
								height: 14,
								background: '#5a3e22',
								boxShadow: '0 14px 30px rgba(0,0,0,0.5)',
								transform: `translateX(${offset}px)`,
							}}
						/>
					);
				})}
				{boxes.map((_, i) => {
					const row = Math.floor(i / 6);
					const col = i % 6;
					const seed = `box-${i}`;
					const x = 40 + col * 175 + random(seed) * 30;
					const y = 60 + row * 230 + random(seed + 'y') * 20;
					const hue = Math.floor(random(seed + 'h') * 50);
					const w = 110 + random(seed + 'w') * 50;
					const h = 110 + random(seed + 'hh') * 40;
					const sway = interpolate(
						frame,
						[0, 120],
						[0, (random(seed + 's') - 0.5) * 14],
					);
					return (
						<div
							key={i}
							style={{
								position: 'absolute',
								left: x,
								top: y,
								width: w,
								height: h,
								background: `hsl(${20 + hue}, 50%, ${30 + random(seed + 'l') * 25}%)`,
								border: '2px solid rgba(0,0,0,0.3)',
								borderRadius: 6,
								transform: `translateX(${sway}px)`,
								boxShadow: 'inset 0 -20px 40px rgba(0,0,0,0.35)',
							}}
						/>
					);
				})}
				{/* Receipt / shopping list paper */}
				<div
					style={{
						position: 'absolute',
						left: 540,
						top: 700,
						width: 360,
						height: 520,
						background: '#f5efe0',
						transform: `rotate(${interpolate(frame, [0, 120], [-4, -8])}deg)`,
						boxShadow: '0 30px 70px rgba(0,0,0,0.6)',
						padding: 30,
						fontFamily: 'monospace',
						fontSize: 22,
						color: '#1a1a1a',
						lineHeight: 1.4,
					}}
				>
					<div style={{fontWeight: 'bold', fontSize: 26, marginBottom: 14}}>
						SİYAHI
					</div>
					{[
						'• Sement',
						'• Boya',
						'• Plitə',
						'• Mıx',
						'• Taxta',
						'• Klink...',
						'• Şüşə',
						'• ...',
					].map((t, i) => (
						<div key={i}>{t}</div>
					))}
				</div>
			</AbsoluteFill>
			<Caption
				text="90 alış-veriş"
				subtitle="təxminən 250 saat"
				accent="#FF8C42"
			/>
		</SceneFrame>
	);
};
