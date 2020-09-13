#ifdef __APPLE__
	#include <OpenGL/gl3.h>
	// Linking hint for Lightweight IDE
	// uses framework Cocoa
#endif

#include <math.h>
#include <stdio.h>

#include "MicroGlut.h"
#include "GL_utilities.h"
#include "VectorUtils3.h"
#include "loadobj.h"

GLuint program;
GLint width = 600;
GLint height = 600;
GLfloat aspectratio;

GLfloat vertices1[] =
{
	-1.0f,-1.0f,0.0f,
	-1.0f, 1.0f,0.0f,
	 1.0f,-1.0f,0.0f
};

GLfloat vertices2[] =
{
	 1.0f, 1.0f,0.0f,
	-1.0f, 1.0f,0.0f,
	 1.0f,-1.0f,0.0f
};

// vertex array object
unsigned int vertexArrayObjID1;
unsigned int vertexArrayObjID2;

void init(void)
{

  dumpInfo();
  glClearColor(0.2,0.5,0.2,1);
	glDisable(GL_DEPTH_TEST);

  glutInitDisplayMode(GLUT_RGB | GLUT_DOUBLE | GLUT_DEPTH);

	program = loadShaders("shader.vert", "shader.frag");
	glUseProgram(program);
	printError("init shader");
	aspectratio = (GLfloat)width / (GLfloat)height;

	glUniform1f(glGetUniformLocation(program, "aspectratio"), aspectratio);

	// vertex buffer object, used for uploading the geometry
	unsigned int vertexBufferObjID1, vertexBufferObjID2;

	// Object 1 upload
	// Allocate and activate Vertex Array Object 1
	glGenVertexArrays(1, &vertexArrayObjID1);
	glBindVertexArray(vertexArrayObjID1);
	// Allocate Vertex Buffer Objects
	glGenBuffers(1, &vertexBufferObjID1);

	// VBO for vertex data
	glBindBuffer(GL_ARRAY_BUFFER, vertexBufferObjID1);
	glBufferData(GL_ARRAY_BUFFER, 9*sizeof(GLfloat), vertices1, GL_STATIC_DRAW);
	glVertexAttribPointer(glGetAttribLocation(program, "in_Position"), 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(glGetAttribLocation(program, "in_Position"));

	// Object 2 upload
	// Allocate and activate Vertex Array Object 2
	glGenVertexArrays(1, &vertexArrayObjID2);
	glBindVertexArray(vertexArrayObjID2);
	// Allocate Vertex Buffer Objects
	glGenBuffers(1, &vertexBufferObjID2);

	// VBO for vertex data
	glBindBuffer(GL_ARRAY_BUFFER, vertexBufferObjID2);
	glBufferData(GL_ARRAY_BUFFER, 9*sizeof(GLfloat), vertices2, GL_STATIC_DRAW);
	glVertexAttribPointer(glGetAttribLocation(program, "in_Position"), 3, GL_FLOAT, GL_FALSE, 0, 0);
	glEnableVertexAttribArray(glGetAttribLocation(program, "in_Position"));

	printError("init arrays");

}

void display(void)
{
	glClear(GL_COLOR_BUFFER_BIT);

	glBindVertexArray(vertexArrayObjID1);	// Select VAO
	glDrawArrays(GL_TRIANGLES, 0, 3);	// draw object

	glBindVertexArray(vertexArrayObjID2);	// Select VAO
	glDrawArrays(GL_TRIANGLES, 0, 3);	// draw object

	printError("display");

  glutSwapBuffers();
}

int main(int argc, char *argv[])
{
	glutInit(&argc, argv);
	glutInitContextVersion(3, 2);
	glutInitWindowSize(width, height);
	glutCreateWindow("Ray Tracer");
	glutDisplayFunc(display);
	init();
	glutMainLoop();
	return 0;
}
