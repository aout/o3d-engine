#ifdef GL_ES
precision highp float;
#endif

varying vec2 vTextureCoord;

uniform sampler2D uSampler0;

void	main(void) {
	//gl_FragColor = texture2D(uSampler0, vec2(vTextureCoord.s, vTextureCoord.t));
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
}
