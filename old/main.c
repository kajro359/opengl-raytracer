#ifdef __APPLE__
	#include <OpenGL/gl3.h>
	// Linking hint for Lightweight IDE
	// uses framework Cocoa
#endif
#include <stdio.h>
#include <math.h>

#include "MicroGlut.h"
#include "GL_utilities.h"
#include "VectorUtils3.h"
#include "loadobj.h"

// Globals
// Reference to shader program
GLuint program;
Model *wall, *sphere;
vec3
  camPos,
  lightSourcePos,
  lightSourceColor
	// wall_Color,
	// sphere_Color
  ;

GLint window_Width = 600;
GLint window_Height = 600;
GLfloat wall_Color[] = {0.3f, 0.1f, 0.6f};
GLfloat sphere_Color[] = {0.6f, 0.3f, 0.1f};

// matrices
mat4
  transWall,
  scaleWall,
  modelToWorldWall,
  projectionMatrix,
	transSphere,
  scaleSphere,
  modelToWorldSphere,
  worldToViewMatrix
  ;


void init(void)
{
  dumpInfo();

  // GL inits
  glClearColor(0.2,0.6,0.2,0);
  glutInitDisplayMode(GLUT_RGB | GLUT_DOUBLE | GLUT_DEPTH);
  glEnable(GL_DEPTH_TEST);
  // glDisable(GL_CULL_FACE);

  // Load and compile shaders
	program = loadShaders("shader.vert", "shader.frag");
	glUseProgram(program);
	printError("init shader");

  // Load models

  wall = LoadModelPlus("objects/plane.obj");
	sphere = LoadModelPlus("objects/groundsphere.obj");

	// Model colors
	// wall_Color = SetVector(0,1,0);
	// sphere_Color = SetVector(1,0,0);
  // Camera vectors
  camPos = SetVector(0, 0, 10);

  // matrices
  projectionMatrix = frustum(-0.1, 0.1, -0.1, 0.1, 0.2, 200.0);
	// projectionMatrix = IdentityMatrix();

  transWall = T(0, 0, -1);
  scaleWall = S(1, 1, 1);
  modelToWorldWall = Mult(transWall, scaleWall);

	transSphere = T(0, 0, -5);
  scaleSphere = S(1, 1, 1);
  modelToWorldSphere = Mult(transSphere, scaleSphere);

  worldToViewMatrix = lookAtv
    (
      camPos,
      SetVector(0,0,-1),
      SetVector(0,1,0)
    );

  // specify (static) position of light source and upload
	lightSourcePos = SetVector(1,1,1);
	lightSourceColor = SetVector(1,1,1);
	glUniform3fv(glGetUniformLocation(program, "lightSourcePos"), 1, &lightSourcePos.x);
	glUniform3fv(glGetUniformLocation(program, "lightSourceColor"), 1, &lightSourceColor.x);
}


void display(void)
{
  // clear the screen
  glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

  // upload matrices
  glUniformMatrix4fv(glGetUniformLocation(program, "worldToViewMatrix"), 1, GL_TRUE, worldToViewMatrix.m);
	glUniformMatrix4fv(glGetUniformLocation(program, "projectionMatrix"), 1, GL_TRUE, projectionMatrix.m);


  // draw a wall.
	glUniform3fv(glGetUniformLocation(program, "in_Color"), 1, wall_Color);
  glUniformMatrix4fv(glGetUniformLocation(program, "modelToWorldMatrix"), 1, GL_TRUE, modelToWorldWall.m);
  DrawModel(wall, program, "in_Position", NULL, NULL);

	// draw a sphere.
	glUniform3fv(glGetUniformLocation(program, "in_Color"), 1, sphere_Color);
  glUniformMatrix4fv(glGetUniformLocation(program, "modelToWorldMatrix"), 1, GL_TRUE, modelToWorldSphere.m);
  DrawModel(sphere, program, "in_Position", NULL, NULL);
	glutSwapBuffers();

}

// TODO: is this the proper way to use timer?
void timer(int arg)
{
	glutPostRedisplay();
	glutTimerFunc(20, timer, 0);
}


int main(int argc, char *argv[])
{
	glutInit(&argc, argv);
	glutInitContextVersion(3, 2);
	glutInitWindowSize (window_Width, window_Height);
	glutCreateWindow ("Ray Tracer");
	glutDisplayFunc(display);
	glutTimerFunc(20, timer, 0);
	init ();
	glutMainLoop();
	return 0;
}
