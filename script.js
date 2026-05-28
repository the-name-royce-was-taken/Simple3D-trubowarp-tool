import * as THREE from "three";

import { OrbitControls }
from "three/addons/controls/OrbitControls.js";

import { STLLoader }
from "three/addons/loaders/STLLoader.js";

import { OBJLoader }
from "three/addons/loaders/OBJLoader.js";

import { GLTFLoader }
from "three/addons/loaders/GLTFLoader.js";

const canvas = document.getElementById("canvas");

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(2, 2, 2);

const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true
});

renderer.setSize(
  window.innerWidth / 2,
  window.innerHeight
);

const controls = new OrbitControls(
  camera,
  renderer.domElement
);

controls.enableDamping = true;

const light = new THREE.DirectionalLight(0xffffff, 3);

light.position.set(5, 5, 5);

scene.add(light);

scene.add(new THREE.AmbientLight(0xffffff, 1));

let currentMesh = null;

animate();

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

window.addEventListener("resize", () => {

  renderer.setSize(
    window.innerWidth / 2,
    window.innerHeight
  );

  camera.aspect =
    (window.innerWidth / 2) / window.innerHeight;

  camera.updateProjectionMatrix();

});

document
.getElementById("fileInput")
.addEventListener("change", loadModel);

function loadModel(event) {

  const file = event.target.files[0];

  if (!file) return;

  const ext =
    file.name.split(".").pop().toLowerCase();

  const reader = new FileReader();

  reader.onload = function(e) {

    if (currentMesh) {
      scene.remove(currentMesh);
    }

    if (ext === "stl") {

      const loader = new STLLoader();

      const geometry =
        loader.parse(e.target.result);

      createMesh(geometry);

    }

    else if (ext === "obj") {

      const loader = new OBJLoader();

      const obj =
        loader.parse(e.target.result);

      obj.traverse(child => {

        if (child.isMesh) {
          createMesh(child.geometry);
        }

      });

    }

    else if (ext === "glb" || ext === "gltf") {

      const loader = new GLTFLoader();

      loader.parse(
        e.target.result,
        "",
        gltf => {

          gltf.scene.traverse(child => {

            if (child.isMesh) {
              createMesh(child.geometry);
            }

          });

        }
      );

    }

  };

if (
  ext === "stl" ||
  ext === "glb"
) {

  reader.readAsArrayBuffer(file);

}

else if (ext === "gltf") {

  reader.readAsText(file);

}

else {

  reader.readAsText(file);

}

}

function createMesh(geometry) {

  console.log("Creating mesh...");

  geometry.computeVertexNormals();

  if (!geometry.attributes.uv) {
    generateUVs(geometry);
  }

  const material = new THREE.MeshStandardMaterial({
    color: 0xcccccc
  });

  currentMesh = new THREE.Mesh(
    geometry,
    material
  );

  scene.add(currentMesh);

  /* =========================
     HIDE PLACEHOLDER
  ========================= */

  const placeholder =
    document.getElementById("placeholder");

  if (placeholder) {
    placeholder.style.display = "none";
  }

  /* =========================
     SHOW LISTS
  ========================= */

  const lists =
    document.getElementById("lists");

  if (lists) {
    lists.hidden = false;
    lists.style.display = "block";
  }

  exportLists(geometry);

}

function generateUVs(geometry) {

  geometry.computeBoundingBox();

  const pos = geometry.attributes.position;

  const box = geometry.boundingBox;

  const size = new THREE.Vector3();

  box.getSize(size);

  const uv = [];

  for (let i = 0; i < pos.count; i++) {

    const x = pos.getX(i);
    const z = pos.getZ(i);

    const u =
      (x - box.min.x) / size.x;

    const v =
      (z - box.min.z) / size.z;

    uv.push(u, v);

  }

  geometry.setAttribute(
    "uv",
    new THREE.Float32BufferAttribute(uv, 2)
  );

}

function exportLists(geometry) {

  const pos =
    geometry.attributes.position;

  const uv =
    geometry.attributes.uv;

  let x = "";
  let y = "";
  let z = "";

  let u = "";
  let v = "";
  let w = "";

  for (let i = 0; i < pos.count; i++) {

    x += pos.getX(i) + "\n";
    y += pos.getY(i) + "\n";
    z += pos.getZ(i) + "\n";

    u += uv.getX(i) + "\n";
    v += uv.getY(i) + "\n";

    w += "0\n";

  }

  document.getElementById("xOut").value = x;
  document.getElementById("yOut").value = y;
  document.getElementById("zOut").value = z;

  document.getElementById("uOut").value = u;
  document.getElementById("vOut").value = v;
  document.getElementById("wOut").value = w;

}
