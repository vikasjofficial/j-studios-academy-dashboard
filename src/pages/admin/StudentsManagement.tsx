
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateStudentForm } from '@/components/students/create-student-form';
import { StudentsList } from '@/components/students/students-list';
import { UserPlus, Users } from 'lucide-react';

export default function StudentsManagement() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Students Management</h1>
        <p className="text-muted-foreground">Create and manage student profiles.</p>
      </div>

      <Tabs defaultValue="list" className="space-y-4">
        <TabsList>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students List
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Student
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Students</CardTitle>
            </CardHeader>
            <CardContent>
              <StudentsList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create New Student</CardTitle>
            </CardHeader>
            <CardContent>
              <CreateStudentForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
