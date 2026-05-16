import {Composition} from 'remotion';
import {RenovationReel, TOTAL_DURATION} from './RenovationReel';

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="RenovationReel"
				component={RenovationReel}
				durationInFrames={TOTAL_DURATION}
				width={1080}
				height={1920}
				fps={30}
				defaultProps={{}}
			/>
		</>
	);
};
