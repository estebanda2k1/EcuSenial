export function detectarLetra(landmarks) {
  if (!landmarks) return null

  const dedos = {
    pulgar:  landmarks[4],
    indice:  landmarks[8],
    medio:   landmarks[12],
    anular:  landmarks[16],
    menique: landmarks[20],
  }

  const base = {
    indice:  landmarks[6],
    medio:   landmarks[10],
    anular:  landmarks[14],
    menique: landmarks[18],
  }

  function extendido(punta, articulacion) {
    return punta.y < articulacion.y
  }

  const indiceExt  = extendido(dedos.indice,  base.indice)
  const medioExt   = extendido(dedos.medio,   base.medio)
  const anularExt  = extendido(dedos.anular,  base.anular)
  const meniqueExt = extendido(dedos.menique, base.menique)

  const todosAbajo = !indiceExt && !medioExt && !anularExt && !meniqueExt
  const todosArriba = indiceExt && medioExt && anularExt && meniqueExt

  if (todosAbajo) return 'A'
  if (todosArriba && !indiceExt) return 'B'
  if (indiceExt && medioExt && !anularExt && !meniqueExt) return 'V'
  if (indiceExt && !medioExt && !anularExt && !meniqueExt) return 'D'
  if (!indiceExt && !medioExt && !anularExt && meniqueExt) return 'I'

  return null
}