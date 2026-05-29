import * as tf from '@tensorflow/tfjs'

// Un objeto por modelo en vez de una variable global única
const modelos = { letras: null, numeros: null }

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
  const max = Math.max(...normalizado.map(Math.abs))
  return normalizado.map(v => v / (max || 1))
}

export function crearModelo(numClases) {
  const m = tf.sequential()
  m.add(tf.layers.dense({ inputShape: [63], units: 128, activation: 'relu' }))
  m.add(tf.layers.dropout({ rate: 0.3 }))
  m.add(tf.layers.dense({ units: 64, activation: 'relu' }))
  m.add(tf.layers.dense({ units: numClases, activation: 'softmax' }))
  m.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })
  return m
}

// tipo: 'letras' | 'numeros'
export async function entrenarModelo(datos, etiquetas, clases, tipo = 'letras') {
  const m = crearModelo(clases.length)
  const xs = tf.tensor2d(datos)
  const ys = tf.tensor2d(etiquetas)
  await m.fit(xs, ys, {
    epochs: 50,
    batchSize: 16,
    validationSplit: 0.2,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`[${tipo}] Época ${epoch + 1}: precisión=${(logs.acc * 100).toFixed(1)}%`)
      }
    }
  })
  modelos[tipo] = m
  xs.dispose()
  ys.dispose()
  return m
}

// tipo: 'letras' | 'numeros' — clases debe coincidir con las usadas al entrenar
export async function predecir(landmarks, clases, tipo = 'letras') {
  const m = modelos[tipo]
  if (!m) return null
  const vector = normalizar(landmarksAVector(landmarks))
  const tensor = tf.tensor2d([vector])
  const pred = m.predict(tensor)
  const data = await pred.data()
  tensor.dispose()
  pred.dispose()
  const maxIdx = data.indexOf(Math.max(...data))
  const confianza = data[maxIdx]
  if (confianza < 0.7) return null
  return clases[maxIdx]
}

export async function guardarModelo(tipo = 'letras') {
  const m = modelos[tipo]
  if (!m) return
  await m.save(`localstorage://signos-modelo-${tipo}`)
}

export async function cargarModelo(tipo = 'letras') {
  try {
    // Intenta desde los archivos del proyecto (pre-entrenado)
    const url = tipo === 'letras'
      ? '/src/assets/modelo/signos-modelo.json'
      : '/src/assets/modelo/signos-modelo-numeros.json'
    modelos[tipo] = await tf.loadLayersModel(url)
    console.log(`Modelo ${tipo} cargado desde archivos`)
    return true
  } catch {
    try {
      // Carga el modelo entrenado por el usuario desde localStorage
      modelos[tipo] = await tf.loadLayersModel(`localstorage://signos-modelo-${tipo}`)
      console.log(`Modelo ${tipo} cargado desde localStorage`)
      return true
    } catch {
      console.log(`No hay modelo ${tipo} disponible`)
      return false
    }
  }
}

export async function exportarModelo(tipo = 'letras') {
  const m = modelos[tipo]
  if (!m) return
  await m.save(`downloads://signos-modelo-${tipo}`)
}
