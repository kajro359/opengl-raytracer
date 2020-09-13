#version 150

out vec4 out_Color;
in vec3 ex_Color;
uniform vec3 in_Color;
// in vec3 ex_Normal;
// uniform int objID;

void main(void)
{
  
    out_Color = vec4(in_Color, 1);
}
