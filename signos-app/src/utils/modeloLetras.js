import * as tf from '@tensorflow/tfjs'

let modelo = null

// Convierte los 21 landmarks en un array de 63 números (x,y,z por punto)
export function landmarksAVector(landmarks) {
  const vector = []
  landmarks.forEach(p => {
    vector.push(p.x, p.y, p.z)
  })
  return vector
}

// Normaliza el vector respecto a la muñeca para que no importe
// dónde esté la mano en la pantalla
export function normalizar(vector) {
  const baseX = vector[0]
  const baseY = vector[1]
  const baseZ = vector[2]
  const normalizado = []
  for (let i = 0; i < vector.length; i += 3) {
    normalizado.push(
      vector[i]     - baseX,
      vector[i + 1] - baseY,
      vector[i + 2] - baseZ,
    )
  }
  // Escalar para que el mayor valor sea 1
  const max = Math.max(...normalizado.map(Math.abs))
  return normalizado.map(v => v / (max || 1))
}

export function crearModelo(numLetras) {
  const m = tf.sequential()
  m.add(tf.layers.dense({ inputShape: [63], units: 128, activation: 'relu' }))
  m.add(tf.layers.dropout({ rate: 0.3 }))
  m.add(tf.layers.dense({ units: 64, activation: 'relu' }))
  m.add(tf.layers.dense({ units: numLetras, activation: 'softmax' }))
  m.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })
  return m
}

export async function entrenarModelo(datos, etiquetas, letras) {
  const m = crearModelo(letras.length)
  const xs = tf.tensor2d(datos)
  const ys = tf.tensor2d(etiquetas)
  await m.fit(xs, ys, {
    epochs: 50,
    batchSize: 16,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Época ${epoch + 1}: precisión=${(logs.acc * 100).toFixed(1)}%`)
      }
    }
  })
  modelo = m
  xs.dispose()
  ys.dispose()
  return m
}

export async function predecir(landmarks, letras) {
  if (!modelo) return null
  const vector = normalizar(landmarksAVector(landmarks))
  const tensor = tf.tensor2d([vector])
  const pred = modelo.predict(tensor)
  const data = await pred.data()
  tensor.dispose()
  pred.dispose()
  const maxIdx = data.indexOf(Math.max(...data))
  const confianza = data[maxIdx]
  if (confianza < 0.7) return null
  return letras[maxIdx]
}

export async function guardarModelo() {
  if (!modelo) return
  await modelo.save('localstorage://signos-modelo')
}

export async function cargarModelo() {
  try {
    // Primero intenta cargar desde los archivos del proyecto
    modelo = await tf.loadLayersModel('/src/assets/modelo/signos-modelo.json')
    console.log('Modelo cargado desde archivos')
    return true
  } catch {
    try {
      // Si no encuentra los archivos, intenta localStorage
      modelo = await tf.loadLayersModel('localstorage://signos-modelo')
      console.log('Modelo cargado desde localStorage')
      return true
    } catch {
      console.log('No hay modelo guardado')
      return false
    }
  }
}

export async function exportarModelo() {
  if (!modelo) return
  await modelo.save('downloads://signos-modelo')
}