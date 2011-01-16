/** 
 *  Basic vertex attributes
 */

// Vertex Position. Required
attribute vec3 POSITION;

// Vertex Normal. Required if lighting enabled
attribute vec3 NORMAL;

// Vertex Texture Coordinates. Required if diffuse component is a texture
attribute vec2 TEXCOORD;

/**
 *  Vertex Attributes for advanced rendering technique
 */
attribute vec3 TEXTANGENT;
attribute vec3 TEXBINORMAL;

/**
 *  Animation variables
 */

// Do 'entity' have a skeleton
uniform bool uhasSkeleton;

// Maximum number of joints
const int MAX_JOINTS = 60;

// The joints of the entity
uniform mat4 uJoints[MAX_JOINTS];

// Association of the vertex and his joint(s)
// aVertexWeight_n.x: indice in uJoints array
// aVertexWeight_n.y: corresponding weight. 0 to ignore
attribute vec2 aVertexWeight_0;
attribute vec2 aVertexWeight_1;
attribute vec2 aVertexWeight_2;
attribute vec2 aVertexWeight_3;

/**
 *  Matrices
 */
 
 // ModelView (or World) matrix
uniform mat4 uMVMatrix;

// Eye matrix. Could be a camera or a light
uniform mat4 uEMatrix;

// Projection matrix
uniform mat4 uPMatrix;

// Normal matrix
uniform mat4 uNMatrix;

/**
 *  Lighting variables
 */

uniform int uLightingEnabled;

uniform vec3 uLightingDirection;

uniform vec3 uAmbientColor;
uniform vec3 uDirectionalColor;
 
varying vec2 vTextureCoord;
varying vec3 vLightWeighting;

void	main(void) {
	gl_Position = uPMatrix * uEMatrix * uMVMatrix * vec4(POSITION, 1.0);
	vTextureCoord = TEXCOORD;
  if (uLightingEnabled == 0) {
    vLightWeighting = vec3(1.0, 1.0, 1.0);
  }
  else {
    vec4 transformedNormal = uNMatrix * vec4(NORMAL, 1.0);
    vec4 tmp = vec4(uLightingDirection, 1.0);
    float directionalLightWeighting = max(dot(transformedNormal.xyz, tmp.xyz), 0.0);
    vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting;
  }
}
