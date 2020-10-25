#ifdef GL_ES
    precision highp float;
#endif

varying vec2 tPos;

void main(void) {
    gl_FragColor = vec4(tPos, 0.0, 1.0);
}
