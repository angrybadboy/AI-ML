/**
 * MNIST CNN 모델을 TensorFlow.js로 학습하고 저장
 * 작은 샘플로 빠르게 학습 (CPU 환경)
 */
import * as tf from '@tensorflow/tfjs';
import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function loadMnistData() {
  const mnistUrl = 'https://storage.googleapis.com/cvdf-datasets/mnist/';

  async function fetchBuffer(url) {
    const response = await fetch(url);
    return Buffer.from(await response.arrayBuffer());
  }

  console.log('Downloading MNIST data...');
  const [trainImages, trainLabels, testImages, testLabels] = await Promise.all([
    fetchBuffer(mnistUrl + 'train-images-idx3-ubyte.gz'),
    fetchBuffer(mnistUrl + 'train-labels-idx1-ubyte.gz'),
    fetchBuffer(mnistUrl + 't10k-images-idx3-ubyte.gz'),
    fetchBuffer(mnistUrl + 't10k-labels-idx1-ubyte.gz'),
  ]);

  const trainImgBuf = zlib.gunzipSync(trainImages);
  const trainLblBuf = zlib.gunzipSync(trainLabels);
  const testImgBuf = zlib.gunzipSync(testImages);
  const testLblBuf = zlib.gunzipSync(testLabels);

  // 5000개만 사용 (빠른 학습)
  const numTrain = 5000;
  const numTest = 1000;

  const xTrain = new Float32Array(numTrain * 28 * 28);
  for (let i = 0; i < numTrain * 28 * 28; i++) {
    xTrain[i] = trainImgBuf[16 + i] / 255.0;
  }
  const yTrain = Array.from({ length: numTrain }, (_, i) => trainLblBuf[8 + i]);

  const xTest = new Float32Array(numTest * 28 * 28);
  for (let i = 0; i < numTest * 28 * 28; i++) {
    xTest[i] = testImgBuf[16 + i] / 255.0;
  }
  const yTest = Array.from({ length: numTest }, (_, i) => testLblBuf[8 + i]);

  return {
    trainImages: tf.tensor4d(xTrain, [numTrain, 28, 28, 1]),
    trainLabels: tf.tensor1d(yTrain, 'float32'),
    testImages: tf.tensor4d(xTest, [numTest, 28, 28, 1]),
    testLabels: tf.tensor1d(yTest, 'float32'),
  };
}

async function main() {
  const data = await loadMnistData();

  console.log('Building CNN model...');
  const model = tf.sequential();
  model.add(tf.layers.conv2d({ inputShape: [28, 28, 1], filters: 16, kernelSize: 3, activation: 'relu' }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: 'relu' }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  model.add(tf.layers.dense({ units: 10, activation: 'softmax' }));

  model.compile({
    optimizer: 'adam',
    loss: 'sparseCategoricalCrossentropy',
    metrics: ['accuracy'],
  });

  model.summary();

  console.log('Training (5 epochs)...');
  await model.fit(data.trainImages, data.trainLabels, {
    epochs: 2,
    batchSize: 128,
    validationData: [data.testImages, data.testLabels],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`  Epoch ${epoch + 1}: loss=${logs.loss.toFixed(4)}, acc=${logs.acc.toFixed(4)}, val_acc=${logs.val_acc.toFixed(4)}`);
      },
    },
  });

  // 모델을 JSON + weights로 수동 저장 (한글 경로 호환)
  const outputDir = path.join(__dirname, '..', 'public', 'models', 'mnist');
  fs.mkdirSync(outputDir, { recursive: true });

  const saveResult = await model.save(tf.io.withSaveHandler(async (artifacts) => {
    // model.json 저장
    const modelJSON = {
      modelTopology: artifacts.modelTopology,
      weightsManifest: [{
        paths: ['weights.bin'],
        weights: artifacts.weightSpecs,
      }],
      format: 'layers-model',
      generatedBy: 'TensorFlow.js tfjs-layers',
    };
    fs.writeFileSync(path.join(outputDir, 'model.json'), JSON.stringify(modelJSON));

    // weights.bin 저장
    const weightData = Buffer.from(artifacts.weightData);
    fs.writeFileSync(path.join(outputDir, 'weights.bin'), weightData);

    return { modelArtifactsInfo: { dateSaved: new Date(), modelTopologyType: 'JSON' } };
  }));
  console.log(`Model saved to ${outputDir}`);

  data.trainImages.dispose();
  data.trainLabels.dispose();
  data.testImages.dispose();
  data.testLabels.dispose();
}

main().catch(console.error);
