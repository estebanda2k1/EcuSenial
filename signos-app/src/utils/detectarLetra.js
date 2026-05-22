export function detectarLetra(landmarks) {
  if (!landmarks) return null

  // Puntas de dedos
  const P = landmarks[4]   // pulgar
  const I = landmarks[8]   // índice
  const M = landmarks[12]  // medio
  const A = landmarks[16]  // anular
  const N = landmarks[20]  // meñique

  // Articulaciones medias
  const Ib = landmarks[6]
  const Mb = landmarks[10]
  const Ab = landmarks[14]
  const Nb = landmarks[18]

  // Nudillos base
  const I0 = landmarks[5]
  const M0 = landmarks[9]
  const A0 = landmarks[13]
  const N0 = landmarks[17]
  const P0 = landmarks[2]  // base pulgar

  // Muñeca
  const W = landmarks[0]

  // ── Helpers ─────────────────────────────────────────────
  function ext(punta, base) {
    return punta.y < base.y - 0.02
  }

  function dist(a, b) {
    return Math.sqrt(
      Math.pow(a.x - b.x, 2) +
      Math.pow(a.y - b.y, 2) +
      Math.pow(a.z - b.z, 2)
    )
  }

  function cerca(a, b, umbral = 0.07) {
    return dist(a, b) < umbral
  }

  // Estado de cada dedo
  const iExt = ext(I, Ib)
  const mExt = ext(M, Mb)
  const aExt = ext(A, Ab)
  const nExt = ext(N, Nb)

  // Pulgar extendido hacia el lado
  const pExt = P.x < P0.x - 0.04 || P.x > P0.x + 0.04

  const todosAbajo  = !iExt && !mExt && !aExt && !nExt
  const todosArriba = iExt && mExt && aExt && nExt

  // ── Letras ──────────────────────────────────────────────

  // A — puño cerrado, pulgar al lado
  if (todosAbajo && pExt) return 'A'

  // B — cuatro dedos juntos arriba, pulgar doblado
  if (todosArriba && !pExt) return 'B'

  // C — mano curvada en C (todos semi-extendidos, palma al frente)
  if (!iExt && !mExt && !aExt && !nExt && cerca(I, M, 0.05) && cerca(P, N, 0.12)) return 'C'

  // D — índice arriba, los demás curvados tocando el pulgar
  if (iExt && !mExt && !aExt && !nExt && cerca(P, M, 0.07)) return 'D'

  // E — todos los dedos doblados hacia la palma
  if (todosAbajo && !pExt && cerca(I, W, 0.25)) return 'E'

  // F — índice y pulgar se tocan, otros extendidos
  if (!iExt && mExt && aExt && nExt && cerca(P, I, 0.06)) return 'F'

  // G — índice y pulgar apuntan al lado
  if (iExt && !mExt && !aExt && !nExt && Math.abs(I.y - W.y) < 0.15) return 'G'

  // H — índice y medio apuntan horizontalmente
  if (iExt && mExt && !aExt && !nExt && Math.abs(I.y - M.y) < 0.04) return 'H'

  // I — solo meñique arriba
  if (!iExt && !mExt && !aExt && nExt) return 'I'

  // K — índice arriba, medio semi-arriba, pulgar entre ellos
  if (iExt && mExt && !aExt && !nExt && P.y < M.y && P.y > I.y) return 'K'

  // L — índice arriba y pulgar extendido en L
  if (iExt && !mExt && !aExt && !nExt && pExt) return 'L'

  // M — tres dedos sobre el pulgar
  if (!iExt && !mExt && !aExt && !nExt && cerca(I, M, 0.04) && cerca(M, A, 0.04)) return 'M'

  // N — índice y medio sobre el pulgar
  if (!iExt && !mExt && !aExt && !nExt && cerca(I, M, 0.04) && !cerca(M, A, 0.06)) return 'N'

  // O — dedos forman un círculo con el pulgar
  if (!iExt && !mExt && !aExt && !nExt && cerca(P, I, 0.05)) return 'O'

  // P — índice apunta hacia abajo, pulgar extendido
  if (I.y > I0.y + 0.05 && pExt && !mExt) return 'P'

  // Q — índice y pulgar apuntan hacia abajo
  if (I.y > I0.y + 0.05 && P.y > P0.y + 0.05 && !mExt) return 'Q'

  // R — índice y medio cruzados
  if (iExt && mExt && !aExt && !nExt && cerca(I, M, 0.04) && I.x < M.x) return 'R'

  // S — puño cerrado con pulgar sobre dedos
  if (todosAbajo && !pExt && P.y < I.y) return 'S'

  // T — pulgar entre índice y medio
  if (!iExt && !mExt && !aExt && !nExt && P.y < I.y && P.x > I0.x) return 'T'

  // U — índice y medio juntos arriba
  if (iExt && mExt && !aExt && !nExt && cerca(I, M, 0.05)) return 'U'

  // V — índice y medio separados arriba (victoria)
  if (iExt && mExt && !aExt && !nExt && dist(I, M) > 0.07) return 'V'

  // W — índice, medio y anular arriba separados
  if (iExt && mExt && aExt && !nExt) return 'W'

  // X — índice curvado como gancho
  if (!iExt && !mExt && !aExt && !nExt && I.y < Ib.y + 0.02) return 'X'

  // Y — pulgar y meñique extendidos
  if (!iExt && !mExt && !aExt && nExt && pExt) return 'Y'

  return null
}