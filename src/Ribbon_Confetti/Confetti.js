import * as THREE from "three";

export default class Confetti {
  constructor(scene, width, height, texture) {
    this.scene = scene;
    this.texture = texture;
    this.aspect = width / height;

    this.confettiCount = 150;
    this.ribbonRotationSpeed = 0.2
    this.ribbonSpeed = 0.02

    this.confettiPapers = [this.createConfetti()];
  }

  createConfetti() {
    const geometry = new THREE.InstancedBufferGeometry().copy(
      new THREE.PlaneGeometry(0.12, 0.12)
    );
    const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide });
    const confetti = new THREE.InstancedMesh(
      geometry,
      material,
      this.confettiCount
    );

    for (let i = 0; i < this.confettiCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * this.aspect * 8 ,
        5,
        0
      );
      
      const randomColor = new THREE.Color(this.getRandomColor());

      confetti.setMatrixAt(
        i,
        new THREE.Matrix4().compose(
          position,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        )
      );
      confetti.setColorAt(i, randomColor);
      confetti.userData[i] = this.getRandomSpeed();
    }

    this.scene.add(confetti);
    return confetti;
  }

  updateSize(width, height) {
    this.aspect = width / height;

    this.confettiPapers.forEach((confetti) => {
      for (let i = 0; i < this.confettiCount; i++) {
        const position = new THREE.Vector3(
          (Math.random() - 0.5) * this.aspect * 8,
          (Math.random() - 0.5) * 5,
          0
        );

        const matrix = new THREE.Matrix4();
        confetti.getMatrixAt(i, matrix);
        matrix.compose(
          position,
          new THREE.Quaternion(),
          new THREE.Vector3(1, 1, 1)
        );
        confetti.setMatrixAt(i, matrix);
      }
      confetti.instanceMatrix.needsUpdate = true;
    });
  }

  getRandomSpeed() {
    return {
      xSpeed: (Math.random() - 0.5) * 0.03,
      ySpeed: -(Math.random() * 0.04 + this.ribbonSpeed),
      zSpeed: 0,
      rotationSpeed: (Math.random() - 0.5) * 0,
    };
  }

  getRandomColor() {
    const colors = [0xdf0049, 0x00e857, 0x2bebbc, 0xffd200, 0x0000ff, 0xffff00];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  animateConfetti(elapsedTime) {
    this.confettiPapers.forEach((confetti) => {
      for (let i = 0; i < this.confettiCount; i++) {
        const { xSpeed, ySpeed, zSpeed, rotationSpeed } = confetti.userData[i];
        const matrix = new THREE.Matrix4();
        const position = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        const scale = new THREE.Vector3();

        confetti.getMatrixAt(i, matrix);
        matrix.decompose(position, quaternion, scale);

        position.x += xSpeed;
        position.y += ySpeed;
        position.z += zSpeed;

        if (
          position.x < -5 * this.aspect ||
          position.x > 5 * this.aspect ||
          position.y < -5 ||
          position.y > 5
        ) {
          position.set(
            (Math.random() - 0.5) * this.aspect * 8,
            5,
            0,
          );
        }

        const rippleRotation = this.getRippleRotation(elapsedTime, i, rotationSpeed);
        matrix.compose(
          position,
          rippleRotation,
          new THREE.Vector3(1, 1, 1)
        );

        confetti.setMatrixAt(i, matrix);
        confetti.instanceMatrix.needsUpdate = true;
      }
    });
  }

  getRippleRotation(elapsedTime, i, rotationSpeed) {
    const rippleX = Math.sin(elapsedTime * 3 + i * 0.5) * this.ribbonRotationSpeed;
    const rippleY = Math.cos(elapsedTime * 2 + i * 0.8) * this.ribbonRotationSpeed;
    const rippleZ = 0;

    return new THREE.Quaternion().setFromEuler(
      new THREE.Euler(
        rotationSpeed + rippleX * 50,
        rotationSpeed + rippleY * 50,
        rippleZ
      )
    );
  }

  dispose() {
    this.confettiPapers.forEach((confetti) => {
      this.scene.remove(confetti);
      confetti.geometry.dispose();
      confetti.material.dispose();
    });
    this.confettiPapers = [];
  }
}
