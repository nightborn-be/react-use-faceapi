import * as faceapi from 'face-api.js';
import { useEffect, useState } from 'react';

export interface IFaceApiConfiguration {
	input: HTMLImageElement | HTMLVideoElement | string | faceapi.TNetInput,
	refreshRate?: number,
	useFaceLandMarks?: boolean,
	useAgeGenderModel?: boolean,
	useFaceExpressionModel?: boolean,
	modelUrl?: string
}
/**
 * Hook used to retrieve the information about the different faces in a picture
 * @param configuration containing the configuration for the FaceAPI
 */
export function useFaceApi(configuration: IFaceApiConfiguration) {

	// Attributes
	let interval: NodeJS.Timeout;
	const [faces, setFaces] = useState<faceapi.FaceDetection[]>([]);
	const { input, modelUrl = "./models", useFaceLandMarks = false, useAgeGenderModel = false, useFaceExpressionModel = false, refreshRate = 1000 } = configuration;

	// Methods
	async function init() {

		await faceapi.loadSsdMobilenetv1Model(modelUrl);

		if (useFaceLandMarks) {
			await faceapi.loadFaceLandmarkModel(modelUrl);
		}
		if (useAgeGenderModel) {
			await faceapi.loadAgeGenderModel(modelUrl);
		}
		if (useFaceExpressionModel) {
			await faceapi.loadFaceExpressionModel(modelUrl);
		}

		if (interval) {
			clearInterval(interval);
		}

		interval = setInterval(async () => {
			let task = faceapi.detectAllFaces(input);

			if (useFaceLandMarks) {
				//@ts-ignore
				task = task.withFaceLandmarks();
			}

			if (useAgeGenderModel) {
				//@ts-ignore
				task = task.withAgeAndGender();
			}

			if (useFaceExpressionModel) {
				//@ts-ignore
				task = task.withFaceExpressions();
			}

			const data = await task;

			if (data) {
				setFaces(data);
			}
		}, refreshRate);
	}

	// Effects
	useEffect(() => {
		init();
	}, [configuration]);

	return faces;
}