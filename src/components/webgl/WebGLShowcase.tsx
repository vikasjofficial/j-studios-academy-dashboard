
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SpinningCube from './SpinningCube';
import FloatingObjects from './FloatingObjects';

export default function WebGLShowcase() {
  return (
    <div className="space-y-6 my-6">
      <h2 className="text-3xl font-semibold tracking-tight">WebGL Effects</h2>
      <p className="text-muted-foreground">
        Interactive 3D graphics powered by WebGL and Three.js
      </p>
      
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Spinning Cube</CardTitle>
            <CardDescription>
              A simple interactive 3D cube with orbit controls
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SpinningCube />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Floating Objects</CardTitle>
            <CardDescription>
              Multiple interactive 3D objects with physics-based animation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FloatingObjects />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
