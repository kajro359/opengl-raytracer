#version 150

out vec4 out_Color;
in vec3 p0, u;
vec3 v;

struct Ray
{
  vec3 p0;
  vec3 u;
};

struct Sphere
{
  vec3 c;
  float r;
  vec3 color;
  float refr_ind;
  float ks;
  float kd;
};

struct Plane
{
    vec3 n;
    vec3 p;
    vec3 color;
    float ks;
    float kd;
};

struct Intersection
{
  float t;
  vec3 p;   // point of intersection
  vec3 n;   // normal of surface
  int hit;
  vec3 color;
  int refract;
  float ks;
  float kd;
};

vec3 trace()
{
    return vec3(0);
}

void intersectSphere(Sphere sphere, inout Ray ray, inout Intersection i)
{
  // vec3 firstray = ray.p0 - sphere.c;
  // float B = dot(firstray, ray.u);
  // float C = dot(firstray, firstray) - (sphere.r * sphere.r);
  // float D = B * B - C;
  vec3 D = normalize(ray.u);
  vec3 L = ray.p0 - sphere.c;
  float a = dot(D, D);
  //float a = 1;
  float b = 2 * dot(D, L);
  float c = dot(L, L) - sphere.r * sphere.r;

  float discriminant = b*b - 4 * a * c;

  if(discriminant >= 0.0)
  {
    float t = 0;
    float temp;
    // float t0 = -B - sqrt(D);
    // float t1 = -B + sqrt(D);
    float t0 = (-b - sqrt(discriminant)) / (2.0*a);
    float t1 = (-b + sqrt(discriminant)) / (2.0*a);
    if(t0 > t1)
    {
      temp = t0;
      t0 = t1;
      t1 = temp;
    }
    if(t0 < 0)
    {
      t0 = t1;
    }
    t = t0;
    if ((t > 0.0) && (t < i.t))
    {
      i.t = t;
      i.hit = 1;
      i.ks = sphere.ks;
      i.kd = sphere.kd;
      if(sphere.refr_ind != 0.0)
      {
        i.refract = 1;
      }
      // calc point of intersection
      vec3 p = vec3
        (
          ray.p0.x + t * ray.u.x,
          ray.p0.y + t * ray.u.y,
          ray.p0.z + t * ray.u.z
        );

      // calc normal
      vec3 n = p - sphere.c;
      i.n = normalize(n);
      i.p = p;
      i.color = sphere.color;
    }
  }
}

void intersectPlane(Plane plane, inout Ray ray, inout Intersection i)
{
  float d = -dot(plane.p, plane.n);
  float v = dot(ray.u, plane.n);

  if(abs(v) < 1.0e-6)
    return;

  float t = -(dot(ray.p0, plane.n) + d) / v;

  if ((t > 0.0) && (t < i.t))
  {
    i.hit = 1;
    i.t = t;
    i.n = plane.n;
    i.refract = 0; // not transparent plane.
    i.ks = plane.ks;
    i.kd = plane.kd;
    vec3 p = vec3
      (
        ray.p0.x + t * ray.u.x,
        ray.p0.y + t * ray.u.y,
        ray.p0.z + t * ray.u.z
      );
    i.p = p;
    float offset = 0.3;
    vec3 dp = p + offset;
    if((mod(dp.x, 1.0) > 0.5 && mod(dp.z, 1.0) > 0.5) ||
      (mod(dp.x, 1.0) < 0.5 && mod(dp.z, 1.0) < 0.5))
      i.color = plane.color;
    else
      i.color = plane.color * 0.5;
  }
}

vec3 refract(Ray ray, Intersection i, Sphere sphere)
{
  vec3 in_vec = normalize(ray.u);
  vec3 normal = i.n;

  float eta;
  float refr_ind1 = 1;
  float refr_ind2 = sphere.refr_ind;
  float c1 = dot(normal, in_vec);
  if(c1 > 0) //inside thing
    eta = refr_ind2 / refr_ind1;
  else
    eta = refr_ind1 / refr_ind2;

  float c2 = sqrt(1 - pow(eta, 2) * (1 - pow(c1, 2)));
  vec3 t = eta * (in_vec + c1 * normal) - normal * c2;
  return t;
}

