"""
MNIST CNN 모델 학습 후 TensorFlow.js 형식으로 변환
(05_mnist_cnn.py 기반)
"""
import tensorflow as tf
from tensorflow.keras import layers, models
import tensorflowjs as tfjs
import os

print("Loading MNIST data...")
(train_images, train_labels), (test_images, test_labels) = tf.keras.datasets.mnist.load_data()

train_images = train_images.reshape((60000, 28, 28, 1)).astype('float32') / 255
test_images = test_images.reshape((10000, 28, 28, 1)).astype('float32') / 255

print("Building CNN model...")
model = models.Sequential([
    layers.Conv2D(32, (3, 3), activation='relu', input_shape=(28, 28, 1)),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.MaxPooling2D((2, 2)),
    layers.Conv2D(64, (3, 3), activation='relu'),
    layers.Flatten(),
    layers.Dense(64, activation='relu'),
    layers.Dense(10, activation='softmax')
])

model.compile(optimizer='adam',
              loss='sparse_categorical_crossentropy',
              metrics=['accuracy'])

print("Training model (5 epochs)...")
model.fit(train_images, train_labels, epochs=5, batch_size=64,
          validation_data=(test_images, test_labels))

test_loss, test_acc = model.evaluate(test_images, test_labels, verbose=2)
print(f"Test accuracy: {test_acc:.4f}")

# TensorFlow.js 형식으로 변환
output_dir = os.path.join(os.path.dirname(__file__), '..', 'public', 'models', 'mnist')
os.makedirs(output_dir, exist_ok=True)

print(f"Converting to TensorFlow.js format -> {output_dir}")
tfjs.converters.save_keras_model(model, output_dir)
print("Done!")
