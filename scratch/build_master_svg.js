const fs = require('fs');

const p1 = fs.readFileSync('assets/images/wheel-elements/p1.svg', 'utf8');
const p2 = fs.readFileSync('assets/images/wheel-elements/p2.svg', 'utf8');
const p3 = fs.readFileSync('assets/images/wheel-elements/p3.svg', 'utf8');
const p4 = fs.readFileSync('assets/images/wheel-elements/p4.svg', 'utf8');
const p5 = fs.readFileSync('assets/images/wheel-elements/p5.svg', 'utf8');
const center = fs.readFileSync('assets/images/wheel-elements/wheel-center.svg', 'utf8');

function getInnerSvg(content) {
  return content.replace(/<\?xml[^>]*\?>/gi, '')
                .replace(/<svg[^>]*>/gi, '')
                .replace(/<\/svg>/gi, '')
                .trim();
}

const masterSvg = `<svg width="560" height="560" viewBox="0 0 560 560" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="pod-gold-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="8" flood-color="#C8A24B" flood-opacity="0.9"/>
    </filter>
  </defs>

  <!-- Group 1: Rotatable Outer Orbit (Dashed track + 5 pods) -->
  <g id="svg-orbit-rotator" transform-origin="280 280">
    <!-- Dashed Ring -->
    <circle cx="280" cy="280" r="233.469" fill="#14213D" stroke="#C8A24B" stroke-width="14.0337" stroke-dasharray="2.55 2.55"/>

    <!-- Pod 1: P1 Pourquoi (Top) -->
    <g id="svg-pod-0" class="svg-wheel-pod active" transform="translate(218.12, 1.24)" transform-origin="61.88 45.29">
      ${getInnerSvg(p1)}
    </g>

    <!-- Pod 2: P2 Personnes (Top-Right) -->
    <g id="svg-pod-1" class="svg-wheel-pod" transform="translate(452.60, 162.56)" transform-origin="49.44 45.29">
      ${getInnerSvg(p2)}
    </g>

    <!-- Pod 3: P3 Processus (Bottom-Right) -->
    <g id="svg-pod-2" class="svg-wheel-pod" transform="translate(361.23, 423.59)" transform-origin="56.00 45.29">
      ${getInnerSvg(p3)}
    </g>

    <!-- Pod 4: P4 Profitabilité (Bottom-Left) -->
    <g id="svg-pod-3" class="svg-wheel-pod" transform="translate(75.27, 423.59)" transform-origin="67.50 45.29">
      ${getInnerSvg(p4)}
    </g>

    <!-- Pod 5: P5 Propulsion (Top-Left) -->
    <g id="svg-pod-4" class="svg-wheel-pod" transform="translate(-9.73, 162.56)" transform-origin="67.69 45.29">
      ${getInnerSvg(p5)}
    </g>
  </g>

  <!-- Group 2: Center Gold Disc (Stationary, Always Upright) -->
  <g id="svg-center-disc" transform="translate(150.51, 150.51)" transform-origin="129.49 129.49">
    ${getInnerSvg(center)}
  </g>
</svg>`;

fs.writeFileSync('assets/images/wheel-elements/master-5p-wheel.svg', masterSvg);
console.log('Successfully created master-5p-wheel.svg, size:', masterSvg.length);
