let gl = null;
let glCanvas = null;

function initwebGL() {
    glCanvas = document.getElementById("glcanvas");
    gl = glCanvas.getContext("webgl");
}


function compileShader(id, type) {
  console.log(document.getElementById(id));
  let code = document.getElementById(id).firstChild.nodeValue;
  let shader = gl.createShader(type);

  gl.shaderSource(shader, code);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.log(`Error compiling ${type === gl.VERTEX_SHADER ? "vertex" : "fragment"} shader:`);
    console.log(gl.getShaderInfoLog(shader));
  }

  return shader;
}

function buildShaderProgram(shaderInfo, uniforms, attributes) {
  let program = gl.createProgram();

  shaderInfo.forEach(function(desc) {
    let shader = compileShader(desc.id, desc.type);
    if (shader) {
      gl.attachShader(program, shader);
    }
  });

  gl.linkProgram(program)

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.log("Error linking shader program:");
    console.log(gl.getProgramInfoLog(program));
  }

  var unifrorms_dict = {}
  uniforms.forEach(function(name) {
    uniform_id = gl.getUniformLocation(program, name);
    unifrorms_dict[name] = uniform_id;
  });

  var attributes_dict = {}
  attributes.forEach(function(name) {
    attrib_id = gl.getAttribLocation(program, name);
    attributes_dict[name] = attrib_id;
  });

  return {
    program:program, 
    uniforms:unifrorms_dict,
    attributes:attributes_dict
  };
}


// Vertex information
let vertexBuffer;
let vertexCount;

window.addEventListener("load", startup, false);

function startup() {
  initwebGL();

  const shaderSet = [
    {
      type: gl.VERTEX_SHADER,
      id: "vertex-shader"
    },
    {
      type: gl.FRAGMENT_SHADER,
      id: "fragment-shader"
    }
  ];

  const shaderUniforms = [
	  "seed",
	  "inverted_seed",
	  "viewport"
  ];
  const shaderAttributes = [
    "aVertexPosition",
    "aTexturePosition"
  ];

  shaderProgram = buildShaderProgram(shaderSet, 
                                     shaderUniforms,
                                     shaderAttributes);
  console.log(shaderProgram)

  // Here are attributes for 4 vertices (one per line):
  // - The first two numbers are vertex positions.
  // - The second two numbers are texture positions.

  let vertices = new Float32Array([
      -1,  1, 0, 0,
       1,  1, 1, 0,
      -1, -1, 0, 1,
       1, -1, 1, 1
  ]);

  vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  vertexCount = vertices.length / 4;

  animateScene();

}


function resize(canvas) {
    // Look up the size the browser is displaying the canvas.
    var displayWidth  = canvas.clientWidth;
    var displayHeight = canvas.clientHeight;

    // Check if the canvas has different size and make it the same.

    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) 
    {
        canvas.width  = displayWidth;
        canvas.height = displayHeight;
    }
}

var seed = 0;
var increment = 0.005;

function animateScene() {
    // We need an actual window size for correctly viewport setup.
    resize(glCanvas);  

    // Setup viewport and clear it with black non transparent colour.
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Select a buffer for vertices attributes.
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Enable and setup attributes.
    gl.enableVertexAttribArray(shaderProgram.attributes["aVertexPosition"]);
    gl.vertexAttribPointer(shaderProgram.attributes["aVertexPosition"], 2,
        gl.FLOAT, false, 4 * 4, 0);
    gl.enableVertexAttribArray(shaderProgram.attributes["aTexturePosition"]);
    gl.vertexAttribPointer(shaderProgram.attributes["aTexturePosition"], 2,
        gl.FLOAT, false, 4 * 4, 2 * 4);

    // Select shader program.
    gl.useProgram(shaderProgram.program);
    gl.uniform2fv(shaderProgram.uniforms["viewport"], [glCanvas.width, glCanvas.height]);


    seed += increment; if(seed >= 1 || seed <= 0) { increment = -increment; }
    inverted_seed = Math.abs(seed-1);
    gl.uniform1f(shaderProgram.uniforms["seed"], seed);
    gl.uniform1f(shaderProgram.uniforms["inverted_seed"], inverted_seed);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexCount);

    window.requestAnimationFrame(function(currentTime) {
        previousTime = currentTime;
        animateScene();
    });
}
