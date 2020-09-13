#version 150

in vec3 in_Normal;
in vec3 in_Position;
out vec3 ex_Normal;
// in vec3 in_Color;

uniform mat4 projectionMatrix;
uniform mat4 modelToWorldMatrix;
uniform mat4 worldToViewMatrix;

out vec3 ex_Color;
out vec3 fragPos;
out vec3 camPos;

uniform int window_Width;
uniform int window_Height;

void main(void)
{
  // fragPos = vec3(modelToWorldMatrix * vec4(in_Position,1));
  // camPos = vec3(inverse(worldToViewMatrix) * vec4(0.0f,0.0f,0.0f,1.0f));

  mat4 total = projectionMatrix * worldToViewMatrix * modelToWorldMatrix;
  // ex_Color = in_Color;
  //out_Normal = in_Normal;
	gl_Position = total * vec4(in_Position,1);
}
