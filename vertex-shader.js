attribute vec2 aVertexPosition;
attribute vec2 aTexturePosition;
varying vec2 tPos;

void main() {
    tPos = aTexturePosition;
    gl_Position = vec4(aVertexPosition, 0.0, 1.0);

}
