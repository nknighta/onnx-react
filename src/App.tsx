import { useState, useCallback, useRef } from "react";
import "./App.css";
import { inferenceSqueezenet } from "../utils/predict";
import Webcam from "react-webcam";
function App() {
  const videoConstraints = {
    width: 720,
    height: 360,
    facingMode: "user",
  };

  const [isCaptureEnable, setCaptureEnable] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const [url, setUrl] = useState<string | null>(null);
  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      //setUrl(imageSrc);
      setImage(imageSrc);
    }
  }, [webcamRef]);

  const [image, setImage] = useState<string | null>(null);

  const [imageIndex, setImageIndex] = useState<number>(0);
  const imageList = ["strawberry.jpg", "cat.jpg", "moon.jpg", "microphone.jpg"];

  const [resultLabel, setResultLabel] = useState<string>("");
  const [resultConfidence, setResultConfidence] = useState<string>("");
  const [inferenceTime, setInferenceTime] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const setRandomImage = (currentImageIndex: number) => {
    setCaptureEnable(false);

    let newIndex = Math.floor(Math.random() * imageList.length);
    while (newIndex === currentImageIndex) {
      newIndex = Math.floor(Math.random() * imageList.length);
    }
    setImageIndex(newIndex);
    setImage(imageList[newIndex]);
  };

  const chooseImage = () => {
    setCaptureEnable(false);

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptureEnable(false);
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const classifyImage = useCallback(async () => {
    if (!image) {
      setError("Please select an image first.");
      return;
    }

    setResultLabel("Inferencing...");
    setResultConfidence("");
    setInferenceTime("");
    setError(null);

    try {
      const [inferenceResult, inferenceTime] = await inferenceSqueezenet(image);

      const topResult = inferenceResult[0];
      setResultLabel(topResult.name.toUpperCase());
      setResultConfidence(topResult.probability);
      setInferenceTime(`Inference speed: ${inferenceTime} seconds`);
    } catch (error) {
      console.error("Error during inference:", error);
      setError("Error during inference");
    }
  }, [image]);

  return (
    <>
      {url && (
        <>
          <div>
            <button
              onClick={() => {
                setUrl(null);
              }}
            >
              削除
            </button>
          </div>
          <div>
            <img src={url} alt="Screenshot" />
          </div>
        </>
      )}
      <div style={{
        backgroundColor: "#f0f0f0",
        padding: "20px 60px",
        borderRadius: 10,
        display: "flex",
        flexDirection: "column",
        maxWidth: "50vh",
      }}>
        <h1>ONNX React</h1>
        {image === null ? (
          <></>
        ) : (
          <div>
            <img src={image} alt="Selected Image" height={240} />
          </div>
        )}
        <button
          color="primary"
          onClick={() => setRandomImage(imageIndex)}
        >
          Random Image
        </button>
        <button onClick={chooseImage}>
          CHOOSE IMAGE
        </button>
        {isCaptureEnable || (
          <button onClick={() => setCaptureEnable(true)}>take picture</button>
        )}
        {isCaptureEnable && (
          <>
            <div>
              <button onClick={() => setCaptureEnable(false)}>Cancel</button>
            </div>
            <div>
              <Webcam
                audio={false}
                width={540}
                height={360}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={videoConstraints}
              />
            </div>
            <button onClick={capture}>キャプチャ</button>
          </>
        )}
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        <button color="primary" onClick={classifyImage}>
          Classify Image
        </button>

        <h4>Results:</h4>
        <p >{resultLabel}</p>
        <p >{resultConfidence}</p>
        <p >{inferenceTime}</p>
        {error && (
          <div color="error">
            {error}
          </div>
        )}
      </div>
    </>
  );
}

export default App;