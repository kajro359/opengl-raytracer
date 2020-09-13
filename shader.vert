#version 150

in vec3 in_Position;

out vec3 p0;
out vec3 u;
uniform float aspectratio;

void main(void)
{
  p0 = vec3(0,0.2,0);
  gl_Position = vec4(in_Position, 1.0);
  u = normalize(vec3(in_Position.x * aspectratio, in_Position.y, -1));
}