Sphere sphere[3];
Plane plane;
void intersect(Ray r, inout Intersection i)
{
  // call intersection funcitons for all shapes in scene
  for(int j = 0; j < 3; j++)
  {
    intersectSphere(sphere[j], r, i);
  }
  intersectPlane(plane, r, i);
}

vec3 shading(in Intersection i)
{
  vec3 lightDir = normalize(vec3(1,1,1));

  // TODO: optimize
  float epsilon = 1.0e-4;
  Ray shadowray;
  shadowray.p0 = i.p + i.n * epsilon;
  shadowray.u = lightDir;
  Intersection shai;
  shai.hit = 0;
  shai.t = 1.0e+30;
  shai.n = shai.p = shai.color = vec3(0);
  intersect(shadowray, shai);
  float shadow = 1;
  if(shai.hit == 1)
    //return vec3(0); //if shadowray hits object return 0
    shadow = 0.3;


  // float ks = 0.9;
  // float kd = 0.9;
  float ks = i.ks;
  float kd = i.kd;
  float ka = 0;
  vec3 viewDir = -normalize(i.p);
  float diffuse = kd * max(0.0, dot(i.n, lightDir));
  vec3 r = 2 * i.n * dot(lightDir, i.n) - lightDir;
  float rv = max(0.0, dot(normalize(r),viewDir));
  float specular = ks * pow(rv, 100);
  return vec3((specular + diffuse) * shadow);

}
// set demo to
// 0 to show first implementation
int demo = 1;
void main(void)
{
    if(demo == 0){
      v = normalize(vec3(u.x, u.y, -1.0));
      out_Color = vec4(v,1);
    }

    else if(demo == 1){

      sphere[0].c = vec3(0.0, 0.0, -2.0);
      sphere[0].r = 0.5;
      sphere[0].color = vec3(1, 1, 1);
      sphere[0].refr_ind = 1.5; // crown glass refractive index == 1.52
      sphere[0].ks = 1;
      sphere[0].kd = 0;

      sphere[1].c = vec3(1, 0.1, -2);
      sphere[1].r = 0.5;
      sphere[1].color = vec3(0.3, 0.5, 0.2);
      sphere[1].refr_ind = 0.0; // crown glass refractive index == 1.52
      sphere[1].ks = 1;
      sphere[1].kd = 0;

      sphere[2].c = vec3(0, 0.7, -1.5);
      sphere[2].r = 0.2;
      sphere[2].color = vec3(0.9,0.9,1);
      sphere[2].refr_ind = 0.0; // crown glass refractive index == 1.52
      sphere[2].ks = 0;
      sphere[2].kd = 1;

      plane.n = vec3(0.0, 1.0, 0.0);
      plane.p = vec3(0.0, -0.5, 0.0);
      plane.color = vec3(1.0, 1.0, 1.0);
      plane.ks = 0.9;
      plane.kd = 0.9;

      Ray ray;
      ray.p0 = p0;
      ray.u = normalize(u);
      const int depth = 5;
      float epsilon = 1.0e-4;
      vec4 color = vec4(0, 0, 0, 1);
      vec3 bcolor = vec3(1);
      for(int j = 0; j < depth; j++)
      {
        Intersection i;
        i.hit = 0;
        i.t = 1.0e+30;
        i.n = vec3(0);
        i.p = vec3(0);
        i.color = vec3(0);
        i.refract = 0;
        i.ks = 0.5;
        i.kd = 0.5;

        intersect(ray, i);

        if (i.hit != 0)
        {
          color.rgb += bcolor * i.color * shading(i);
          bcolor *= i.color;
        }
        else
        {
          break;
        }
        if(i.kd == 1.0)
          break;
        ray.p0 = vec3
          (
            i.p.x + epsilon * i.n.x,
            i.p.y + epsilon * i.n.y,
            i.p.z + epsilon * i.n.z
          );

        if(i.refract == 1)
          ray.u = refract(ray, i, sphere[0]);
        else
          ray.u = reflect(ray.u, i.n);

        ray.p0 += epsilon * ray.u;
        }
        out_Color = color;
    }
}
