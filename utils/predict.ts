import { getImageTensorFromPath } from "./imageHelper";
import { runSqueezenetModel } from "./modelHelper";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function inferenceSqueezenet(
  path: string
): Promise<[any, number]> {
  // 1. Convert image to tensor
  const imageTensor = await getImageTensorFromPath(path);
  // 2. Run model
  const [predictions, inferenceTime] = await runSqueezenetModel(imageTensor);
  // 3. Return predictions and the amount of time it took to inference.
  return [predictions, inferenceTime];
}