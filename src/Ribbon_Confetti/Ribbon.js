import * as THREE from "three";
import { InstancedFlow } from "three/examples/jsm/modifiers/CurveModifier.js";

class Ribbon {
  constructor(scene, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.width = width;
    this.height = height;
    this.aspect = this.width / this.height;

    this.ribbonSpeed = 0.001;
    this.ribbonCount = 10;

    // Initialize ribbons
    this.ribbonArr = [this.createRibbons()];
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200, 0x0000ff, 0xffff00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  createRibbons() {
    const planeGeometry = new THREE.PlaneGeometry(0.1, 1.8, 100, 100);
    planeGeometry.rotateX(Math.PI / 2);
    planeGeometry.rotateY(Math.PI / 2);

    const planeMaterial = new THREE.MeshBasicMaterial({
      map: this.texture,
      side: THREE.FrontSide,
      transparent: true,
    });

    const points = this.generateStaticPoints();
    const curves = points.map((pnts) => new THREE.CatmullRomCurve3(pnts, false, "centripetal", 0.7));

    const flow = new InstancedFlow(
      this.ribbonCount,
      curves.length,
      planeGeometry,
      planeMaterial
    );

    curves.forEach((curve, i) => flow.updateCurve(i, curve));

    for (let i = 0; i < this.ribbonCount; i++) {
      const curveIndex = i % curves.length;
      flow.setCurve(i, curveIndex);
      flow.moveIndividualAlongCurve(i, i / this.ribbonCount);
      flow.object3D.setColorAt(
        i,
        new THREE.Color(this.getRandomColor())
      );
    }

    flow.object3D.instanceMatrix.needsUpdate = true;
    this.scene.add(flow.object3D);

    return flow;
  }

  generateStaticPoints() {
    const topScreen = 10; // Adjusted for perspective
    const bottomScreen = -5; // Adjusted for perspective
    const totalPoints = 20;
    const yIncrement = (topScreen - bottomScreen) / (totalPoints - 1);
    const xOffsets = [-Math.random() * 8, Math.random() * 8, -Math.random() * 8, Math.random() * 8, -Math.random() * 8,Math.random() * 8];

    const pointsArray = Array(xOffsets.length)
      .fill()
      .map(() => []);

    let isPos = true;
    for (let i = 0; i < totalPoints; i++) {
      const y = topScreen - i * yIncrement;
      const z = (i === 0 || i === 1 || i === totalPoints - 1 || i === totalPoints - 2) ? -50 : Math.random() < 0.5 ? -3.5 : 3.5;

      xOffsets.forEach((x, j) => {
        pointsArray[j].push(
          new THREE.Vector3(
            isPos ? x + 0.3 : x - 0.3,
            y,
            0
          )
        );
      });
      isPos = !isPos;
    }

    return pointsArray;
  }

  updateResize(newWidth, newHeight) {
    this.aspect = newWidth / newHeight;

    // Define a distance factor to space out ribbons
    const distanceFactor = 0.05; // Adjust this value to control ribbon spacing

    // Update each ribbon's geometry and curve points
    this.ribbonArr.forEach((flow) => {
      if (flow) {
        const points = this.generateStaticPoints();
        const curves = points.map(
          (pnts) => new THREE.CatmullRomCurve3(pnts, false, "centripetal", 0.7)
        );

        // Update curves in the InstancedFlow instance
        curves.forEach((curve, i) => flow.updateCurve(i, curve));

        // Adjust ribbon positions along the new curves, ensuring they don't overlap
        for (let i = 0; i < this.ribbonCount; i++) {
          const curveIndex = i % curves.length;

          // Calculate the adjusted position to avoid overlap
          const t = (i + distanceFactor * i) / this.ribbonCount;  // Adjust 't' to space out ribbons

          // Apply adjusted t value to move the ribbon along the curve
          flow.setCurve(i, curveIndex);
          flow.moveIndividualAlongCurve(i, t);
        }

        flow.object3D.instanceMatrix.needsUpdate = true;
      }
    });
  }

  animateRibbons() {
    this.ribbonArr.forEach((flow, i) => {
      if (flow) {
        for (let i = 0; i < this.ribbonCount; i++) {
          flow.moveIndividualAlongCurve(i, this.ribbonSpeed);
        }
      }
    });
  }

  dispose() {
    this.ribbonArr.forEach((flow) => {
      if (flow) {
        this.scene.remove(flow.object3D);
        flow.object3D.geometry.dispose();
        flow.object3D.material.dispose();
        if (this.texture) this.texture.dispose();
        flow = null;
        this.texture = null;
      }
    });
  }
}

export default Ribbon;
