interface Point2D {
  x: number;
  y: number;
}

/**
 * Solves the affine transform matrix mapping (sx0, sy0) -> (dx0, dy0), etc.
 * Returns [a, b, c, d, e, f] for ctx.transform()
 */
export function getAffineTransform(
  s0: Point2D, s1: Point2D, s2: Point2D,
  d0: Point2D, d1: Point2D, d2: Point2D
): [number, number, number, number, number, number] | null {
  const sx0 = s0.x, sy0 = s0.y;
  const sx1 = s1.x, sy1 = s1.y;
  const sx2 = s2.x, sy2 = s2.y;

  const dx0 = d0.x, dy0 = d0.y;
  const dx1 = d1.x, dy1 = d1.y;
  const dx2 = d2.x, dy2 = d2.y;

  // Det of matrix M
  const det = sx0 * (sy1 - sy2) - sy0 * (sx1 - sx2) + (sx1 * sy2 - sx2 * sy1);

  if (Math.abs(det) < 0.0001) {
    return null; // Singular matrix, points are collinear
  }

  const idet = 1.0 / det;

  // Inverse matrix coefficients
  const m00 = (sy1 - sy2) * idet;
  const m01 = (sy2 - sy0) * idet;
  const m02 = (sy0 - sy1) * idet;

  const m10 = (sx2 - sx1) * idet;
  const m11 = (sx0 - sx2) * idet;
  const m12 = (sx1 - sx0) * idet;

  const m20 = (sx1 * sy2 - sx2 * sy1) * idet;
  const m21 = (sx2 * sy0 - sx0 * sy2) * idet;
  const m22 = (sx0 * sy1 - sx1 * sy0) * idet;

  // Compute transformation parameters
  const a = m00 * dx0 + m01 * dx1 + m02 * dx2;
  const c = m10 * dx0 + m11 * dx1 + m12 * dx2;
  const e = m20 * dx0 + m21 * dx1 + m22 * dx2;

  const b = m00 * dy0 + m01 * dy1 + m02 * dy2;
  const d = m10 * dy0 + m11 * dy1 + m12 * dy2;
  const f = m20 * dy0 + m21 * dy1 + m22 * dy2;

  return [a, b, c, d, e, f];
}

/**
 * Draws a single warped triangle from an image onto a canvas.
 */
export function drawWarpedTriangle(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  s0: Point2D, s1: Point2D, s2: Point2D,
  d0: Point2D, d1: Point2D, d2: Point2D
) {
  const matrix = getAffineTransform(s0, s1, s2, d0, d1, d2);
  if (!matrix) return;

  ctx.save();

  // Create clipping path for the destination triangle
  ctx.beginPath();
  ctx.moveTo(d0.x, d0.y);
  ctx.lineTo(d1.x, d1.y);
  ctx.lineTo(d2.x, d2.y);
  ctx.closePath();
  ctx.clip();

  // Apply the transformation matrix
  const [a, b, c, d, e, f] = matrix;
  ctx.transform(a, b, c, d, e, f);

  // Draw the image
  ctx.drawImage(img, 0, 0);

  ctx.restore();
}

/**
 * Render a complete garment onto a canvas warped to body keypoints.
 * Fits the garment using 5 triangles.
 */
export function renderWarpedGarment(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  garmentType: 'top' | 'bottom' | 'full',
  keypoints: { x: number; y: number; score?: number }[]
) {
  // MoveNet indices: 5: Left Shoulder, 6: Right Shoulder, 11: Left Hip, 12: Right Hip
  const ls = keypoints[5];
  const rs = keypoints[6];
  const lh = keypoints[11];
  const rh = keypoints[12];

  if (!ls || !rs || !lh || !rh) return;

  const imgW = img.width;
  const imgH = img.height;

  // 1. Source points on the flat garment image
  const sNeck: Point2D = { x: imgW * 0.5, y: 0 };
  const sLS: Point2D = { x: 0, y: imgH * 0.18 };
  const sRS: Point2D = { x: imgW, y: imgH * 0.18 };
  const sCenter: Point2D = { x: imgW * 0.5, y: imgH * 0.5 };
  const sLH: Point2D = { x: imgW * 0.15, y: imgH };
  const sRH: Point2D = { x: imgW * 0.85, y: imgH };

  // 2. Compute Destination points on the body
  // Neck center is midpoint between shoulders, shifted up slightly for a nice collar fit
  const shoulderDist = Math.sqrt(Math.pow(rs.x - ls.x, 2) + Math.pow(rs.y - ls.y, 2));
  const neckShiftY = -shoulderDist * 0.12;
  const dNeck: Point2D = {
    x: (ls.x + rs.x) / 2,
    y: (ls.y + rs.y) / 2 + neckShiftY
  };

  // Shoulder coordinates (scaled outwards slightly for natural fitting)
  const padX = (rs.x - ls.x) * 0.08;
  const padY = (rs.y - ls.y) * 0.08;
  const dLS: Point2D = { x: ls.x - padX, y: ls.y - padY };
  const dRS: Point2D = { x: rs.x + padX, y: rs.y + padY };

  // Hips
  let dLH: Point2D = { x: lh.x, y: lh.y };
  const dRH: Point2D = { x: rh.x, y: rh.y };

  // If it's a full dress, project the hemline further down from the hips
  if (garmentType === 'full') {
    const torsoHeight = ((lh.y + rh.y) / 2) - ((ls.y + rs.y) / 2);
    dLH = {
      x: lh.x + (lh.x - ls.x) * 0.35,
      y: lh.y + torsoHeight * 0.85
    };
    dRH.x = rh.x + (rh.x - rs.x) * 0.35;
    dRH.y = rh.y + torsoHeight * 0.85;
  }

  // Hip Center & Neck Center midpoint defines chest center
  const dHipCenter: Point2D = {
    x: (lh.x + rh.x) / 2,
    y: (lh.y + rh.y) / 2
  };
  const dCenter: Point2D = {
    x: (dNeck.x + dHipCenter.x) / 2,
    y: (dNeck.y + dHipCenter.y) / 2
  };

  // 3. Render the 5 triangles to warp the garment
  // Triangle 1: Neck - Left Shoulder - Center
  drawWarpedTriangle(ctx, img, sNeck, sLS, sCenter, dNeck, dLS, dCenter);

  // Triangle 2: Neck - Right Shoulder - Center
  drawWarpedTriangle(ctx, img, sNeck, sRS, sCenter, dNeck, dRS, dCenter);

  // Triangle 3: Left Shoulder - Left Hip - Center
  drawWarpedTriangle(ctx, img, sLS, sLH, sCenter, dLS, dLH, dCenter);

  // Triangle 4: Right Shoulder - Right Hip - Center
  drawWarpedTriangle(ctx, img, sRS, sRH, sCenter, dRS, dRH, dCenter);

  // Triangle 5: Left Hip - Right Hip - Center
  drawWarpedTriangle(ctx, img, sLH, sRH, sCenter, dLH, dRH, dCenter);
}
