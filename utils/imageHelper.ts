import { Tensor } from "onnxruntime-web";

export async function getImageTensorFromPath(
  path: string,
  dims: number[] = [1, 3, 224, 224]
): Promise<Tensor> {
  // 1. load the image
  const image = await loadImageFromPath(path);
  // 2. convert to tensor
  const imageTensor = imageDataToTensor(image, dims);
  // 3. return the tensor
  return imageTensor;
}

async function loadImageFromPath(path: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous"; // CORSポリシー対応が必要な場合
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = path;
  });
}

function imageDataToTensor(image: HTMLImageElement, dims: number[]): Tensor {
  const [width, height] = [dims[2], dims[3]];

  // Canvas作成
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Failed to get 2D context");
  }

  // 画像をリサイズしてCanvasに描画
  ctx.drawImage(image, 0, 0, width, height);

  // ピクセルデータを取得
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // R, G, Bチャンネルの配列を作成
  const [redArray, greenArray, blueArray] = [
    new Array<number>(),
    new Array<number>(),
    new Array<number>(),
  ];

  // RGBチャンネルを分離
  for (let i = 0; i < data.length; i += 4) {
    redArray.push(data[i]);
    greenArray.push(data[i + 1]);
    blueArray.push(data[i + 2]);
    // アルファチャンネルはスキップ
  }

  // RGB配列を結合して[3, 224, 224]の形式に変換
  const transposedData = redArray.concat(greenArray).concat(blueArray);

  // Float32Arrayに変換
  const float32Data = new Float32Array(dims[1] * dims[2] * dims[3]);
  for (let i = 0; i < transposedData.length; i++) {
    float32Data[i] = transposedData[i] / 255.0;
  }

  // Tensorを作成して返す
  return new Tensor("float32", float32Data, dims);
}