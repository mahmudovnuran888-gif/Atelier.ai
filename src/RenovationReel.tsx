import {AbsoluteFill} from 'remotion';
import {
	linearTiming,
	springTiming,
	TransitionSeries,
} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import {slide} from '@remotion/transitions/slide';

import {SceneShopping} from './scenes/SceneShopping';
import {ScenePhoneCalls} from './scenes/ScenePhoneCalls';
import {SceneDriving} from './scenes/SceneDriving';
import {SceneInspection} from './scenes/SceneInspection';
import {SceneFinal} from './scenes/SceneFinal';

const SCENE_FRAMES = 120;
const TRANSITION_FRAMES = 18;
const FINAL_FRAMES = 240;

export const TOTAL_DURATION =
	SCENE_FRAMES * 4 + FINAL_FRAMES + TRANSITION_FRAMES * 4;

export const RenovationReel: React.FC = () => {
	return (
		<AbsoluteFill style={{background: '#0a0a0f'}}>
			<TransitionSeries>
				<TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
					<SceneShopping />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
					presentation={fade()}
				/>
				<TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
					<ScenePhoneCalls />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
					presentation={slide()}
				/>
				<TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
					<SceneDriving />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={linearTiming({durationInFrames: TRANSITION_FRAMES})}
					presentation={fade()}
				/>
				<TransitionSeries.Sequence durationInFrames={SCENE_FRAMES}>
					<SceneInspection />
				</TransitionSeries.Sequence>
				<TransitionSeries.Transition
					timing={springTiming({config: {damping: 200}, durationInFrames: TRANSITION_FRAMES})}
					presentation={fade()}
				/>
				<TransitionSeries.Sequence durationInFrames={FINAL_FRAMES}>
					<SceneFinal />
				</TransitionSeries.Sequence>
			</TransitionSeries>
		</AbsoluteFill>
	);
};
