import { prisma } from "@/lib/prisma";
import { CheckSquare, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default async function TasksPage() {
  const tasks = await prisma.task.findMany({
    orderBy: { dueDate: "asc" },
    include: {
      customer: true,
      lead: true,
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Tasks & Follow-ups</h1>
        <button className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Add Task
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600"><CheckSquare className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-indigo-900">12</div>
              <div className="text-sm font-medium text-indigo-600">Tasks Due Today</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600"><AlertCircle className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-red-900">5</div>
              <div className="text-sm font-medium text-red-600">Overdue Follow-ups</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-100">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600"><Clock className="w-6 h-6" /></div>
            <div>
              <div className="text-2xl font-bold text-green-900">24</div>
              <div className="text-sm font-medium text-green-600">Upcoming This Week</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-y text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Task</th>
                <th className="px-6 py-3 font-medium">Related To</th>
                <th className="px-6 py-3 font-medium">Due Date</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    No tasks found.
                  </td>
                </tr>
              ) : (
                tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">{task.title}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {task.customer?.name || task.lead?.name || "-"}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No Date"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        task.priority === 'HIGH' ? 'bg-red-50 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-700">
                        {task.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
